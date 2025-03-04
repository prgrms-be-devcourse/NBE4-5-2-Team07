package com.java.NBE4_5_1_7.domain.member.repository;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long>{
    Optional<Member> findByUsername(String username);
    Optional<Member> findByApiKey(String apiKey);
}