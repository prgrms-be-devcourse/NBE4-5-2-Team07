package com.java.NBE4_5_1_7.domain.member.controller;

import com.java.NBE4_5_1_7.domain.member.dto.MemberDto;
import com.java.NBE4_5_1_7.domain.member.dto.MemberInfoResponseDto;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.global.Rq;
import com.java.NBE4_5_1_7.global.dto.Empty;
import com.java.NBE4_5_1_7.global.dto.RsData;
import com.java.NBE4_5_1_7.global.exception.ServiceException;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final Rq rq;
    private final MemberService memberService;

    @DeleteMapping("/logout")
    public RsData<Empty> logout(HttpServletResponse response) {
        return new RsData<>("200-1", "로그아웃이 완료되었습니다.", new Empty());
    }

    @GetMapping("/me")
    public RsData<MemberDto> me() {

        Member actor = rq.getActor();
        Member realActor = rq.getRealActor(actor);

        return new RsData<>(
                "200-1",
                "내 정보 조회가 완료되었습니다.",
                new MemberDto(realActor)
        );
    }

    @GetMapping("/role")
    public ResponseEntity<String> changeRoleToAdmin(Long id) {
        return ResponseEntity.ok(memberService.changeRole(id));
    }
}
