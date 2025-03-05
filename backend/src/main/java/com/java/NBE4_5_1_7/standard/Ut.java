package com.java.NBE4_5_1_7.standard;

import com.java.NBE4_5_1_7.global.app.AppConfig;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

public class Ut {
    public static class Json {
        private static final ObjectMapper objectMapper = AppConfig.getObjectMapper();

        public static String toString(Object obj) {
            try {
                return objectMapper.writeValueAsString(obj);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public static class Jwt {
        public static String createToken(String keyString, int expireSeconds, Map<String, Object> claims) {
            SecretKey secretKey = Keys.hmacShaKeyFor(keyString.getBytes());
            Date issuedAt = new Date();
            Date expiration = new Date(issuedAt.getTime() + 1000L * expireSeconds);

            String jwt = Jwts.builder()
                    .claims(claims)
                    .issuedAt(issuedAt)
                    .expiration(expiration)
                    .signWith(secretKey)
                    .compact();

            return jwt;
        }

        public static boolean isValidToken(String keyString, String token) {
            try {
                SecretKey secretKey = Keys.hmacShaKeyFor(keyString.getBytes());
                // 만료된 토큰일 경우 예외가 발생하지만, 여기서 catch되어 false를 반환합니다.
                Jwts.parser().verifyWith(secretKey).build().parse(token);
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
            return true;
        }

        @SuppressWarnings("unchecked")
        public static Map<String, Object> getPayload(String keyString, String jwtStr) {
            SecretKey secretKey = Keys.hmacShaKeyFor(keyString.getBytes());
            try {
                // 토큰을 파싱하여 payload를 반환합니다.
                return (Map<String, Object>) Jwts.parser()
                        .verifyWith(secretKey)
                        .build()
                        .parse(jwtStr)
                        .getPayload();
            } catch (ExpiredJwtException e) {
                // 토큰이 만료된 경우 null을 반환하여 상위 로직에서 refresh 처리를 하도록 함
                return null;
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
    }
}
