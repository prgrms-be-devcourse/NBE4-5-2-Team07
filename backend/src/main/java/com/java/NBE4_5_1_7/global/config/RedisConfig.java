package com.java.NBE4_5_1_7.global.config;

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

		container.addMessageListener((message, _) -> {
			String channel = new String(message.getChannel());
			String messageContent = new String(message.getBody());
			chatSubscriber.receiveMessage(messageContent, channel);
		}, new PatternTopic("chat:*"));

		return container;
	}
}