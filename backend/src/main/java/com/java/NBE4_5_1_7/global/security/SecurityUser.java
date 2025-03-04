package com.java.NBE4_5_1_7.global.security;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class SecurityUser extends User implements OAuth2User {

    @Getter
    private long id;
    @Getter
    private String nickname;
    public SecurityUser(long id, String username, String nickname, Collection<? extends GrantedAuthority> authorities) {
        super(username, "", authorities);
        this.id = id;
        this.nickname = nickname;
    }

    public SecurityUser(Member member) {
        this(member.getId(), member.getUsername(), member.getNickname(), member.getAuthorities());
    }

    @Override
    public <A> A getAttribute(String name) {
        return OAuth2User.super.getAttribute(name);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return Map.of();
    }

    @Override
    public String getName() {
        return this.getUsername();
    }
}
