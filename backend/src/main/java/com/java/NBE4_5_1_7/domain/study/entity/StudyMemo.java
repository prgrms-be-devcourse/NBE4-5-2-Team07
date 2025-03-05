package com.java.NBE4_5_1_7.domain.study.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.global.entity.BaseEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Entity
@Data
@RequiredArgsConstructor
public class StudyMemo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studyContent_id")
    private StudyContent studyContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private String memoContent;

    public StudyMemo(String memoContent, StudyContent studyContent, Member member) {
        this.memoContent = memoContent;
        this.studyContent = studyContent;
        this.member = member;
    }
}
