package com.java.NBE4_5_1_7.global.security;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;
    private final MemberService memberService;

    record TokenPair(String accessToken, String refreshToken, String apiKey) { }

    // 쿠키에서 accessToken, refreshToken, apiKey 값을 읽어오는 메서드
    private TokenPair getTokensFromCookie() {
        String accessToken = rq.getValueFromCookie("accessToken");
        String refreshToken = rq.getValueFromCookie("refreshToken");
        String apiKey = rq.getValueFromCookie("apiKey");
        if (accessToken == null || refreshToken == null || apiKey == null) {
            return null;
        }
        return new TokenPair(accessToken, refreshToken, apiKey);
    }

    /**
     * Access Token을 이용해 회원 정보를 조회하고,
     * 만료되었으면 Refresh Token을 검증하여 새 Access Token을 발급하는 로직.
     */
    private Member getMemberByTokens(String accessToken, String refreshToken, String apiKey) {
        // 우선, Access Token으로 회원 조회
        Optional<Member> opAccMember = memberService.getMemberByAccessToken(accessToken);
        if (opAccMember.isPresent()) {
            return opAccMember.get();
        }
        // Access Token이 유효하지 않다면, Refresh Token을 검증합니다.
        // Refresh Token의 경우, payload에 "type"이 "refresh"여야 합니다.
        Map<String, Object> refreshPayload = memberService.getRefreshPayload(refreshToken); // 추가 메서드 (아래 MemberService에 설명)
        if (refreshPayload == null) {
            return null;
        }
        // Refresh Token이 유효하면, apiKey를 기준으로 회원 조회 후 새로운 Access Token 발급
        Optional<Member> opMember = memberService.findByApiKey(apiKey);
        if (opMember.isPresent()) {
            Member member = opMember.get();
            String newAccessToken = memberService.genAccessToken(member);
            rq.addCookie("accessToken", newAccessToken);
            return member;
        }
        return null;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String url = request.getRequestURI();
        if (List.of("/member/logout").contains(url)) {
            filterChain.doFilter(request, response);
            return;
        }

        TokenPair tokens = getTokensFromCookie();
        if (tokens == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Member actor = getMemberByTokens(tokens.accessToken, tokens.refreshToken, tokens.apiKey);
        if (actor == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Member freshActor = memberService.findById(actor.getId()).orElse(null);
        if (freshActor != null) {
            rq.setLogin(freshActor);
        } else {
            rq.setLogin(actor);
        }

        filterChain.doFilter(request, response);
    }
}
