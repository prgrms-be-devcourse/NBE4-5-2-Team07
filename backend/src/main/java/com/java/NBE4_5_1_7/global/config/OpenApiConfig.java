package com.java.NBE4_5_1_7.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // "CookieAuth" 이름으로 보안 스키마를 추가합니다.
        SecurityScheme cookieAuthScheme = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.COOKIE)
                .name("access_token");

        return new OpenAPI()
                .components(new Components().addSecuritySchemes("CookieAuth", cookieAuthScheme))
                .addSecurityItem(new SecurityRequirement().addList("CookieAuth"));
    }
}
