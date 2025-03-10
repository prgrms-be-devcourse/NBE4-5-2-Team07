package com.java.NBE4_5_1_7.global;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.entity.Role;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import com.java.NBE4_5_1_7.global.security.SecurityUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

// Request, Response, Header
@Component
@RequiredArgsConstructor
@RequestScope
public class Rq {

    private final HttpServletRequest request;
    private final HttpServletResponse response;
    private final MemberService memberService;

    public void setLogin(Member actor) {
        // DB에서 최신 정보를 가져와 권한 정보 갱신
        Member freshActor = memberService.findById(actor.getId())
                .orElseThrow(() -> new ServiceException("401-3", "사용자 정보를 찾을 수 없습니다"));

        // 유저 정보 생성
        UserDetails user = new SecurityUser(freshActor.getId(), freshActor.getUsername(),
                freshActor.getNickname(), freshActor.getAuthorities());

        // 인증 정보 저장소
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
        );
    }

    public Member getActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ServiceException("401-2", "로그인이 필요합니다.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof SecurityUser) {
            SecurityUser user = (SecurityUser) principal;
            return memberService.findById(user.getId())
                    .orElseThrow(() -> new ServiceException("401-3", "인증 정보가 올바르지 않습니다"));
        }

        throw new ServiceException("401-3", "인증 정보가 올바르지 않습니다");
    }

    public String getValueFromCookie(String name) {
        Cookie[] cookies = request.getCookies();

        if(cookies == null) {
            return null;
        }

        for(Cookie cookie : cookies) {
            if(cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }

        return null;
    }

    public void addCookie(String name, String value) {
        Cookie accsessTokenCookie = new Cookie(name, value);

        accsessTokenCookie.setDomain("localhost");
        accsessTokenCookie.setPath("/");
        accsessTokenCookie.setHttpOnly(true);
        accsessTokenCookie.setSecure(true);
        accsessTokenCookie.setAttribute("SameSite", "Strict");

        response.addCookie(accsessTokenCookie);
    }

    public Member getRealActor(Member actor) {
        return memberService.findById(actor.getId()).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));
    }
}
