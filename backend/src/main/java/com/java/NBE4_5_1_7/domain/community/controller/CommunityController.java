package com.java.NBE4_5_1_7.domain.community.controller;

import com.java.NBE4_5_1_7.domain.community.comment.dto.AddCommentRequestDto;
import com.java.NBE4_5_1_7.domain.community.comment.dto.CommentResponseDto;
import com.java.NBE4_5_1_7.domain.community.comment.dto.EditCommentRequestDto;
import com.java.NBE4_5_1_7.domain.community.like.dto.LikeResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.AddPostRequestDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.EditPostRequestDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.PostResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.service.PostService;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/community")
public class CommunityController {
    private final PostService postService;
    private final MemberService memberService;

    @PostMapping("/article/post")
    public ResponseEntity<PostResponseDto> articlePost(AddPostRequestDto postRequestDto) {
        return ResponseEntity.ok(postService.addPost(memberService.getIdFromRq(), postRequestDto));
    }

    @PostMapping("/article/edit")
    public ResponseEntity<PostResponseDto> articleEdit(EditPostRequestDto editRequestDto) {
        return ResponseEntity.ok(postService.editPost(memberService.getIdFromRq(), editRequestDto));
    }

    @PostMapping("/article/delete")
    public ResponseEntity<Long> articleDelete(Long postId) {
        return ResponseEntity.ok(postService.deletePost(memberService.getIdFromRq(), postId));
    }

    @GetMapping("/article")
    public ResponseEntity<PostResponseDto> showPost(@RequestParam("id") Long id) {
        return ResponseEntity.ok(postService.showPost(id));
    }

    @GetMapping("/article/list/title")
    public ResponseEntity<Page<PostListResponseDto>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getPostList(page, size));
    }

    /**
     * 좋아요 많은 순으로 게시글 목록 조회
     */
    @GetMapping("/article/list/like/desc")
    public ResponseEntity<Page<PostListResponseDto>> getPostsLikeDesc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPostLikeDesc(page, size));
    }

    /**
     * 좋아요 적은 순으로 게시글 목록 조회
     */
    @GetMapping("/article/list/like/asc")
    public ResponseEntity<Page<PostListResponseDto>> getPostsLikeAsc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPostLikeAsc(page, size));
    }

    /**
     * 댓글 많은 순으로 게시글 목록 조회
     */
    @GetMapping("/article/list/comment/desc")
    public ResponseEntity<Page<PostListResponseDto>> getPostsCommentDesc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPostCommentDesc(page, size));
    }

    /**
     * 댓글 적은 순으로 게시글 목록 조회
     */
    @GetMapping("/article/list/comment/asc")
    public ResponseEntity<Page<PostListResponseDto>> getPostsCommentAsc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPostCommentAsc(page, size));
    }

    /**
     * 최근 작성 글 (최신순)로 게시글 목록 조회
     */
    @GetMapping("/article/list/createdat/desc")
    public ResponseEntity<Page<PostListResponseDto>> getPostsCreatedAtDesc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getPostCreatedAtDesc(page, size));
    }

    /**
     * 댓글 작성 API
     * URL: POST /community/comment/add
     */
    @PostMapping("/comment/add")
    public ResponseEntity<CommentResponseDto> addComment(@RequestBody AddCommentRequestDto dto) {
        Long memberId = memberService.getIdFromRq(); // 요청 컨텍스트로부터 현재 사용자 id 조회
        CommentResponseDto response = postService.addComment(memberId, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * 댓글 수정 API
     * URL: POST /community/comment/edit
     */
    @PostMapping("/comment/edit")
    public ResponseEntity<CommentResponseDto> editComment(@RequestBody EditCommentRequestDto dto) {
        Long memberId = memberService.getIdFromRq();
        CommentResponseDto response = postService.editComment(memberId, dto);
        return ResponseEntity.ok(response);
    }

    /**
     * 댓글 삭제 API
     * URL: POST /community/comment/delete?commentId={id}
     */
    @PostMapping("/comment/delete")
    public ResponseEntity<Void> deleteComment(@RequestParam Long commentId) {
        Long memberId = memberService.getIdFromRq();
        postService.deleteComment(memberId, commentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/comment/re")
    public ResponseEntity<List<CommentResponseDto>> showReComments(@RequestParam Long commentId) {
        return ResponseEntity.ok(postService.showReComments(commentId));
    }

    @GetMapping("/post/like")
    public ResponseEntity<LikeResponseDto> postLike(@RequestParam Long postId) {
        return ResponseEntity.ok(postService.postLike(memberService.getIdFromRq(), postId));
    }

    @GetMapping("/post/my")
    public ResponseEntity<List<PostListResponseDto>> myPost(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.myPost(memberService.getIdFromRq(), page, size));
    }
}
