package com.java.NBE4_5_1_7.domain.member.scheduler;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.entity.SubscriptionPlan;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
@Transactional
public class SubscribeScheduler {
    private final MemberRepository memberRepository;

    @Scheduled(cron = "0 0 0  * * ?")
    public void updateMemberSubscriptionPlan() {
        List<Member> allMember = memberRepository.findAll();

        for (Member member : allMember) {
            if (member.getSubscribeEndDate().isAfter(LocalDateTime.now())) {
                member.setSubscriptionPlan(SubscriptionPlan.FREE);
                log.info("member Id : {}, member Nickname : {} : PREMIUM 기간 만료로 인해 FREE 로 변경되었습니다.", member.getId(), member.getNickname());
            }
        }
    }
}
