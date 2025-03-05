package com.java.NBE4_5_1_7.domain.member.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.standard.Ut;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    @Value("${custom.jwt.secret-key}")
    private String keyString;

    @Value("${custom.jwt.expire-seconds}")
    private int expireSeconds; // Access Token 만료시간 (예: 60초)

    @Value("${custom.jwt.refresh-expire-seconds}")
    private int refreshExpireSeconds; // Refresh Token 만료시간 (예: 3600초 = 1시간)

    public String genAccessToken(Member member) {
        return Ut.Jwt.createToken(
                keyString,
                expireSeconds,
                Map.of("id", member.getId(), "username", member.getUsername(), "nickname", member.getNickname())
        );
    }

    public String genRefreshToken(Member member) {
        return Ut.Jwt.createToken(
                keyString,
                refreshExpireSeconds,
                Map.of("id", member.getId(), "type", "refresh")
        );
    }

    public Map<String, Object> getPayload(String token) {
        return Ut.Jwt.getPayload(keyString, token);
    }

    public Map<String, Object> getRefreshPayload(String token) {
        return Ut.Jwt.getPayload(keyString, token);
    }
}
