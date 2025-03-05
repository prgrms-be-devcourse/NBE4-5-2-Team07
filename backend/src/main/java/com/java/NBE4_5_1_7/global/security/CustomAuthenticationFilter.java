package com.java.NBE4_5_1_7.global.security;


import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;
    private final MemberService memberService;

    private boolean isAuthorizationHeader() {
        String authorizationHeader = rq.getHeader("Authorization");

        if (authorizationHeader == null) {
            return false;
        }

        return authorizationHeader.startsWith("Bearer ");
    }

    record AuthToken(String apiKey, String accessToken) {
    }

    private AuthToken getAuthTokenFromRequest() {

        if (isAuthorizationHeader()) {

            String authorizationHeader = rq.getHeader("Authorization");
            String authToken = authorizationHeader.substring("Bearer ".length());

            String[] tokenBits = authToken.split(" ", 2);

            if (tokenBits.length < 2) {
                return null;
            }

            return new AuthToken(tokenBits[0], tokenBits[1]);
        }

        String accessToken = rq.getValueFromCookie("accessToken");
        String apiKey = rq.getValueFromCookie("apiKey");

        if (accessToken == null || apiKey == null) {
            return null;
        }

        return new AuthToken(apiKey, accessToken);

    }

    private Member getMemberByAccessToken(String accessToken, String apiKey) {

        Optional<Member> opAccMember = memberService.getMemberByAccessToken(accessToken);

        if (opAccMember.isPresent()) {
            return opAccMember.get();
        }

        Optional<Member> opRefMember = memberService.findByApiKey(apiKey);

        if(opRefMember.isEmpty()) {
            return null;
        }

        String newAccessToken = memberService.genAccessToken(opRefMember.get());
        rq.addCookie("accessToken", newAccessToken);
        rq.addCookie("apiKey", apiKey);

        return opRefMember.get();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String url = request.getRequestURI();

        if(List.of("/api/member/login", "/api/*/member/logout").contains(url)) {
            filterChain.doFilter(request, response);
            return;
        }

        AuthToken tokens = getAuthTokenFromRequest();

        if (tokens == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = tokens.apiKey;
        String accessToken = tokens.accessToken;

        Member actor = getMemberByAccessToken(accessToken, apiKey);

        if (actor == null) {
            filterChain.doFilter(request, response);
            return;
        }

        rq.setLogin(actor);
        filterChain.doFilter(request, response);
    }
}
