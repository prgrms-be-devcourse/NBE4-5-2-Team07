package com.java.NBE4_5_1_7.domain.interview.entity;

import lombok.Getter;

@Getter
public enum InterviewCategory {
    DATABASE("데이터베이스"),
    NETWORK("네트워크"),
    OperatingSystem("운영체제"),
    SPRING("스프링");

    private final String category;

    InterviewCategory(String category) {
        this.category = category;
    }

    public static InterviewCategory fromString(String category) {
        for (InterviewCategory c : InterviewCategory.values()) {
            if (c.category.equals(category)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown category: " + category);
    }
}
