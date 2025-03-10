package com.java.NBE4_5_1_7.domain.community.post.repository;

import com.java.NBE4_5_1_7.domain.community.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
