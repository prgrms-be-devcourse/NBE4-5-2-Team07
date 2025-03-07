package com.java.NBE4_5_1_7.domain.study.repository;

import java.util.List;

import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;

public interface StudyMemoRepository extends JpaRepository<StudyMemo, Long> {
	@Query("SELECT c FROM StudyMemo c JOIN c.studyContent ic " +
		"WHERE c.member = :member AND ic.firstCategory = :category")
	List<StudyMemo> findByMemberAndStudyContentCategory(@Param("member") Member member, @Param("category") FirstCategory category);

	StudyMemo findByMemberAndStudyContent(Member member, StudyContent studyContentId);
}
