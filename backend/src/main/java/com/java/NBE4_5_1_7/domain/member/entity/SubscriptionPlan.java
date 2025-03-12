package com.java.NBE4_5_1_7.domain.member.entity;

import lombok.Getter;

@Getter
public enum SubscriptionPlan {
    FREE("FREE",0,0),
    PREMIUM("PREMIUM", 100, 30);

    private final String name;
    private final int price;
    private final int durationDays;

    SubscriptionPlan(String name, int price, int durationDays) {
        this.name = name;
        this.price = price;
        this.durationDays = durationDays;
    }
}

