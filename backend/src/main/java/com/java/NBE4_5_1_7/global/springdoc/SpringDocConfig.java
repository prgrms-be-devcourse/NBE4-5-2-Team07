package com.team1.beanstore.global.springdoc;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(title = "GCcoffee API", version = "1.0", description = "GCcoffee API 문서")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT 인증을 위한 Bearer Token 헤더 (관리자 API 전용)"
)
public class SpringDocConfig {

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("전체 API")
                .pathsToMatch("/GCcoffee/**")
                .build();
    }

    @Bean
    public GroupedOpenApi productApi() {
        return GroupedOpenApi.builder()
                .group("상품 API")
                .pathsToMatch("/GCcoffee/items/**")
                .build();
    }

    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
                .group("주문 API")
                .pathsToMatch("/GCcoffee/orders/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminAuthApi() {
        return GroupedOpenApi.builder()
                .group("관리자 인증 API")
                .pathsToMatch("/GCcoffee/admin/login")
                .build();
    }

    @Bean
    public GroupedOpenApi adminProductApi() {
        return GroupedOpenApi.builder()
                .group("관리자 상품 API")
                .pathsToMatch("/GCcoffee/admin/item/**", "/GCcoffee/admin/items/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminOrderApi() {
        return GroupedOpenApi.builder()
                .group("관리자 주문 API")
                .pathsToMatch("/GCcoffee/admin/orders/**")
                .build();
    }
}