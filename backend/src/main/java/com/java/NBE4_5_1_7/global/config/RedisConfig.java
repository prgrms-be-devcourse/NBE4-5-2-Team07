package com.java.NBE4_5_1_7.global.config;

import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

import com.java.NBE4_5_1_7.domain.chat.service.ChatSubscriber;

@Configuration
public class RedisConfig {

	private final ChatSubscriber chatSubscriber;

	public RedisConfig(ChatSubscriber chatSubscriber) {
		this.chatSubscriber = chatSubscriber;
	}

	@Bean
	public RedisMessageListenerContainer redisMessageListenerContainer(RedisConnectionFactory connectionFactory) {
		RedisMessageListenerContainer container = new RedisMessageListenerContainer();
		container.setConnectionFactory(connectionFactory);

		// 채널 패턴에 맞는 메시지를 수신하면, 채팅 메시지를 처리하도록 설정
		container.addMessageListener((message, _) -> {
			String channel = new String(message.getChannel(), StandardCharsets.UTF_8);
			String messageContent = new String(message.getBody(), StandardCharsets.UTF_8);
			chatSubscriber.receiveMessage(messageContent, channel);
		}, new PatternTopic("chat:*"));

		return container;
	}
}