package com.java.NBE4_5_1_7.domain.member.entity;

public enum Role {
    ADMIN("관리자"),
    USER("사용자");

    private final String role;

    Role(String role) {
        this.role = role;
    }
}
