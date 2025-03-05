"use client";

import { useState } from "react";
import { interviewCategories, dummyInterviewQuestions } from "../dummyData";
import styles from "../../styles/admin.module.css";

export default function QuestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState(dummyInterviewQuestions);

  const [editId, setEditId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editKeyword, setEditKeyword] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  // 질문 필터링 (카테고리 + 검색어)
  const filteredQuestions = questions.filter(
    (item) =>
      (selectedCategory === "" || item.category === selectedCategory) &&
      (item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.keyword.toLowerCase().includes(search.toLowerCase()))
  );

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 표시할 질문 개수

  // 페이징 처리
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 변경 함수
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const goToNextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const goToPrevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  // 수정 버튼 클릭 시 편집 모드 활성화
  const handleEditClick = (id: number, category: string, keyword: string, question: string, answer: string) => {
    setEditId(id);
    setEditCategory(category);
    setEditKeyword(keyword);
    setEditQuestion(question);
    setEditAnswer(answer);
  };

  // 수정 완료 시 데이터 반영 후 편집 모드 종료
  const handleSave = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((item) =>
        item.id === editId
          ? {
              ...item,
              category: editCategory,
              keyword: editKeyword,
              question: editQuestion,
              answer: editAnswer,
            }
          : item
      )
    );
    setEditId(null);
  };

  return (
    <div className={styles.adminContainer}>
      {/* 카테고리 선택 */}
      <aside className={styles.sidebar}>
        <ul>
          <li
            className={selectedCategory === "" ? styles.active : ""}
            onClick={() => setSelectedCategory("")}
          >
            All
          </li>
          {interviewCategories.map((category) => (
            <li
              key={category}
              className={category === selectedCategory ? styles.active : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
      </aside>

      {/* 질문 목록 */}
      <main className={styles.content}>
        <input
          type="text"
          placeholder="검색어 입력 (질문 / 키워드)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBox}
        />
        <ul className={styles.contentList}>
          {currentItems.map((question) => (
            <li key={question.id} className={styles.contentItem}>
              {editId === question.id ? (
                <div className={styles.editContainer}>
                  {/* 카테고리 선택 */}
                  <label>Category:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className={styles.selectBox}
                  >
                    {interviewCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <label>Keyword:</label>
                  <input
                    type="text"
                    value={editKeyword}
                    onChange={(e) => setEditKeyword(e.target.value)}
                    className={styles.inputBox}
                  />

                  <label>Question:</label>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className={styles.inputBox}
                  />

                  <label>Answer:</label>
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    className={styles.textArea}
                  />

                  <div className={styles.buttonContainer}>
                    <button onClick={handleSave} className={styles.saveBtn}>
                      완료
                    </button>
                    <button onClick={() => setEditId(null)} className={styles.cancelBtn}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span>{question.question}</span>
                  <button
                    className={styles.editBtn}
                    onClick={() =>
                      handleEditClick(
                        question.id,
                        question.category,
                        question.keyword,
                        question.question,
                        question.answer
                      )
                    }
                  >
                    수정
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* 페이징 기능*/}
        <div className={styles.pagination}>
          <button onClick={goToPrevPage} disabled={currentPage === 1}>
            ⬅
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            ➡
          </button>
        </div>
      </main>
    </div>
  );
}
