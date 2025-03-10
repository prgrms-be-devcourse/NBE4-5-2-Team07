package com.java.NBE4_5_1_7.domain.community.post.service;

import com.java.NBE4_5_1_7.domain.community.comment.dto.CommentResponseDto;
import com.java.NBE4_5_1_7.domain.community.comment.entity.Comment;
import com.java.NBE4_5_1_7.domain.community.like.repository.PostLikeRepository;
import com.java.NBE4_5_1_7.domain.community.post.dto.AddPostRequestDto;
import com.java.NBE4_5_1_7.domain.community.post.dto.PostResponseDto;
import com.java.NBE4_5_1_7.domain.community.post.entity.Post;
import com.java.NBE4_5_1_7.domain.community.post.repository.PostRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final PostLikeRepository likeRepository;

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
                .comments(getComments(savedPost))
                .build();
    }

    public List<CommentResponseDto> getComments(Post post) {
        if (post == null || post.getComments() == null) {
            return Collections.emptyList();
        }

        return post.getComments().stream()
                .map(comment -> new CommentResponseDto(
                        comment.getPost().getPostId(),           // 게시글 ID
                        maskLastCharacter(comment.getAuthor().getNickname()),                // 댓글 작성자 이름
                        comment.getCreatedDate(),                     // 댓글 작성 시간
                        comment.getComment()                          // 댓글 내용
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
