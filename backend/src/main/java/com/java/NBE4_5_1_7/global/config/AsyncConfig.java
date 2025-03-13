package com.java.NBE4_5_1_7.global.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

	@Bean(name = "asyncExecutor")
	public Executor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(5); // 코어 스레드 개수 (기본적으로 항상 실행됨)
		executor.setMaxPoolSize(10); // 최대 스레드 개수
		executor.setQueueCapacity(50); // 작업 큐 크기 (대기 중인 작업 수)
		executor.setThreadNamePrefix("AsyncThread-"); // 스레드 이름 설정
		executor.initialize();
		return executor;
	}
}
