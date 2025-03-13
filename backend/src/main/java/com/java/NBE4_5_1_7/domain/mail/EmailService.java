package com.java.NBE4_5_1_7.domain.mail;

import java.util.concurrent.ScheduledFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

	private final JavaMailSender mailSender;
	private final SpringTemplateEngine templateEngine;
	private final TaskScheduler taskScheduler;

	@Value("${mail.username}")
	private String fromEmail; // 보내는 이메일 주소

	@Value("${admin.email}")
	private String adminEmail; // 관리자의 이메일 주소

	@Async("asyncExecutor")
	public void sendChatNotification(String sender, String messageContent, String timestamp) {
		if (!"USER".equals(sender)) {
			return; // 사용자가 보낸 메시지만 처리
		}

		// 스레드 블로킹 없이 동작
		ScheduledFuture<?> scheduledFuture = taskScheduler.schedule(() -> {
			try {
				Thread.sleep(2000);

				Context context = new Context();
				context.setVariable("sender", sender);
				context.setVariable("content", messageContent);
				context.setVariable("timestamp", timestamp);
				String htmlBody = templateEngine.process("email-template", context);

				MimeMessage mimeMessage = mailSender.createMimeMessage();
				MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);
				messageHelper.setFrom(fromEmail);
				messageHelper.setTo(adminEmail);
				messageHelper.setSubject("[DevPrep] 새로운 고객센터 문의가 도착했습니다.");
				messageHelper.setText(htmlBody, true);

				mailSender.send(mimeMessage);
			} catch (MessagingException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
		}, new java.util.Date(System.currentTimeMillis() + 2000));
	}
}