"use client";

import React, { useEffect, useState } from "react";

interface InterviewResponseDto {
  id: number;
  head_id: number | null;
  tail_id: number | null;
  question: string;
  model_answer: string;
  category: string;
  keyword: string;
  next_id: number | null;
}

export default function CategoryStudyPage() {
  // 좌측 카테고리 버튼용: Enum 값
  const categories = ["DATABASE", "NETWORK", "OperatingSystem", "SPRING"];

  // 선택한 카테고리
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 해당 카테고리의 머리 질문 ID 리스트
  const [headIds, setHeadIds] = useState<number[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [listError, setListError] = useState<string | null>(null);

  // 학습 모드 관련 상태
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [currentInterview, setCurrentInterview] =
    useState<InterviewResponseDto | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 방문했던 질문 히스토리 (이전 질문 다시보기)
  const [history, setHistory] = useState<InterviewResponseDto[]>([]);

  // 정답 보이기 상태
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // 카테고리 버튼 클릭 시: 선택한 카테고리를 저장하고, 해당 카테고리 머리 질문 ID 리스트를 fetch
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsStudyMode(false);
    setCurrentInterview(null);
    setHistory([]);
    setListLoading(true);
    fetch(`http://localhost:8080/interview/category/${category}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `"${category}" 질문 리스트를 받아오는데 실패했습니다.`
          );
        }
        return res.json();
      })
      .then((data: number[]) => {
        setHeadIds(data);
        setListLoading(false);
      })
      .catch((err: Error) => {
        setListError(err.message);
        setListLoading(false);
      });
  };

  // 특정 질문 ID에 대한 상세 데이터 fetch
  const fetchInterview = async (id: number) => {
    try {
      setDetailLoading(true);
      // 현재 질문이 있다면 히스토리에 저장
      setCurrentInterview((prev) => {
        if (prev) {
          setHistory((h) => [...h, prev]);
        }
        return prev;
      });
      const res = await fetch(`http://localhost:8080/interview/${id}`);
      if (!res.ok) {
        throw new Error("면접 질문을 가져오는 데 실패했습니다.");
      }
      const data: InterviewResponseDto = await res.json();
      setCurrentInterview(data);
      setDetailLoading(false);
      setDetailError(null);
      setShowAnswer(false);
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // "학습하기" 버튼 클릭 시: 머리 질문 ID 리스트의 첫 질문을 fetch
  const startStudy = () => {
    if (headIds.length === 0) {
      alert("해당 분야의 머리 질문 ID 리스트가 없습니다.");
      return;
    }
    setIsStudyMode(true);
    setHistory([]);
    fetchInterview(headIds[0]);
  };

  // "다음 질문" 버튼: 이제 next_id 값을 사용하여 다음 질문을 가져옴
  const handleNextQuestion = () => {
    if (currentInterview?.next_id) {
      fetchInterview(currentInterview.next_id);
    } else {
      alert("마지막 질문입니다!");
    }
  };

  // "이전 질문 다시보기" 버튼
  const handlePreviousQuestion = () => {
    if (history.length === 0) return;
    const prevInterview = history[history.length - 1];
    setHistory(history.slice(0, history.length - 1));
    setCurrentInterview(prevInterview);
    setShowAnswer(false);
  };

  // 상위/꼬리 질문 보기
  const handleHeadQuestion = () => {
    if (currentInterview?.head_id) {
      fetchInterview(currentInterview.head_id);
    }
  };

  const handleTailQuestion = () => {
    if (currentInterview?.tail_id) {
      fetchInterview(currentInterview.tail_id);
    }
  };

  // 정답 보기/가리기 토글
  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "1rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 좌측 카테고리 버튼 */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ccc",
          paddingRight: "1rem",
        }}
      >
        <h3 style={{ textAlign: "center" }}>카테고리 선택</h3>
        {["DATABASE", "NETWORK", "OperatingSystem", "SPRING"].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            style={{
              width: "100%",
              padding: "0.7rem",
              marginBottom: "0.5rem",
              fontSize: "1rem",
              borderRadius: "6px",
              border:
                selectedCategory === cat
                  ? "2px solid #2e56bc"
                  : "1px solid #ccc",
              backgroundColor: selectedCategory === cat ? "#e8e8e8" : "#fff",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 우측: 질문 학습 영역 */}
      <div style={{ flex: 1, paddingLeft: "1rem" }}>
        <h2 style={{ textAlign: "center" }}>
          {selectedCategory ? `` : "카테고리를 선택하세요"}
        </h2>
        {listLoading && <p>카테고리 질문 ID 목록 로딩중...</p>}
        {listError && <p style={{ color: "red" }}>{listError}</p>}

        {/* 카테고리 선택 후, 아직 학습 모드 시작 전이면 "학습하기" 버튼 표시 */}
        {selectedCategory && !isStudyMode && !listLoading && !listError && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={startStudy}
              disabled={headIds.length === 0}
              style={{
                padding: "0.7rem 1.2rem",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2e56bc",
                color: "white",
                cursor: "pointer",
              }}
            >
              {selectedCategory} 분야 학습하기
            </button>
          </div>
        )}

        {/* 학습 모드: 질문 상세 표시 */}
        {isStudyMode && currentInterview && (
          <div style={{ marginTop: "2rem" }}>
            {detailLoading && <p>질문 로딩중...</p>}
            {detailError && <p style={{ color: "red" }}>{detailError}</p>}
            {!detailLoading && !detailError && (
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {/* 카테고리/키워드 박스 */}
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#e8e8e8",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {currentInterview.category.toUpperCase()} &gt;{" "}
                  {currentInterview.keyword}
                </div>

                {/* 질문 내용 */}
                <p
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.8rem",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>질문:</strong> {currentInterview.question}
                </p>

                {/* 정답 보기 토글 버튼 그룹 */}
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <button
                    onClick={toggleAnswer}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: showAnswer ? "#d9534f" : "#5cb85c",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    {showAnswer ? "정답 가리기" : "정답 보기"}
                  </button>
                </div>

                {/* 정답 내용 */}
                {showAnswer && (
                  <div
                    style={{
                      opacity: showAnswer ? 1 : 0,
                      transition: "opacity 0.3s ease-in-out",
                      marginBottom: "0.8rem",
                    }}
                  >
                    <p style={{ fontSize: "1.2rem", lineHeight: "1.4" }}>
                      <strong>모범 답안:</strong>{" "}
                      {currentInterview.model_answer}
                    </p>
                  </div>
                )}

                {/* 탐색 버튼 그룹 */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    justifyContent: "center",
                  }}
                >
                  {currentInterview.head_id && (
                    <button
                      onClick={handleHeadQuestion}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #2e56bc",
                        backgroundColor: "#fff",
                        color: "#2e56bc",
                        cursor: "pointer",
                      }}
                    >
                      상위 질문 보기
                    </button>
                  )}
                  {currentInterview.tail_id && (
                    <button
                      onClick={handleTailQuestion}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #2e56bc",
                        backgroundColor: "#fff",
                        color: "#2e56bc",
                        cursor: "pointer",
                      }}
                    >
                      꼬리 질문
                    </button>
                  )}
                  {history.length > 0 && (
                    <button
                      onClick={handlePreviousQuestion}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "1px solid #2e56bc",
                        backgroundColor: "#fff",
                        color: "#2e56bc",
                        cursor: "pointer",
                      }}
                    >
                      이전 질문 다시보기
                    </button>
                  )}
                  <button
                    onClick={handleNextQuestion}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "1px solid #2e56bc",
                      backgroundColor: "#fff",
                      color: "#2e56bc",
                      cursor: "pointer",
                    }}
                  >
                    다음 질문
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
