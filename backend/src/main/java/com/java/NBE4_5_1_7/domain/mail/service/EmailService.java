package com.java.NBE4_5_1_7.domain.mail.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

	@Value("${mail.username}")
	private String fromEmail; // 보내는 이메일 주소

	@Value("${admin.email}")
	private String adminEmail; // 관리자의 이메일 주소

	public void sendChatNotification(String sender, String messageContent, String timestamp) {
		try {
			Context context = new Context();
			context.setVariable("sender", sender);
			context.setVariable("content", messageContent);
			context.setVariable("timestamp", timestamp);
			String htmlBody = templateEngine.process("email-template", context);

			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true);
			messageHelper.setFrom(fromEmail);
			messageHelper.setTo(adminEmail);
			messageHelper.setSubject("[알림] 새로운 사용자 채팅이 도착했습니다");
			messageHelper.setText(htmlBody, true); // HTML 텍스트로 설정
			// 메일 전송
			mailSender.send(mimeMessage);
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}
}