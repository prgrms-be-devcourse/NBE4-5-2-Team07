"use client";

import React, { useEffect, useState } from "react";
import styles from "../styles/mypage.module.css";

// Define types for interview data
interface InterviewData {
  [category: string]: string[];
}

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
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData>({});

  const notes = ["노트1", "노트2", "노트3", "노트4", "노트5", "노트6"];
  const memos = [
    "Computer Architecture",
    "Data Structure",
    "Operating System",
    "Database",
    "Network",
    "Software Engineering",
  ];
  const answerCategory = ["데이터베이스", "네트워크", "운영체제", "스프링"];

  const fetchInterviewComment = async (category: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/interview/comment?category=${category}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const text = await response.json();
      const data = text?.data || [];

      // 데이터가 없을 경우 처리
      if (data.length === 0) {
        console.log("No comments available for this category.");
      }

      console.log(data);

      const updatedCategoryItems = data.reduce(
        (acc: InterviewData, comment: any) => {
          const category = comment.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(comment.item);
          return acc;
        },
        {}
      );

      setInterviewData(updatedCategoryItems); // Correct usage of setInterviewData
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
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

    fetchInterviewComment(category);
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
            {answerCategory.map((category, index) => (
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
          selectedCategory && interviewData[selectedCategory] ? (
            interviewData[selectedCategory].map((item, index) => (
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
