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

interface InterviewCommentResponseDto {
  commentId: number;
  comment: string;
  isPublic: boolean;
  interviewContentId: number;
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

  // 댓글 입력 상태
  const [commentText, setCommentText] = useState<string>("");
  // 공개/비공개 토글 상태 (체크하면 공개)
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // 메모(댓글) 목록 관련 상태
  const [myMemos, setMyMemos] = useState<InterviewCommentResponseDto[]>([]);
  const [publicMemos, setPublicMemos] = useState<InterviewCommentResponseDto[]>(
    []
  );
  const [loadingMemos, setLoadingMemos] = useState<boolean>(false);
  const [memosError, setMemosError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"my" | "public" | null>(null);

  // 북마크 응답 메시지 상태
  const [bookmarkMessage, setBookmarkMessage] = useState<string>("");

  // 스타일 객체
  const containerStyle: React.CSSProperties = {
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    justifyContent: "center",
  };

  // 메인 박스 너비를 늘림 (기존 maxWidth: 700px → 900px)
  const mainBoxStyle: React.CSSProperties = {
    width: "900px",
    margin: "0 auto",
    marginTop: "2rem",
  };

  const questionBoxStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "1.5rem",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    position: "relative",
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
    padding: "0.6rem",
    cursor: "pointer",
    borderBottom: active ? "3px solid #2e56bc" : "1px solid #ccc",
    backgroundColor: active ? "#f1f1f1" : "#fff",
    textAlign: "center",
    fontWeight: active ? "bold" : "normal",
  });

  // 북마크 토글 함수
  const handleBookmark = async () => {
    if (!currentInterview) return;
    try {
      const res = await fetch(
        `http://localhost:8080/interview/bookmark?id=${currentInterview.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("북마크 요청에 실패했습니다.");
      }
      const message = await res.text();
      setBookmarkMessage(message);
      // 응답 메시지를 alert로 표시할 수도 있음
      alert(message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 전체 ID 리스트 fetch (컴포넌트 마운트 시)
  useEffect(() => {
    setListLoading(true);
    fetch("http://localhost:8080/interview/all", {
      method: "GET",
      credentials: "include",
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
      // 방문 전 현재 질문이 있다면 히스토리에 저장
      setCurrentInterview((prev) => {
        if (prev) {
          setHistory((h) => [...h, prev]);
        }
        return prev;
      });
      const res = await fetch(`http://localhost:8080/interview/${id}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("면접 질문을 가져오는 데 실패했습니다.");
      }
      const data: InterviewResponseDto = await res.json();
      setCurrentInterview(data);
      setDetailLoading(false);
      setDetailError(null);
      setShowAnswer(false);
      // 북마크 메시지 초기화
      setBookmarkMessage("");
      // 초기에는 탭 비활성화
      setActiveTab(null);
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // "학습하기" 버튼 클릭 시
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

  // 이전 질문 다시보기
  const handlePreviousQuestion = () => {
    if (history.length > 0) {
      const prevInterview = history[history.length - 1];
      setHistory(history.slice(0, history.length - 1));
      setCurrentInterview(prevInterview);
      setShowAnswer(false);
      setActiveTab(null);
    }
  };

  // 정답 보기 토글
  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  const handleCommentSubmit = async () => {
    if (!currentInterview) return;
    if (commentText.trim() === "") {
      alert("댓글을 입력하세요.");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:8080/api/v1/interview/comment",
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
      // 변경된 API 응답 DTO (MyPageInterviewCommentResponseDto) 파싱
      const createdComment = await res.json();
      setCommentText("");
      alert("댓글이 저장되었습니다.");
      // 필요 시 createdComment를 상태 업데이트 등에 활용
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
        `http://localhost:8080/api/v1/interview/comment/my/${currentInterview.id}`,
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
        `http://localhost:8080/api/v1/interview/comment/public/${currentInterview.id}`,
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
      <div style={mainBoxStyle}>
        {listLoading && <p>목록 로딩중...</p>}
        {listError && (
          <p style={{ color: "#d9534f" }}>오류 발생: {listError}</p>
        )}

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
                color: "#fff",
                cursor: "pointer",
                marginTop: "2rem",
              }}
            >
              기술 면접 예상 질문 학습하기
            </button>
          </div>
        )}

        {isStudyMode && currentInterview && (
          <div style={{ marginTop: "2rem" }}>
            {detailLoading && <p>질문 로딩중...</p>}
            {detailError && (
              <p style={{ color: "#d9534f" }}>오류 발생: {detailError}</p>
            )}
            {!detailLoading && !detailError && (
              <div style={questionBoxStyle}>
                {/* 상단 헤더 영역: 카테고리/키워드와 북마크 버튼 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#e8e8e8",
                      borderRadius: "6px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {currentInterview.category.toUpperCase()} &gt;{" "}
                    {currentInterview.keyword}
                  </div>
                  <button
                    onClick={handleBookmark}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#5cb85c",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    내 노트에 추가
                  </button>
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

                {/* 정답 보기 */}
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <button
                    onClick={toggleAnswer}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: showAnswer ? "#d9534f" : "#5cb85c",
                      color: "#fff",
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

                {/* 댓글 입력 영역 */}
                <div style={commentContainerStyle}>
                  <h3 style={{ textAlign: "center", marginBottom: "0.8rem" }}>
                    MEMO
                  </h3>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="질문에 대한 메모를 남겨보세요..."
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "0.8rem",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      resize: "vertical",
                      marginBottom: "0.8rem",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={() => setIsPublic((prev) => !prev)}
                        style={{
                          marginRight: "0.5rem",
                          transform: "scale(1.2)",
                        }}
                      />
                      공개
                    </label>
                    <button
                      onClick={handleCommentSubmit}
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#2e56bc",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      SAVE
                    </button>
                  </div>
                </div>

                {/* 댓글 조회 영역 */}
                <div style={{ ...commentContainerStyle, marginTop: "1.5rem" }}>
                  <div style={{ display: "flex" }}>
                    <div
                      style={tabButtonStyle(activeTab === "my")}
                      onClick={fetchMyMemos}
                    >
                      내 메모 보기
                    </div>
                    <div
                      style={tabButtonStyle(activeTab === "public")}
                      onClick={fetchPublicMemos}
                    >
                      다른 사람 메모 보기
                    </div>
                  </div>
                  {loadingMemos && (
                    <p style={{ textAlign: "center", marginTop: "0.8rem" }}>
                      메모 로딩중...
                    </p>
                  )}
                  {memosError && (
                    <p
                      style={{
                        color: "#d9534f",
                        textAlign: "center",
                        marginTop: "0.8rem",
                      }}
                    >
                      {memosError}
                    </p>
                  )}
                  {activeTab === "my" && !loadingMemos && (
                    <>
                      {myMemos.length > 0 ? (
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            marginTop: "0.8rem",
                          }}
                        >
                          {myMemos.map((memo) => (
                            <li
                              key={memo.commentId}
                              style={{
                                padding: "0.6rem",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              {memo.comment}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ textAlign: "center", marginTop: "0.8rem" }}>
                          작성한 메모가 없습니다.
                        </p>
                      )}
                    </>
                  )}
                  {activeTab === "public" && !loadingMemos && (
                    <>
                      {publicMemos.length > 0 ? (
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            marginTop: "0.8rem",
                          }}
                        >
                          {publicMemos.map((memo) => (
                            <li
                              key={memo.commentId}
                              style={{
                                padding: "0.6rem",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              {memo.comment}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ textAlign: "center", marginTop: "0.8rem" }}>
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
