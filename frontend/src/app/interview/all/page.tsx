// src/app/interview/all/page.tsx
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

export default function InterviewAllPage() {
  // 전체 ID 리스트 관련 상태
  const [headIds, setHeadIds] = useState<number[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(true);
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

  // 전체 ID 리스트 fetch (컴포넌트 마운트 시)
  useEffect(() => {
    setListLoading(true);
    fetch("http://localhost:8080/interview/all", {
      method: "GET",
      credentials: "include", // 쿠키 등 인증 정보를 함께 전송
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("전체 질문 ID 리스트를 받아오는데 실패했습니다.");
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
  }, []);

  // 특정 질문 ID에 대한 상세 데이터 fetch
  const fetchInterview = async (id: number) => {
    try {
      setDetailLoading(true);
      // 방문하기 전에 현재 질문이 있다면 히스토리에 저장
      setCurrentInterview((prev) => {
        if (prev) {
          setHistory((h) => [...h, prev]);
        }
        return prev;
      });
      const res = await fetch(`http://localhost:8080/interview/${id}`, {
        method: "GET",
        credentials: "include", // 인증 정보를 함께 전송
      });
      if (!res.ok) {
        throw new Error("면접 질문을 가져오는 데 실패했습니다.");
      }
      const data: InterviewResponseDto = await res.json();
      setCurrentInterview(data);
      setDetailLoading(false);
      setDetailError(null);
      // 새 질문이 로드될 때 정답은 감춘 상태로
      setShowAnswer(false);
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // "학습하기" 버튼 클릭 시: 첫 번째 질문 로드 + 학습 모드 전환
  const startStudy = () => {
    if (headIds.length === 0) {
      alert("면접 질문 ID 리스트가 없습니다.");
      return;
    }
    setIsStudyMode(true);
    setHistory([]);
    fetchInterview(headIds[0]);
  };

  // 네비게이션 버튼 핸들러들
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

  const handleNextQuestion = () => {
    if (currentInterview?.next_id) {
      fetchInterview(currentInterview.next_id);
    }
  };

  // 이전 질문 다시보기: 히스토리에서 마지막 질문 꺼내오기
  const handlePreviousQuestion = () => {
    if (history.length > 0) {
      const prevInterview = history[history.length - 1];
      setHistory(history.slice(0, history.length - 1));
      setCurrentInterview(prevInterview);
      setShowAnswer(false);
    }
  };

  // 정답 보기/가리기 토글
  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  return (
    <div
      style={{
        padding: "1rem",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "700px" }}>
        {listLoading && <p>목록 로딩중...</p>}
        {listError && <p style={{ color: "red" }}>오류 발생: {listError}</p>}
        {/* 학습 모드 시작 전 */}
        {!isStudyMode && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={startStudy}
              disabled={headIds.length === 0 || listLoading}
              style={{
                padding: "0.7rem 1.2rem",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2e56bc",
                color: "white",
                cursor: "pointer",
                marginTop: "2rem",
              }}
            >
              기술 면접 예상 질문 학습하기
            </button>
          </div>
        )}

        {/* 학습 모드: 상세 데이터 표시 */}
        {isStudyMode && (
          <div style={{ marginTop: "2rem" }}>
            {detailLoading && <p>질문 로딩중...</p>}
            {detailError && (
              <p style={{ color: "red" }}>오류 발생: {detailError}</p>
            )}
            {currentInterview && !detailLoading && !detailError && (
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {/* 카테고리와 키워드를 별도의 박스로 표시 */}
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
                <p
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.8rem",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>질문:</strong> {currentInterview.question}
                </p>

                {/* 정답 보기 토글 버튼을 별도 그룹으로 배치 */}
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

                {/* 정답 내용 (정답 보기 시에만 렌더링) */}
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
                      상위 질문
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
                  {currentInterview.next_id && (
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
