package com.java.NBE4_5_1_7.domain.member.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.repository.MemberRepository;
import com.java.NBE4_5_1_7.global.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    public Member join(String username, String nickname, String profileImgUrl) {

        Member member = Member.builder()
                .username(username)
                .apiKey(username)
                .nickname(nickname)
                .profileImgUrl(profileImgUrl)
                .build();

        return memberRepository.save(member);
    }

    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    public Optional<Member> findById(long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> findByApiKey(String apiKey) {
        return memberRepository.findByApiKey(apiKey);
    }

    public String getAuthToken(Member member) {
        return member.getApiKey() + " " + authTokenService.genAccessToken(member);
    }

    public Optional<Member> getMemberByAccessToken(String accessToken) {
        try {
            Map<String, Object> payload = authTokenService.getPayload(accessToken);
            if (payload == null) {
                return Optional.empty();
            }
            Number idNo = (Number) payload.get("id");
            long id = idNo.longValue();
            String username = (String) payload.get("username");
            String nickname = (String) payload.get("nickname");
            Member member = Member.builder()
                    .id(id)
                    .username(username)
                    .nickname(nickname)
                    .build();
            return Optional.of(member);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    // 아래 코드를 MemberService.java에 추가
    public Map<String, Object> getRefreshPayload(String refreshToken) {
        try {
            Map<String, Object> payload = authTokenService.getRefreshPayload(refreshToken);
            // 검증: payload의 "type"이 "refresh"인지 확인
            if (payload != null && "refresh".equals(payload.get("type"))) {
                return payload;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }


    public Long getIdFromRq() {
        Member member = rq.getActor();
        return member.getId();
    }
    

    public String genRefreshToken(Member member) {
        return authTokenService.genRefreshToken(member);
    }

    public String genAccessToken(Member member) {
        return authTokenService.genAccessToken(member);
    }
}