package com.java.NBE4_5_1_7.global.app;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    public static boolean isNotProd() {
        return true;
    }

    @Getter
    public static ObjectMapper objectMapper;

    @Autowired
    public void setObjectMapper(ObjectMapper objectMapper) {
        AppConfig.objectMapper = objectMapper;
    }

    @Value("${uri.frontend}")
    private static String frontendUri;

    @Value("${uri.backend}")
    private static String backendUri;

    public static String getSiteFrontUrl() {
        return frontendUri;
    }

    public static String getSiteBackUrl() {
        return backendUri;
    }

}
