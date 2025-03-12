package com.java.NBE4_5_1_7.global.customAnnotation;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.entity.SubscriptionPlan;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import org.springframework.dao.PermissionDeniedDataAccessException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionPlanChecker {

    private final MemberService memberService;

    public SubscriptionPlanChecker(MemberService memberService) {
        this.memberService = memberService;
    }

    public boolean hasPremiumAccess() {
        // MemberService를 이용해 현재 요청한 사용자(Member) 조회
        Member member = memberService.getMemberFromRq();
        // PREMIUM 사용자가 아니라면 403 에러를 발생시킵니다.
        if (member.getSubscriptionPlan() != SubscriptionPlan.PREMIUM) {
            throw new AccessDeniedException("FREE 사용자는 접근할 수 없습니다.");
        }
        return true;
    }
}

