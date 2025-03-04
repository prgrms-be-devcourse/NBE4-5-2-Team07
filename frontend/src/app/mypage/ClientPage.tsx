"use client";

import React, { useState } from "react";
import styles from "../styles/mypage.module.css";

const ClientPage = () => {
  const [memo, setMemo] = useState(""); // 학습 메모
  const [answer, setAnswer] = useState(""); // 기술 면접 답변

  const [memoDropdownOpen, setMemoDropdownOpen] = useState(false);
  const [answerDropdownOpen, setAnswerDropdownOpen] = useState(false);

  const memos = [
    "Computer Architecture",
    "Data Structure",
    "Operating System",
    "Database",
    "Network",
    "Software Engineering",
  ];
  const answers = ["언어", "운영체제", "데이터베이스", "네트워크", "웹"];

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
            {memos.map((memoItem, index) => (
              <li
                key={index}
                onClick={() => setMemo(memoItem)}
                className={styles.dropdownItem}
              >
                {memoItem}
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

      <div className={`${styles.card} ${styles.small}`}>
        <h3>컴포넌트 2</h3>
        <p>내용 3</p>
      </div>

      <div className={`${styles.card} ${styles.large}`}>
        <h3>컴포넌트 3</h3>
        <p>내용 3</p>
      </div>
    </div>
  );
};

export default ClientPage;
