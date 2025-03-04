"use client";

import React, { useState } from "react";
import styles from "../styles/mypage.module.css";

const ClientPage = () => {
  const [note, setNote] = useState(""); // 내 노트
  const [memo, setMemo] = useState(""); // 학습 메모
  const [answer, setAnswer] = useState(""); // 기술 면접 답변
  const [showNoteList, setShowNoteList] = useState(false);
  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);
  const [selectedNoteCategory, setSelectedNoteCategory] = useState("");
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("");
  const [selectedAnswerCategory, setSelectedAnswerCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedNote, setSelectedNote] = useState("");
  const [items, setItems] = useState([]);
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const notes = ["노트1", "노트2", "노트3", "노트4", "노트5", "노트6"];
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
    언어: ["JavaScript", "Python", "Java", "C++"],
    운영체제: ["멀티스레딩", "CPU 스케줄링", "가상 메모리"],
    데이터베이스: ["정규화", "ACID", "조인"],
    네트워크: ["UDP", "HTTP/2", "로드 밸런싱"],
    웹: ["REST API", "GraphQL", "SSR vs CSR"],
  };

  const handleNoteCategorySelect = (category: string) => {
    setSelectedNoteCategory(category);
    setSelectedAnswerCategory("");
    setSelectedMemoCategory("");
    setSelectedItem("");
    setDetails("");
    setSelectedNote(category);
  };

  const handleMemoCategorySelect = (category: string) => {
    setSelectedMemoCategory(category);
    setSelectedNoteCategory("");
    setSelectedAnswerCategory("");
    setSelectedItem("");
    setDetails("");
    setShowNoteList(false);
  };

  const handleAnswerCategorySelect = (category: string) => {
    setSelectedAnswerCategory(category);
    setSelectedMemoCategory("");
    setSelectedNoteCategory("");
    setSelectedItem("");
    setDetails("");
    setShowNoteList(false);
  };

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
    setDetails(`${item}의 상세 설명`);
  };

  const selectedCategory =
    selectedMemoCategory || selectedAnswerCategory || selectedNoteCategory;

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.small}`}>
        {/* 내 노트 버튼 */}
        <button
          className={styles.btn}
          onClick={() => {
            setShowNoteList((prevState) => !prevState);
            setSelectedNoteCategory("");
          }}
        >
          내 노트
        </button>

        {/* 학습 메모 드롭다운 */}
        <button
          className={styles.btn}
          onClick={() => setMemoDropdownOpen((prevState) => !prevState)}
        >
          작성한 학습 메모 {memoDropdownOpen ? "▲" : "▼"}
        </button>
        {memoDropdownOpen && (
          <ul className={`${styles.dropdownList} ${styles.small}`}>
            {memos.map((category, index) => (
              <li
                key={index}
                onClick={() => handleMemoCategorySelect(category)}
                className={`${styles.dropdownItem} ${
                  selectedMemoCategory === category ? styles.selected : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        )}

        {/* 기술 면접 답변 드롭다운 */}
        <button
          className={styles.btn}
          onClick={() => setAnswerDropdownOpen((prevState) => !prevState)}
        >
          작성한 기술 면접 답변 {answerDropdownOpen ? "▲" : "▼"}
        </button>
        {answerDropdownOpen && (
          <ul className={`${styles.dropdownList} ${styles.small}`}>
            {answers.map((category, index) => (
              <li
                key={index}
                onClick={() => handleAnswerCategorySelect(category)}
                className={`${styles.dropdownItem} ${
                  selectedAnswerCategory === category ? styles.selected : ""
                }`}
              >
                {category}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 선택한 카테고리의 아이템 목록 */}
      <div className={`${styles.card} ${styles.small}`}>
        <ul>
          {/* 내 노트 목록 */}
          {showNoteList ? (
            <ul>
              {notes.map((category, index) => (
                <li
                  key={index}
                  onClick={() => handleNoteCategorySelect(category)}
                  className={`${styles.dropdownItem} ${
                    selectedNoteCategory === category ? styles.selected : ""
                  }`}
                >
                  {category}
                </li>
              ))}
            </ul>
          ) : // 선택한 카테고리의 아이템 목록
          selectedCategory && categoryItems[selectedCategory] ? (
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

      {/* 상세 내용 */}
      <div className={`${styles.card} ${styles.large}`}>
        <p className={styles.noItems}>{selectedItem || "항목을 선택하세요."}</p>
      </div>
    </div>
  );
};

export default ClientPage;
