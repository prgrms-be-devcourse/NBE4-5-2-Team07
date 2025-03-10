package com.java.NBE4_5_1_7.domain.study.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Data
@RequiredArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class StudyMemoLike extends BaseEntity {

    @JoinColumn(name = "member_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    @JoinColumn(name = "studyMemo_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private StudyMemo studyMemo;

    public StudyMemoLike(Member member, StudyMemo studyMemo) {
        this.member = member;
        this.studyMemo = studyMemo;
    }
}
