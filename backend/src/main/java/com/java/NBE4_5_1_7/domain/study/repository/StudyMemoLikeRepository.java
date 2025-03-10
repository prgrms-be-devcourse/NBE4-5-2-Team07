package com.java.NBE4_5_1_7.domain.study.repository;

import com.java.NBE4_5_1_7.domain.study.entity.StudyMemoLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StudyMemoLikeRepository extends JpaRepository<StudyMemoLike, Integer> {
    @Query("SELECT COUNT(s) FROM StudyMemoLike s WHERE s.studyMemo.id = :studyMemoId AND s.studyMemo.isPublished = true")
    int countByStudyMemoId(Long studyMemoId);
}
