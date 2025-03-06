"use client";

import React, { useEffect, useState } from "react";

// 질문 데이터 타입
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

// 댓글(메모) 데이터 타입
interface InterviewCommentResponseDto {
  commentId: number;
  comment: string;
  isPublic: boolean;
  interviewContentId: number;
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

  // 댓글 입력 상태
  const [commentText, setCommentText] = useState<string>("");
  // 공개/비공개 토글 상태 (체크하면 공개)
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // 메모(댓글) 목록 상태
  const [myMemos, setMyMemos] = useState<InterviewCommentResponseDto[]>([]);
  const [publicMemos, setPublicMemos] = useState<InterviewCommentResponseDto[]>(
    []
  );
  const [loadingMemos, setLoadingMemos] = useState<boolean>(false);
  const [memosError, setMemosError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"my" | "public" | null>(null);

  // 스타일 정의
  // 1) 컨테이너의 padding을 제거하거나 최소화하고,
  // 2) leftPanelStyle에 margin을 부여하여 좀 더 왼쪽/위쪽으로 배치.
  const containerStyle: React.CSSProperties = {
    display: "flex",
    fontFamily: "Arial, sans-serif",
    // 기존에 있던 padding: "1rem" 제거 혹은 줄이기
    padding: 0,
    gap: "2rem",
    // 수직 정렬을 맨 위로
    alignItems: "flex-start",
  };

  const leftPanelStyle: React.CSSProperties = {
    width: "200px",
    // 왼쪽/위쪽으로 붙이기 위해 margin을 조정
    marginLeft: "1rem",
    marginTop: "1rem",
  };

  // 중앙 질문 박스: 고정 폭 900px, 가운데 정렬
  const mainBoxStyle: React.CSSProperties = {
    width: "900px",
    margin: "0 auto",
    // 상단 여백을 조금 줄이고 싶다면 marginTop 조절
  };

  const questionBoxStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "1.5rem",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  };

  const commentContainerStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const tabButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.5rem",
    cursor: "pointer",
    border: active ? "2px solid #2e56bc" : "1px solid #ccc",
    backgroundColor: active ? "#e8e8e8" : "#fff",
    textAlign: "center",
    borderRadius: "6px",
  });

  // 카테고리 버튼 클릭 시
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
      // 이전 질문을 히스토리에 저장
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
      // 새 질문 로드시 탭 초기화
      setActiveTab(null);
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // "학습하기" 버튼 클릭 시
  const startStudy = () => {
    if (headIds.length === 0) {
      alert("해당 분야의 머리 질문 ID 리스트가 없습니다.");
      return;
    }
    setIsStudyMode(true);
    setHistory([]);
    fetchInterview(headIds[0]);
  };

  // "다음 질문" 버튼
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
    setActiveTab(null);
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

  // 댓글 저장 함수
  const handleCommentSubmit = async () => {
    if (!currentInterview) return;
    if (commentText.trim() === "") {
      alert("댓글을 입력하세요.");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:8080/api/v1/interview-comments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            comment: commentText,
            isPublic: isPublic,
            interviewContentId: currentInterview.id,
          }),
        }
      );
      if (!res.ok) {
        throw new Error("댓글 저장에 실패했습니다.");
      }
      setCommentText("");
      alert("댓글이 저장되었습니다.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 내 메모 보기
  const fetchMyMemos = async () => {
    if (!currentInterview) return;
    setLoadingMemos(true);
    setMemosError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/interview-comments/my/${currentInterview.id}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        throw new Error("내 메모를 가져오는데 실패했습니다.");
      }
      const data: InterviewCommentResponseDto[] = await res.json();
      setMyMemos(data);
      setActiveTab("my");
    } catch (err: any) {
      setMemosError(err.message);
    } finally {
      setLoadingMemos(false);
    }
  };

  // 다른 사람 메모 보기
  const fetchPublicMemos = async () => {
    if (!currentInterview) return;
    setLoadingMemos(true);
    setMemosError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/interview-comments/public/${currentInterview.id}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        throw new Error("공개 메모를 가져오는데 실패했습니다.");
      }
      const data: InterviewCommentResponseDto[] = await res.json();
      setPublicMemos(data);
      setActiveTab("public");
    } catch (err: any) {
      setMemosError(err.message);
    } finally {
      setLoadingMemos(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* 좌측 카테고리 영역 */}
      <div style={leftPanelStyle}>
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

      {/* 중앙 질문 박스 (고정 폭 900px) */}
      <div style={mainBoxStyle}>
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

        {/* 학습 모드: 질문 상세 영역 */}
        {isStudyMode && currentInterview && (
          <div style={{ marginTop: "2rem" }}>
            {detailLoading && <p>질문 로딩중...</p>}
            {detailError && <p style={{ color: "red" }}>{detailError}</p>}
            {!detailLoading && !detailError && (
              <div style={questionBoxStyle}>
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

                {/* 정답 보기 토글 버튼 */}
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

                {/* 댓글(메모) 입력 영역 */}
                <div style={commentContainerStyle}>
                  <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                    MEMO
                  </h3>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="질문에 대한 메모를 남겨보세요..."
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "0.5rem",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      resize: "vertical",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "0.5rem",
                      gap: "0.5rem",
                    }}
                  >
                    <label style={{ fontSize: "1rem" }}>
                      공개
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={() => setIsPublic((prev) => !prev)}
                        style={{
                          marginLeft: "0.5rem",
                          marginRight: "1rem",
                          transform: "scale(1.5)",
                        }}
                      />
                    </label>
                    <button
                      onClick={handleCommentSubmit}
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#2e56bc",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                </div>

                {/* 댓글(메모) 조회 영역 */}
                <div style={{ ...commentContainerStyle, marginTop: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <button
                      onClick={fetchMyMemos}
                      style={tabButtonStyle(activeTab === "my")}
                    >
                      내 메모 보기
                    </button>
                    <button
                      onClick={fetchPublicMemos}
                      style={tabButtonStyle(activeTab === "public")}
                    >
                      다른 사람 메모 보기
                    </button>
                  </div>
                  {loadingMemos && (
                    <p style={{ textAlign: "center" }}>메모 로딩중...</p>
                  )}
                  {memosError && (
                    <p style={{ color: "red", textAlign: "center" }}>
                      {memosError}
                    </p>
                  )}
                  {activeTab === "my" && !loadingMemos && (
                    <>
                      {myMemos.length > 0 ? (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {myMemos.map((memo) => (
                            <li
                              key={memo.commentId}
                              style={{
                                padding: "0.5rem",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              {memo.comment}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ textAlign: "center" }}>
                          내 메모가 없습니다.
                        </p>
                      )}
                    </>
                  )}
                  {activeTab === "public" && !loadingMemos && (
                    <>
                      {publicMemos.length > 0 ? (
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {publicMemos.map((memo) => (
                            <li
                              key={memo.commentId}
                              style={{
                                padding: "0.5rem",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              {memo.comment}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ textAlign: "center" }}>
                          공개 메모가 없습니다.
                        </p>
                      )}
                    </>
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
