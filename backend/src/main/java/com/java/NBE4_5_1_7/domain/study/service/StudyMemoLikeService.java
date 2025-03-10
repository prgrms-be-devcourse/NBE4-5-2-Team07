package com.java.NBE4_5_1_7.domain.study.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemo;
import com.java.NBE4_5_1_7.domain.study.entity.StudyMemoLike;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoLikeRepository;
import com.java.NBE4_5_1_7.domain.study.repository.StudyMemoRepository;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class StudyMemoLikeService {
    private final StudyMemoLikeRepository studyMemoLikeRepository;
    private final StudyMemoRepository studyMemoRepository;
    private final MemberService memberService;
    private final RedissonClient redissonClient;

    public int getLikeCount(Long studyMemoId) {
        return studyMemoLikeRepository.countByStudyMemoId(studyMemoId);
    }

    public String memoLike(Long studyMemoId) {
        StudyMemo studyMemo = studyMemoRepository.findById(studyMemoId).orElse(null);
        Member member = memberService.getMemberFromRq();

        String lockKey = "lock:interview:like:" + studyMemoId;
        RLock lock = redissonClient.getLock(lockKey);

        boolean isLocked = false;
        try {
            isLocked = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (!isLocked) {
                throw new RuntimeException("시스템이 바빠 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.");
            }
            Optional<StudyMemoLike> existingLike = studyMemoLikeRepository.findByStudyMemo(studyMemo);
            if (existingLike.isPresent()) {
                studyMemoLikeRepository.delete(existingLike.get());
                return "좋아요 취소";
            } else {
                studyMemoLikeRepository.save(new StudyMemoLike(member, studyMemo));
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
