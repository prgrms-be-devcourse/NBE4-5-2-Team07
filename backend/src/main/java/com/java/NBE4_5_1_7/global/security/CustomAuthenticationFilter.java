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
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;
    private final MemberService memberService;

    // 단순히 쿠키에서 accessToken, apiKey 값을 읽어오기 위한 record
    record AuthToken(String apiKey, String accessToken) { }

    // 쿠키에서 accessToken, apiKey 값을 읽어오는 메서드
    private AuthToken getAuthTokenFromCookie() {
        String accessToken = rq.getValueFromCookie("accessToken");
        String apiKey = rq.getValueFromCookie("apiKey");

        if (accessToken == null || apiKey == null) {
            return null;
        }

        return new AuthToken(apiKey, accessToken);
    }

    /**
     * 토큰 검증 시, MemberService.getMemberByAccessToken의 결과가 Optional.empty()이면,
     * apiKey를 이용해 회원을 조회하고 새 Access Token을 발급하여 쿠키에 저장하는 refresh 로직.
     */
    private Member getMemberByAccessTokenWithRefresh(String accessToken, String apiKey) {
        // 우선, 토큰 검증 결과를 받아온다.
        Optional<Member> opAccMember = memberService.getMemberByAccessToken(accessToken);
        if (opAccMember.isPresent()) {
            return opAccMember.get();
        }
        // 토큰이 만료되었거나 유효하지 않으면, apiKey를 기준으로 회원을 조회하고 새 토큰 발급
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
        // 특정 URL은 인증 필터를 우회합니다.
        if (List.of("/api/member/login", "/api/*/member/logout").contains(url)) {
            filterChain.doFilter(request, response);
            return;
        }

        AuthToken tokens = getAuthTokenFromCookie();
        if (tokens == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = tokens.apiKey;
        String accessToken = tokens.accessToken;

        Member actor = getMemberByAccessTokenWithRefresh(accessToken, apiKey);
        if (actor == null) {
            filterChain.doFilter(request, response);
            return;
        }

        rq.setLogin(actor);
        filterChain.doFilter(request, response);
    }
}
