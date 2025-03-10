package com.java.NBE4_5_1_7.domain.study.repository;

import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemoLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudyMemoLikeRepository extends JpaRepository<StudyMemoLike, Integer> {
    int countByStudyMemoId(Long studyMemoId);

    Optional<StudyMemoLike> findByStudyMemo(StudyMemo studyMemo);
}
