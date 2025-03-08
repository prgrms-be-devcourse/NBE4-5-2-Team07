package com.java.NBE4_5_1_7.domain.study.entity;

import lombok.Getter;

@Getter
public enum FirstCategory {
    ComputerArchitecture("컴퓨터구조"),
    DataStructure("자료구조"),
    Database("데이터베이스"),
    Network("네트워크"),
    OperatingSystem("운영체제"),
    SoftwareEngineering("소프트웨어엔지니어링"),
    Web("웹");

    private final String category;

    FirstCategory(String category) {
        this.category = category;
    }

    public static FirstCategory fromString(String category) {
        for (FirstCategory c : FirstCategory.values()) {
            if (c.getCategory().equalsIgnoreCase(category) || c.name().equalsIgnoreCase(category)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Unknown category: " + category);
    }
}
