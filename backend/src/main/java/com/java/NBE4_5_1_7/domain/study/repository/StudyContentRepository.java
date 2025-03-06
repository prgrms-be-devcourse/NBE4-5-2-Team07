package com.java.NBE4_5_1_7.domain.study.repository;

import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudyContentRepository extends JpaRepository<StudyContent, Long> {

    @Query("SELECT DISTINCT s.firstCategory FROM StudyContent s")
    List<FirstCategory> findDistinctFirstCategories();

    @Query("SELECT DISTINCT s.secondCategory FROM StudyContent s WHERE s.firstCategory = :firstCategory")
    List<String> findDistinctBySecondCategory(FirstCategory firstCategory);

    Page<StudyContent> findByFirstCategoryAndSecondCategory(
            FirstCategory firstCategory, String secondCategory, Pageable pageable);
}
