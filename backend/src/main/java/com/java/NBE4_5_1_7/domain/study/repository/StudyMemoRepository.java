package com.java.NBE4_5_1_7.domain.study.repository;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.study.entity.FirstCategory;
import com.java.NBE4_5_1_7.domain.study.entity.StudyContent;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudyMemoRepository extends JpaRepository<StudyMemo, Long> {
	@Query("SELECT c FROM StudyMemo c JOIN c.studyContent ic " +
		"WHERE c.member = :member AND ic.firstCategory = :category")
	List<StudyMemo> findByMemberAndStudyContentCategory(@Param("member") Member member, @Param("category") FirstCategory category);

	@Query("SELECT s FROM StudyMemo s WHERE s.studyContent = :studyContent AND s.isPublished = true")
	List<StudyMemo> findByStudyContent(StudyContent studyContent);


	StudyMemo findByMemberAndStudyContent(Member member, StudyContent studyContentId);
}
