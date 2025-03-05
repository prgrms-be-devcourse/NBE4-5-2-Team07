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

        Map<String, Object> payload = authTokenService.getPayload(accessToken);

        if (payload == null) {
            return Optional.empty();
        }

        long id = (long) payload.get("id");
        String username = (String) payload.get("username");
        String nickname = (String) payload.get("nickname");

        return Optional.of(
                Member.builder()
                        .id(id)
                        .username(username)
                        .nickname(nickname)
                        .build()
        );
    }

    public Long getIdFromMember(Optional<Member> optionalMember) {
        Member member = optionalMember.orElseThrow(() -> new RuntimeException("해당 사용자를 찾을 수 없습니다."));
        return member.getId();
    }

    public String genAccessToken(Member member) {
        return authTokenService.genAccessToken(member);
    }
}