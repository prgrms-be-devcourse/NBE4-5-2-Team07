package com.java.NBE4_5_1_7.domain.member.service;


import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.standard.Ut;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthTokenServiceTest {

    @Autowired
    private AuthTokenService authTokenService;
    @Autowired
    private MemberService memberService;

    @Value("${custom.jwt.secret-key}")
    private String keyString;

    @Value("${custom.jwt.expire-seconds}")
    private int expireSeconds;

    @Test
    @DisplayName("AuthTokenService 생성")
    void init() {
        assertThat(authTokenService).isNotNull();
    }

    @Test
    @DisplayName("jwt 생성")
    void createToken() {
        Map<String, Object> originPayload = Map.of("name", "john", "age", 23);

        String jwtStr = Ut.Jwt.createToken(keyString, expireSeconds, originPayload);
        assertThat(jwtStr).isNotBlank();
        Map<String, Object> parsedPayload = Ut.Jwt.getPayload(keyString, jwtStr);

        assertThat(parsedPayload).containsAllEntriesOf(originPayload);
    }

}
