package com.java.NBE4_5_1_7;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class Nbe4517Application {

	public static void main(String[] args) {
		SpringApplication.run(Nbe4517Application.class, args);
	}

}
