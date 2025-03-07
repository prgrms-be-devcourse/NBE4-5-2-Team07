package com.java.NBE4_5_1_7.domain.interview.service;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContent;
import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentLike;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentLikeRepository;
import com.java.NBE4_5_1_7.domain.interview.repository.InterviewContentRepository;
import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class InterviewLikeService {
    private final InterviewContentLikeRepository likeRepository;
    private final InterviewContentRepository interviewRepository;
    private final MemberRepository memberRepository;
    private final RedissonClient redissonClient;

    public String interviewLike(Long memberId, Long interviewId) {
        InterviewContent interviewContent = interviewRepository.findById(interviewId).orElseThrow(() -> new RuntimeException("해당 컨텐츠를 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("해당 멤버를 찾을 수 없습니다."));

        // 좋아요 기능 구현
        // 분산락 획득: 인터뷰 질문에 대한 좋아요 처리를 위해 락을 사용
        String lockKey = "lock:interview:like:" + interviewId;
        RLock lock = redissonClient.getLock(lockKey);
        // 락 획득 (최대 대기시간 5초, 자동 해제 시간 10초)
        boolean isLocked = false;
        try {
            isLocked = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (!isLocked) {
                throw new RuntimeException("시스템이 바빠 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.");
            }
            // 좋아요가 이미 등록되어 있는지 확인 (회원과 인터뷰 컨텐츠의 복합 조건)
            Optional<InterviewContentLike> existingLike = likeRepository.findByInterviewContentAndMember(interviewContent, member);
            if (existingLike.isPresent()) {
                // 좋아요가 이미 있다면 삭제(취소)
                likeRepository.delete(existingLike.get());
                return "좋아요 취소";
            } else {
                // 좋아요가 없다면 추가
                InterviewContentLike newLike = InterviewContentLike.builder()
                        .interviewContent(interviewContent)
                        .member(member)
                        .build();
                likeRepository.save(newLike);
                return "좋아요 추가";
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("락 획득 중 인터럽트가 발생했습니다.", e);
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
