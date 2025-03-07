"use client";

import { useEffect, useState } from "react";
import styles from "../styles/studyContent.module.css";

const StudyContentCategory = ({ onCategorySelect }: { onCategorySelect: (firstCategory: string, secondCategory: string) => void }) => {
    const [categories, setCategories] = useState<{ [key: string]: string[] }>({});
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    // 카테고리 리스트 가져오기
    useEffect(() => {
        fetch("http://localhost:8080/api/v1/study/all", {
            method: "GET",
            credentials: "include", // 쿠키 등 인증 정보를 함께 전송
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("카테고리 리스트를 받아오는데 실패했습니다.");
                }
                return res.json();
            })
            .then((data) => {
                setCategories(data);
            })
            .catch((err: Error) => {
                console.error(err);
            });
    }, []);

    // 서브 카테고리 드롭다운 열기/닫기 상태 관리
    const toggleCategory = (category: string) => {
        setOpenCategory(openCategory === category ? null : category);
    };

    return (
        <div className={`${styles.card} ${styles.small}`}>
            <h2>📂 학습자료</h2>
            <ul>
                {Object.entries(categories).map(([firstCategory, subCategories]) => (
                    <li key={firstCategory} className={styles.mb4}>
                        <button onClick={() => toggleCategory(firstCategory)} className={styles.dropdownButton}>
                            {firstCategory}
                            <span className={styles.arrowIcon}>
                                {openCategory === firstCategory ? "▲" : "▼"}
                            </span>
                        </button>
                        {/* 서브 카테고리 드롭다운 */}
                        {openCategory === firstCategory && (
                            <ul className={`${styles.dropdownList} ${openCategory === firstCategory ? styles.show : styles.hide}`}>
                                {subCategories.map((secondCategory) => (
                                    <li key={secondCategory} className={styles.dropdownItem}>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                console.log(firstCategory, secondCategory);
                                                onCategorySelect(firstCategory, secondCategory);
                                            }}
                                        >
                                            {secondCategory}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudyContentCategory;
