package com.java.NBE4_5_1_7.global.config;

import com.java.NBE4_5_1_7.domain.chat.model.Message;
import com.java.NBE4_5_1_7.domain.chat.service.ChatPublisher;
import com.java.NBE4_5_1_7.domain.chat.service.ChatSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.nio.charset.StandardCharsets;

@Configuration
public class RedisConfig {

    private final ChatSubscriber chatSubscriber;
    private final ChatPublisher chatPublisher;

    public RedisConfig(ChatSubscriber chatSubscriber, @Lazy ChatPublisher chatPublisher) {
        this.chatSubscriber = chatSubscriber;
        this.chatPublisher = chatPublisher;
    }

    // RedisTemplate을 생성하여 Redis와 데이터를 송수신할 수 있도록 설정
    @Bean
    public RedisTemplate<String, Message> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Message> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }

    // Redis Pub/Sub을 구독하여 유저와 관리자 메시지를 처리하는 리스너 설정
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // 유저 메시지를 구독하여 WebSocket을 통해 관리자에게 전달
        container.addMessageListener((message, pattern) -> {
            String channel = new String(message.getChannel(), StandardCharsets.UTF_8);
            String messageContent = new String(message.getBody(), StandardCharsets.UTF_8);
            if (channel.startsWith("chat:")) {
                chatSubscriber.receiveMessage(messageContent, channel);
            } else if (channel.startsWith("admin:chat:")) {
                chatPublisher.receiveAdminMessage(messageContent, channel);
            }
        }, new PatternTopic("chat:*"));

        // 관리자 메시지를 구독하여 WebSocket을 통해 유저에게 전달
        container.addMessageListener((message, pattern) -> {
            String channel = new String(message.getChannel(), StandardCharsets.UTF_8);
            String messageContent = new String(message.getBody(), StandardCharsets.UTF_8);
            System.out.println("✅ [RedisConfig] 관리자 메시지 수신 - 채널: " + channel + " | 메시지: " + messageContent);
            chatSubscriber.receiveAdminMessage(messageContent, channel); // ChatSubscriber가 직접 WebSocket으로 메시지 전송
        }, new PatternTopic("admin:chat:*"));

        return container;
    }
}