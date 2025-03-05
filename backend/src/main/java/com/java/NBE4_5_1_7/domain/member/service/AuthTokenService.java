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
    private int expireSeconds;

    public String genAccessToken(Member member) {
        return Ut.Jwt.createToken(
                keyString,
                expireSeconds,
                Map.of("id", member.getId(), "username", member.getUsername(), "nickname", member.getNickname())
        );
    }

    public Map<String, Object> getPayload(String token) {
        // UT.Jwt.getPayload 내부에서 ExpiredJwtException은 catch되어 null을 반환함
        return Ut.Jwt.getPayload(keyString, token);
    }
}
