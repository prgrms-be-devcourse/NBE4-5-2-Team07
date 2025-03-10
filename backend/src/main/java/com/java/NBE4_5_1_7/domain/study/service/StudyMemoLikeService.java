package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemoLike;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoLikeRepository;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudyMemoLikeService {
    private final StudyMemoLikeRepository studyMemoLikeRepository;
    private final StudyMemoRepository studyMemoRepository;
    private final MemberService memberService;

    public void addLike(Long studyMemoId) {
        Member member = memberService.getMemberFromRq();
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId).orElse(null);
        studyMemoLikeRepository.save(new StudyMemoLike(member, studyMemo));
    }

    public void deleteLike(Long studyMemoId) {
        studyMemoLikeRepository.deleteById(Math.toIntExact(studyMemoId));
    }

    public int getLikeCount(Long studyMemoId) {
        return studyMemoLikeRepository.countByStudyMemoId(studyMemoId);
    }
}
