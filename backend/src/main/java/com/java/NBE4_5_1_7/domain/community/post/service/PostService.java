package com.java.NBE4_5_1_7.domain.community.post.service;

import com.java.NBE4_5_1_7.domain.community.comment.dto.AddCommentRequestDto;
import com.java.NBE4_5_1_7.domain.community.comment.dto.CommentResponseDto;
import com.java.NBE4_5_1_7.domain.community.comment.dto.EditCommentRequestDto;
import com.java.NBE4_5_1_7.domain.community.comment.entity.Comment;
import com.java.NBE4_5_1_7.domain.community.comment.repository.CommentRepository;
import com.java.NBE4_5_1_7.domain.community.like.dto.LikeResponseDto;
import com.java.NBE4_5_1_7.domain.community.like.entity.PostLike;
import com.java.NBE4_5_1_7.domain.community.like.repository.PostLikeRepository;
import com.java.NBE4_5_1_7.domain.community.post.dto.AddPostRequestDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.EditPostRequestDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.PostListResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.PostResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.entity.Post;
import com.java.NBE4_5_1_7.domain.community.post.repository.PostRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.connection.RedisInvalidSubscriptionException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final PostLikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final RedissonClient redissonClient;

    public PostResponseDto showPost(Long postId, Long currentMemberId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("해당 게시글을 찾을 수 없습니다."));
        return PostResponseDto.builder()
                .id(postId)
                .authorName(maskLastCharacter(post.getAuthor().getNickname()))
                .postTime(post.getCreatedAt())
                .title(post.getTitle())
                .content(post.getContent())
                .like(likeRepository.countByPostPostId(postId))
                .comments(getComments(post, currentMemberId))
                .build();
    }

    public PostResponseDto addPost(Long memberId, AddPostRequestDto postRequestDto) {
        Member author = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));
        Post newPost = Post.builder()
                .author(author)
                .title(postRequestDto.getTitle())
                .content(postRequestDto.getContent())
                .build();

        Post savedPost = postRepository.save(newPost);
        return PostResponseDto.builder()
                .id(savedPost.getPostId())
                .authorName(maskLastCharacter(author.getNickname()))
                .postTime(savedPost.getCreatedAt())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .like(likeRepository.countByPostPostId(savedPost.getPostId()))
                .comments(getComments(savedPost, memberId))
                .build();
    }

    public PostResponseDto editPost(Long memberId, EditPostRequestDto editPostRequestDto) {
        Member author = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));

        Post post = postRepository.findById(editPostRequestDto.getPostId()).orElseThrow(() -> new RuntimeException("해당 게시글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(author.getId())) {
            throw new RuntimeException("자신이 작성한 게시글만 수정이 가능합니다.");
        }

        post.update(editPostRequestDto);

        return PostResponseDto.builder()
                .id(post.getPostId())
                .authorName(maskLastCharacter(author.getNickname()))
                .postTime(post.getUpdatedAt())
                .title(post.getTitle())
                .content(post.getContent())
                .like(likeRepository.countByPostPostId(post.getPostId()))
                .comments(getComments(post, memberId))
                .build();
    }

    public Long deletePost(Long memberId, Long postId) {
        Member author = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));

        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("해당 게시글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(author.getId())) {
            throw new RuntimeException("자신이 작성한 게시글만 수정이 가능합니다.");
        }

        postRepository.deleteById(postId);
        return postId;
    }

    public Page<PostListResponseDto> getPostList(int page, int size) {
        Page<PostListResponseDto> result = postRepository.findAllPostList(PageRequest.of(page, size));
        return result.map(dto -> {
            dto.setAuthor(maskLastCharacter(dto.getAuthor()));
            return dto;
        });
    }


    // 좋아요 많은 순
    public Page<PostListResponseDto> getPostLikeDesc(int page, int size) {
        Page<PostListResponseDto> result = postRepository.findAllOrderByLikesDesc(PageRequest.of(page, size));
        return result.map(dto -> {
            dto.setAuthor(maskLastCharacter(dto.getAuthor()));
            return dto;
        });
    }
    // 좋아요 적은 순
    public Page<PostListResponseDto> getPostLikeAsc(int page, int size) {
        Page<PostListResponseDto> result = postRepository.findAllOrderByLikesAsc(PageRequest.of(page, size));
        return result.map(dto -> {
            dto.setAuthor(maskLastCharacter(dto.getAuthor()));
            return dto;
        });
    }
    // 댓글 많은 순
    public Page<PostListResponseDto> getPostCommentDesc(int page, int size) {
        Page<PostListResponseDto> result = postRepository.findAllOrderByCommentsDesc(PageRequest.of(page, size));
        return result.map(dto -> {
            dto.setAuthor(maskLastCharacter(dto.getAuthor()));
            return dto;
        });
    }
    // 댓글 적은 순
    public Page<PostListResponseDto> getPostCommentAsc(int page, int size) {
        Page<PostListResponseDto> result = postRepository.findAllOrderByCommentsAsc(PageRequest.of(page, size));
        return result.map(dto -> {
            dto.setAuthor(maskLastCharacter(dto.getAuthor()));
            return dto;
        });
    }
    // 최근 작성 글
    public Page<PostListResponseDto> getPostCreatedAtDesc(int page, int size) {
        Page<PostListResponseDto> result = postRepository.findAllOrderByCreatedAtDesc(PageRequest.of(page, size));
        return result.map(dto -> {
            dto.setAuthor(maskLastCharacter(dto.getAuthor()));
            return dto;
        });
    }

    public CommentResponseDto addComment(Long memberId, AddCommentRequestDto dto) {
        // 게시글 조회
        Post post = postRepository.findById(dto.getArticleId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // 작성자(Member) 조회
        Member author = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤머를 찾을 수 없습니다."));

        // 대댓글일 경우 부모 댓글 조회 (없으면 null)
        Comment parent = null;
        if (dto.getParentId() != null) {
            parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .comment(dto.getComment())
                .post(post)
                .author(author)
                .parent(parent)
                .build();

        Comment saved = commentRepository.save(comment);

        return new CommentResponseDto(
                post.getPostId(),
                saved.getId(),
                saved.getAuthor().getNickname(), // 또는 author.getNickname() 등 실제 필드에 맞게 수정
                saved.getCreatedDate(),
                saved.getComment(),
                0,
                true
        );
    }

    public CommentResponseDto editComment(Long memberId, EditCommentRequestDto dto) {
        Comment comment = commentRepository.findById(dto.getCommentId())
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // 본인 작성 댓글이 아닌 경우 수정 불가 처리
        if (!comment.getAuthor().getId().equals(memberId)) {
            throw new RuntimeException("Not authorized to edit comment");
        }

        comment.update(dto.getComment());
        Comment updated = commentRepository.save(comment);

        return new CommentResponseDto(
                comment.getPost().getPostId(),
                updated.getId(),
                updated.getAuthor().getUsername(),
                updated.getCreatedDate(),
                updated.getComment(),
                updated.getChildren() != null ? updated.getChildren().size() : 0,
                true
        );
    }

    @Transactional
    public void deleteComment(Long memberId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // 본인 작성 댓글이 아닌 경우 삭제 불가 처리
        if (!comment.getAuthor().getId().equals(memberId)) {
            throw new RuntimeException("Not authorized to delete comment");
        }

        if (comment.getParent() != null) {
            Comment parent = comment.getParent();
            parent.getChildren().remove(comment);
        }
        commentRepository.delete(comment);
    }

    public List<CommentResponseDto> showReComments(Long commentId, Long currentMemberId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        List<Comment> reComments = comment.getChildren();
        return reComments.stream().map(reComment -> new CommentResponseDto(
                comment.getPost().getPostId(),
                reComment.getId(),
                maskLastCharacter(reComment.getAuthor().getNickname()),
                reComment.getCreatedDate(),
                reComment.getComment(),
                reComment.getChildren() != null ? reComment.getChildren().size() : 0,
                reComment.getAuthor().getId().equals(currentMemberId)
        )).collect(Collectors.toList());
    }

    public LikeResponseDto postLike(Long memberId, Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("해당 게시글을 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));

        //좋아요 기능 구현
        //분산락 획득 -> 인터뷰 질문에 대한 좋아요 처리를 위해 락 사용
        String lockKey = "lock:post:like" + postId;
        RLock lock = redissonClient.getLock(lockKey);

        boolean isLocked = false;

        try {
            isLocked = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (!isLocked) {
                throw new RuntimeException("시스템이 바빠 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.");
            }

            Optional<PostLike> existingLike = likeRepository.findByPostAndMember(post, member);
            if (existingLike.isPresent()) {
                likeRepository.delete(existingLike.get());
                return new LikeResponseDto(postId, likeRepository.countByPostPostId(postId), "좋아요 취소");
            } else {
                PostLike postLike = PostLike.builder()
                        .post(post)
                        .member(member)
                        .build();

                likeRepository.save(postLike);
                return new LikeResponseDto(postId, likeRepository.countByPostPostId(postId), "좋아요 추가");
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("락 획득 중 인터럽트 발생");
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    public List<PostListResponseDto> myPost(Long memberId, int page, int size) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));
        List<Post> myPostList = postRepository.findAllByAuthor_Id(member.getId());

        return myPostList.stream().map(post -> new PostListResponseDto(
                post.getPostId(),
                post.getTitle(),
                maskLastCharacter(post.getAuthor().getNickname()),
                post.getCreatedAt()
        )).collect(Collectors.toList());
    }



    public List<CommentResponseDto> getComments(Post post, Long currentMemberId) {
        if (post == null || post.getComments() == null) {
            return Collections.emptyList();
        }

        return post.getComments().stream()
                .filter(comment -> comment.getParent() == null) // 기본 댓글만 필터링
                .map(comment -> new CommentResponseDto(
                        comment.getPost().getPostId(),           // 게시글 ID
                        comment.getId(),
                        maskLastCharacter(comment.getAuthor().getNickname()),                // 댓글 작성자 이름
                        comment.getCreatedDate(),                     // 댓글 작성 시간
                        comment.getComment(),                          // 댓글 내용
                        comment.getChildren() != null ? comment.getChildren().size() : 0,
                        comment.getAuthor().getId().equals(currentMemberId)
                ))
                .collect(Collectors.toList());
    }

    public static String maskLastCharacter(String word) {
        if (word == null || word.isEmpty()) {
            return word;
        }
        // 마지막 글자를 '*'로 대체
        return word.substring(0, word.length() - 1) + "*";
    }
}
