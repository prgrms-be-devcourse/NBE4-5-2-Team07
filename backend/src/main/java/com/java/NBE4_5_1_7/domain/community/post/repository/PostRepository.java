package com.java.NBE4_5_1_7.domain.community.post.repository;

import com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.entity.Post;
import com.java.NBE4_5_1_7.domain.community.like.entity.PostLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 필요한 필드만 조회 (postId, title, author.username, createdAt)
    @Query("SELECT new com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto(" +
            "p.postId, p.title, p.author.nickname, p.createdAt) " +
            "FROM Post p")
    Page<PostListResponseDto> findAllPostList(Pageable pageable);

    // 좋아요 수 내림차순 (많은 순)
    @Query("SELECT new com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto(" +
            "p.postId, p.title, p.author.nickname, p.createdAt) " +
            "FROM Post p " +
            "LEFT JOIN PostLike pl ON pl.post = p " +
            "GROUP BY p.postId, p.title, p.author.nickname, p.createdAt " +
            "ORDER BY COUNT(pl) DESC")
    Page<PostListResponseDto> findAllOrderByLikesDesc(Pageable pageable);

    // 좋아요 수 오름차순 (낮은 순)
    @Query("SELECT new com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto(" +
            "p.postId, p.title, p.author.nickname, p.createdAt) " +
            "FROM Post p " +
            "LEFT JOIN PostLike pl ON pl.post = p " +
            "GROUP BY p.postId, p.title, p.author.nickname, p.createdAt " +
            "ORDER BY COUNT(pl) ASC")
    Page<PostListResponseDto> findAllOrderByLikesAsc(Pageable pageable);

    // 댓글 수 내림차순 (많은 순)
    @Query("SELECT new com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto(" +
            "p.postId, p.title, p.author.nickname, p.createdAt) " +
            "FROM Post p " +
            "LEFT JOIN p.comments c " +
            "GROUP BY p.postId, p.title, p.author.nickname, p.createdAt " +
            "ORDER BY COUNT(c) DESC")
    Page<PostListResponseDto> findAllOrderByCommentsDesc(Pageable pageable);

    // 댓글 수 오름차순 (낮은 순)
    @Query("SELECT new com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto(" +
            "p.postId, p.title, p.author.nickname, p.createdAt) " +
            "FROM Post p " +
            "LEFT JOIN p.comments c " +
            "GROUP BY p.postId, p.title, p.author.nickname, p.createdAt " +
            "ORDER BY COUNT(c) ASC")
    Page<PostListResponseDto> findAllOrderByCommentsAsc(Pageable pageable);

    // 최근 등록순 (최신순: 등록일 내림차순)
    @Query("SELECT new com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto(" +
            "p.postId, p.title, p.author.nickname, p.createdAt) " +
            "FROM Post p " +
            "ORDER BY p.createdAt DESC")
    Page<PostListResponseDto> findAllOrderByCreatedAtDesc(Pageable pageable);
}
