package com.java.NBE4_5_1_7.domain.community.like.repository;

import com.java.NBE4_5_1_7.domain.community.like.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Integer countByPostPostId(Long postId);
}
