package com.java.NBE4_5_1_7.global.security;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final Rq rq;
    private final MemberService memberService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        HttpSession session = request.getSession();
        String redirectUrl = (String) session.getAttribute("redirectUrl");
        if (redirectUrl == null) {
            redirectUrl = "http://localhost:3000";
        }
        session.removeAttribute("redirectUrl");

        Member member = rq.getActor();
        String accessToken = memberService.genAccessToken(member);
        String refreshToken = memberService.genRefreshToken(member);

        rq.addCookie("accessToken", accessToken);
        rq.addCookie("refreshToken", refreshToken);
        rq.addCookie("apiKey", member.getApiKey());

        response.sendRedirect(redirectUrl);
    }
}
