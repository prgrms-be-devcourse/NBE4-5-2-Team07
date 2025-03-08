package com.java.NBE4_5_1_7.domain.study.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@RequiredArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class StudyMemo extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studyContent_id")
    private StudyContent studyContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private String memoContent;

    private boolean isPublished;

    @CreatedDate
    @Column(updatable = false) // 생성 날짜는 수정되지 않도록 설정
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public StudyMemo(String memoContent, StudyContent studyContent, Member member, boolean isPublished) {
        this.memoContent = memoContent;
        this.studyContent = studyContent;
        this.member = member;
        this.isPublished = isPublished;
    }
}
