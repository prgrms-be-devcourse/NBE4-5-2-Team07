package com.java.NBE4_5_1_7.domain.member.entity;

import com.java.NBE4_5_1_7.domain.interview.entity.InterviewContentBookmark;
import com.java.NBE4_5_1_7.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EntityListeners(AuditingEntityListener.class)
public class Member extends BaseEntity{

    @Column(length = 100, unique = true)
    private String username;
    @Column(length = 100, unique = true)
    private String apiKey;
    @Column(length = 100)
    private String nickname;
    private String profileImgUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private SubscriptionPlan subscriptionPlan;


    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InterviewContentBookmark> bookmarks = new ArrayList<>();

    public boolean isAdmin() {
        return Role.ADMIN.equals(role);
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {

        return getMemberAuthoritesAsString()
                .stream()
                .map(SimpleGrantedAuthority::new)
                .toList();

    }

    public List<String> getMemberAuthoritesAsString() {

        List<String> authorities = new ArrayList<>();

        authorities.add("ROLE_USER");

        if(isAdmin()) {
            authorities.add("ROLE_ADMIN");
        } else {
            authorities.add("ROLE_USER");
        }

        return authorities;
    }

    public void update(String nickname) {
        this.nickname = nickname;
    }

    public String getProfileImgUrlOrDefaultUrl() {
        return (profileImgUrl == null || profileImgUrl.isBlank()) ? "https://placehold.co/640x640?text=O_O" : this.profileImgUrl;
    }
}
