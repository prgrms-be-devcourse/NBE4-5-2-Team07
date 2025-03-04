"use client";

import React, { useEffect, useState } from "react";

// 백엔드 DTO 타입들
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

export default function KeywordStudyPage() {
  // 1. 키워드 목록 관련 상태 (GET /interview/keyword)
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState<boolean>(true);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);

  // 2. 사용자가 선택한 키워드 (다중 선택)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // 3. 선택된 키워드로부터 받아온 머리 질문 ID 리스트
  const [headIds, setHeadIds] = useState<number[]>([]);
  const [headIdsLoading, setHeadIdsLoading] = useState<boolean>(false);
  const [headIdsError, setHeadIdsError] = useState<string | null>(null);

  // 4. 학습 모드 관련 상태 (질문 상세 보기)
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [currentInterview, setCurrentInterview] =
    useState<InterviewResponseDto | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // 5. 이전 질문 히스토리 (이전 질문 다시보기)
  const [history, setHistory] = useState<InterviewResponseDto[]>([]);

  // 6. 정답 보이기/가리기 상태
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // **추가 상태**: 마지막 머리 질문 ID (headIds에 있는 값)
  const [currentHeadId, setCurrentHeadId] = useState<number | null>(null);

  // (A) 키워드 목록 불러오기
  useEffect(() => {
    setKeywordsLoading(true);
    fetch("http://localhost:8080/interview/keyword")
      .then((res) => {
        if (!res.ok) {
          throw new Error("키워드 목록을 불러오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data: string[]) => {
        setKeywords(data);
        setKeywordsLoading(false);
      })
      .catch((err: Error) => {
        setKeywordsError(err.message);
        setKeywordsLoading(false);
      });
  }, []);

  // (B) 키워드 선택 토글 (다중 선택)
  const toggleKeywordSelection = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  // (C) "면접 질문 생성하기" 버튼 클릭 시
  // POST /interview/keyword/content { keywordList: selectedKeywords }
  const generateQuestions = () => {
    if (selectedKeywords.length === 0) {
      alert("하나 이상의 키워드를 선택하세요.");
      return;
    }
    setHeadIdsLoading(true);
    fetch("http://localhost:8080/interview/keyword/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywordList: selectedKeywords }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("키워드를 포함한 질문 ID를 받아오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data: number[]) => {
        setHeadIds(data);
        setHeadIdsLoading(false);
        if (data.length === 0) {
          alert("선택한 키워드에 해당하는 질문이 없습니다.");
          return;
        }
        setIsStudyMode(true);
        setHistory([]);
        // 머리 질문 시작 시 currentHeadId 업데이트
        setCurrentHeadId(data[0]);
        fetchInterview(data[0]);
      })
      .catch((err: Error) => {
        setHeadIdsError(err.message);
        setHeadIdsLoading(false);
      });
  };

  // (D) GET /interview/{id} 로 특정 질문 상세 데이터 불러오기
  const fetchInterview = async (id: number) => {
    try {
      setDetailLoading(true);
      // 이전 질문 히스토리에 저장
      setCurrentInterview((prev) => {
        if (prev) {
          setHistory((h) => [...h, prev]);
        }
        return prev;
      });
      const res = await fetch(`http://localhost:8080/interview/${id}`);
      if (!res.ok) {
        throw new Error("면접 질문 상세 정보를 불러오는데 실패했습니다.");
      }
      const data: InterviewResponseDto = await res.json();
      setCurrentInterview(data);
      setDetailLoading(false);
      setDetailError(null);
      setShowAnswer(false);
      // 만약 불러온 질문이 머리 질문 리스트에 포함되어 있으면 currentHeadId 업데이트
      if (headIds.includes(data.id)) {
        setCurrentHeadId(data.id);
      }
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // (E) "다음 질문" 버튼: 현재 머리 질문(currentHeadId)를 기준으로 headIds 배열에서 다음 질문 ID를 가져옴
  const handleNextQuestion = () => {
    if (currentHeadId === null) return;
    const currentIndex = headIds.indexOf(currentHeadId);
    if (currentIndex < 0) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= headIds.length) {
      alert("마지막 질문입니다!");
      return;
    }
    const nextHeadId = headIds[nextIndex];
    setCurrentHeadId(nextHeadId);
    fetchInterview(nextHeadId);
  };

  // (F) "이전 질문 다시보기" 버튼
  const handlePreviousQuestion = () => {
    if (history.length === 0) return;
    const prevInterview = history[history.length - 1];
    setHistory(history.slice(0, history.length - 1));
    setCurrentInterview(prevInterview);
    // 만약 이전 질문이 머리 질문이면 currentHeadId 업데이트
    if (headIds.includes(prevInterview.id)) {
      setCurrentHeadId(prevInterview.id);
    }
    setShowAnswer(false);
  };

  // (G) 상위 질문 보기
  const handleHeadQuestion = () => {
    if (currentInterview?.head_id) {
      fetchInterview(currentInterview.head_id);
      // 상위 질문은 머리 질문이므로 업데이트
      setCurrentHeadId(currentInterview.head_id);
    }
  };

  // (H) 꼬리 질문 보기 (머리 질문 ID는 그대로 유지)
  const handleTailQuestion = () => {
    if (currentInterview?.tail_id) {
      fetchInterview(currentInterview.tail_id);
      // currentHeadId는 변경하지 않음
    }
  };

  // (I) 정답 보기 토글
  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "1rem",
        fontFamily: "Arial, sans-serif",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center",
          marginBottom: "1rem",
          maxWidth: "800px",
        }}
      >
        {keywordsLoading && <p>키워드 로딩중...</p>}
        {keywordsError && <p style={{ color: "red" }}>{keywordsError}</p>}
        {!keywordsLoading &&
          keywords.map((kw) => (
            <button
              key={kw}
              onClick={() => toggleKeywordSelection(kw)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                borderRadius: "6px",
                border: selectedKeywords.includes(kw)
                  ? "2px solid #2e56bc"
                  : "1px solid #ccc",
                backgroundColor: selectedKeywords.includes(kw)
                  ? "#e8e8e8"
                  : "#fff",
                cursor: "pointer",
              }}
            >
              {kw}
            </button>
          ))}
      </div>

      {/* "면접 질문 생성하기" 버튼 */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button
          onClick={generateQuestions}
          disabled={selectedKeywords.length === 0 || headIdsLoading}
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
          면접 질문 생성하기
        </button>
      </div>

      {/* 학습 모드: 질문 상세 영역 */}
      {isStudyMode && currentInterview && (
        <div style={{ width: "100%", maxWidth: "700px" }}>
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
                    <strong>모범 답안:</strong> {currentInterview.model_answer}
                  </p>
                </div>
              )}

              {/* 하단 탐색 버튼 그룹 */}
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
  );
}
