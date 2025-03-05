"use client";

import React, { useEffect, useState } from "react";

// 백엔드 DTO와 동일한 타입들
interface InterviewResponseDto {
  id: number;
  head_id: number | null;
  tail_id: number | null;
  question: string;
  model_answer: string;
  category: string;
  keyword: string;
  next_id: number | null; // 이 값은 랜덤 모드에서 직접 사용하진 않지만, 상/꼬리 질문 등 필요 시 활용
}

interface RandomRequestDto {
  indexList: number[];
}

interface RandomResponseDto {
  indexList: number[]; // 새롭게 업데이트된 ID 리스트 (이미 사용된 ID가 제거됨)
  interviewResponseDto: InterviewResponseDto; // 랜덤으로 선택된 질문
}

export default function RandomInterviewPage() {
  // 전체 ID 리스트
  const [headIds, setHeadIds] = useState<number[]>([]);
  // 랜덤 모드 시작 여부
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);

  // 현재 보여주는 질문 (InterviewResponseDto)
  const [currentInterview, setCurrentInterview] =
    useState<InterviewResponseDto | null>(null);

  // 다음 랜덤 요청 시 보낼 ID 리스트
  const [randomList, setRandomList] = useState<number[]>([]);

  // 로딩 / 에러 / 정답 보기 상태
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // "이전 질문 다시보기"를 위한 히스토리
  const [history, setHistory] = useState<InterviewResponseDto[]>([]);

  // (1) 컴포넌트 마운트 시 전체 머리 질문 ID 가져오기
  useEffect(() => {
    fetch("http://localhost:8080/interview/all", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("전체 질문 ID 리스트를 가져오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data: number[]) => {
        setHeadIds(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  // (2) "실전 면접 대비" 시작
  const startRandomMode = () => {
    if (headIds.length === 0) {
      alert("머리 질문 ID 리스트가 없습니다.");
      return;
    }
    setIsRandomMode(true);
    // 랜덤 요청을 위한 리스트를 초기화
    setRandomList(headIds);
    // 히스토리 초기화
    setHistory([]);
    // 첫 질문 랜덤 호출
    fetchRandomInterview(headIds);
  };

  // (3) 랜덤 질문 호출: /interview/random (POST)
  const fetchRandomInterview = async (indices: number[]) => {
    try {
      setLoading(true);
      setError(null);

      // 이전 질문을 history에 저장
      if (currentInterview) {
        setHistory((prev) => [...prev, currentInterview]);
      }

      const requestBody: RandomRequestDto = { indexList: indices };
      const res = await fetch("http://localhost:8080/interview/random", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        throw new Error("랜덤 면접 질문을 가져오는데 실패했습니다.");
      }
      const data: RandomResponseDto = await res.json();

      // 새 질문과 새 indexList 반영
      setCurrentInterview(data.interviewResponseDto);
      setRandomList(data.indexList); // 이미 사용한 ID가 제거된 리스트
      setShowAnswer(false); // 새 질문 로드 시 정답 숨김
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // (4) "다음 랜덤 질문" 버튼
  const handleNextRandom = () => {
    if (randomList.length === 0) {
      alert("더 이상 질문이 없습니다!");
      return;
    }
    fetchRandomInterview(randomList);
  };

  // (5) "이전 질문 다시보기"
  const handlePreviousQuestion = () => {
    if (history.length === 0) return;
    // 히스토리의 마지막 질문을 가져옴
    const prev = history[history.length - 1];
    setHistory(history.slice(0, history.length - 1));
    setCurrentInterview(prev);
    setShowAnswer(false);
  };

  // (6) 상위/꼬리 질문 보기 -> 기존과 동일하게 /interview/{id} (GET) 호출
  const fetchInterviewById = async (id: number) => {
    try {
      setLoading(true);
      if (currentInterview) {
        // 이동 전 현재 질문을 history에 저장
        setHistory((prev) => [...prev, currentInterview]);
      }
      const res = await fetch(`http://localhost:8080/interview/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("면접 질문을 가져오는데 실패했습니다.");
      }
      const data: InterviewResponseDto = await res.json();
      setCurrentInterview(data);
      setLoading(false);
      setShowAnswer(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleHeadQuestion = () => {
    if (currentInterview?.head_id) {
      fetchInterviewById(currentInterview.head_id);
    }
  };
  const handleTailQuestion = () => {
    if (currentInterview?.tail_id) {
      fetchInterviewById(currentInterview.tail_id);
    }
  };

  // 정답 보기 토글
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!isRandomMode && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              onClick={startRandomMode}
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
              질문 순서 랜덤하게 생성하기
            </button>
          </div>
        )}

        {isRandomMode && currentInterview && (
          <div style={{ marginTop: "2rem" }}>
            {loading && <p>로딩중...</p>}
            {!loading && (
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

                {/* 정답 보기 버튼 */}
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

                {/* 정답 내용 (showAnswer가 true일 때만) */}
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

                {/* 버튼들: 상위/꼬리 질문, 이전 질문 다시보기, 다음 랜덤 질문 */}
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
                  {/* 다음 랜덤 질문 */}
                  <button
                    onClick={handleNextRandom}
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
