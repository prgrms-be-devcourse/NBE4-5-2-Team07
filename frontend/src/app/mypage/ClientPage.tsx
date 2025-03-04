"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/mypage.module.css";

const ClientPage = () => {
  const [memo, setMemo] = useState(""); // 학습 메모
  const [answer, setAnswer] = useState(""); // 기술 면접 답변
  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [items, setItems] = useState([]);
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const memos = [
    "Computer Architecture",
    "Data Structure",
    "Operating System",
    "Database",
    "Network",
    "Software Engineering",
  ];
  const answers = ["언어", "운영체제", "데이터베이스", "네트워크", "웹"];

  const categoryItems: Record<string, string[]> = {
    "Computer Architecture": [
      "캐시 메모리",
      "파이프라이닝",
      "명령어 집합 구조",
    ],
    "Data Structure": [
      "배열",
      "연결 리스트",
      "스택",
      "큐",
      "트리",
      "그래프",
      "ㄱ",
      "ㄴ",
      "ㄷ",
      "ㄹ",
      "ㅁ",
      "ㅂ",
      "ㅅ",
      "ㅇ",
      "ㅈ",
      "ㅊ",
    ],
    "Operating System": ["프로세스", "스레드", "메모리 관리", "파일 시스템"],
    Database: ["SQL", "NoSQL", "트랜잭션", "인덱스"],
    Network: ["TCP/IP", "라우팅", "DNS", "HTTP"],
    "Software Engineering": ["애자일", "TDD", "설계 패턴"],
  };

  // 카테고리 선택 시 상태 변경
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedItem(""); // 기존 선택 초기화
    setDetails(""); // 기존 상세 내용 초기화
  };

  // 아이템 선택 시 상세 내용 변경
  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
    setDetails(`${item}의 상세 설명`); // 임시 상세 내용
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.small}`}>
        {/* 내 노트 버튼 */}
        <button className={styles.btn}>내 노트</button>

        {/* 학습 메모 드롭박스 */}
        <button
          className={styles.btn}
          onClick={() => setMemoDropdownOpen((prevState) => !prevState)}
        >
          작성한 학습 메모 {memoDropdownOpen ? "▲" : "▼"}
        </button>
        {memoDropdownOpen && (
          <ul className={styles.dropdownList}>
            {memos.map((category, index) => (
              <li
                key={index}
                onClick={() => handleCategorySelect(category)}
                className={`${styles.dropdownItem} ${
                  selectedCategory === category ? styles.selected : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        )}

        {/* 기술 면접 답변 드롭박스 */}
        <button
          className={styles.btn}
          onClick={() => setAnswerDropdownOpen((prevState) => !prevState)}
        >
          작성한 기술 면접 답변 {answerDropdownOpen ? "▲" : "▼"}
        </button>
        {answerDropdownOpen && (
          <ul className={styles.dropdownList}>
            {answers.map((answerItem, index) => (
              <li
                key={index}
                onClick={() => setAnswer(answerItem)}
                className={styles.dropdownItem}
              >
                {answerItem}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 중앙 목록 (선택한 카테고리의 아이템 목록) */}
      <div className={`${styles.card} ${styles.small}`}>
        <ul>
          {selectedCategory && categoryItems[selectedCategory] ? (
            categoryItems[selectedCategory].map((item, index) => (
              <li
                key={index}
                onClick={() => handleItemSelect(item)}
                className={`${styles.listItem} ${
                  selectedItem === item ? styles.selected : ""
                }`}
              >
                {item}
              </li>
            ))
          ) : (
            <p className={styles.noItems}>항목이 없습니다.</p>
          )}
        </ul>
      </div>

      {/* 우측 상세 내용 (선택한 아이템) */}
      <div className={`${styles.card} ${styles.large}`}>
        <h3>{selectedItem || "항목을 선택하세요"}</h3>
        <p>{details || "내용이 없습니다."}</p>
      </div>
    </div>
  );
};

export default ClientPage;
