package com.java.NBE4_5_1_7.domain.member.dto;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import lombok.Getter;
import org.springframework.lang.NonNull;

@Getter
public class MemberDto {
    @NonNull
    private long id;
    @NonNull
    private String nickname;
    @NonNull
    private String profileImgUrl;
    @NonNull
    private String subscriptPlan;

    public MemberDto(Member member) {
        this.id = member.getId();
        this.nickname = member.getNickname();
        this.profileImgUrl = member.getProfileImgUrlOrDefaultUrl();
        this.subscriptPlan = member.getSubscriptionPlan().toString();
    }
}
