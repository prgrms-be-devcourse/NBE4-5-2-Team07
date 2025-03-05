package com.java.NBE4_5_1_7.domain.member.controller;

import com.java.NBE4_5_1_7.domain.member.dto.MemberDto;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import com.java.NBE4_5_1_7.global.dto.Empty;
import com.java.NBE4_5_1_7.global.dto.RsData;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final Rq rq;
    private final MemberService memberService;

    record LoginReqBody(@NotBlank String username, @NotBlank String password) {}
    record LoginResBody(@NonNull MemberDto item, @NonNull String apiKey, @NonNull String accessToken) {}

    @PostMapping("/login")
    public RsData<LoginResBody> login(@RequestBody @Valid LoginReqBody reqBody, HttpServletResponse response) {

        Member member = memberService.findByUsername(reqBody.username()).orElseThrow(
                () -> new ServiceException("401-1", "잘못된 아이디입니다.")
        );

        String accessToken = memberService.genAccessToken(member);

        rq.addCookie("accessToken", accessToken);
        rq.addCookie("apiKey", member.getApiKey());

        return new RsData<>(
                "200-1",
                "%s님 환영합니다.".formatted(member.getNickname()),
                new LoginResBody(
                        new MemberDto(member),
                        member.getApiKey(),
                        accessToken
                )
        );
    }

    @DeleteMapping("/logout")
    public RsData<Empty> logout(HttpSession session) {

        rq.removeCookie("accessToken");
        rq.removeCookie("apiKey");

        return new RsData<>("200-1", "로그아웃 되었습니다.");
    }

}
