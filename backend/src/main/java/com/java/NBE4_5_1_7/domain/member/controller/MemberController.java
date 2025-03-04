package com.java.NBE4_5_1_7.domain.member.controller;

import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import com.java.NBE4_5_1_7.global.dto.Empty;
import com.java.NBE4_5_1_7.global.dto.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MemberController {

    private final Rq rq;
    private final MemberService memberService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestParam String redirectUrl, HttpServletRequest request) {
        // OAuth2 로그인으로 리다이렉트합니다.
        // redirectUrl을 세션에 저장합니다.
        HttpSession session = request.getSession();
        session.setAttribute("redirectUrl", redirectUrl);

        return ResponseEntity.ok(Map.of("message", "로그인 중"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        // 세션 무효화
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // SecurityContext 클리어
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

}
