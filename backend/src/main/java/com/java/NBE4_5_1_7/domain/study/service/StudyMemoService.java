package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import com.java.NBE4_5_1_7.domain.study.repository.StudyContentRepository;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoRepository;
import com.java.NBE4_5_1_7.global.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudyMemoService {
    private final StudyMemoRepository studyMemoRepository;
    private final StudyContentRepository studyContentRepository;
    private final Rq rq;

    // 멤버, 학습 컨텐츠 ID, 메모 내용 저장
    public void createStudyMemo(String studyMemoContent, Long studyContentId) {
//        Member member = rq.getActor();
        StudyContent studyContent = studyContentRepository.findById(studyContentId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 학습 컨텐츠 입니다."));
        StudyMemo studyMemo = new StudyMemo(studyMemoContent, studyContent);
        studyMemoRepository.save(studyMemo);
    }
}
