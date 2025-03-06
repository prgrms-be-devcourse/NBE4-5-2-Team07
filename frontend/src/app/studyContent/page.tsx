"use client";

import { useState } from "react";
import StudyContentCategory from "./studyContentCategory";
import StudyContentBody from "./studyContentBody";
import styles from "../styles/studyContent.module.css";

// 기본 카테고리 설정
const DEFAULT_CATEGORY = { firstCategory: "OperatingSystem", secondCategory: "운영체제란?" };

export default function Page() {
    const [selectedCategory, setSelectedCategory] = useState<{ firstCategory: string; secondCategory: string } | null>(null);

    // 카테고리 선택 시 해당 카테고리 정보를 업데이트
    const handleCategorySelect = (firstCategory: string, secondCategory: string) => {
        setSelectedCategory({ firstCategory, secondCategory });
    };

    // selectedCategory가 없으면 기본 카테고리 사용
    const categoryToUse = selectedCategory || DEFAULT_CATEGORY;

    return (
        <div className={styles.container}>
            <StudyContentCategory onCategorySelect={handleCategorySelect} />
            <div className={styles.body}>
                <StudyContentBody selectedCategory={categoryToUse} />
            </div>
        </div>
    );
}
