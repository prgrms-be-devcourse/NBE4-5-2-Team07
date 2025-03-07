"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface InterviewCommentResponseDto {
  commentId: number;
  comment: string;
  isPublic: boolean;
  interviewContentId: number;
}

export default function KeywordStudyPage() {
  const router = useRouter();

  // (A) 키워드 목록 관련 상태
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState<boolean>(true);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);

  // (B) 사용자가 선택한 키워드 (다중 선택)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // (C) 선택된 키워드로부터 받아온 머리 질문 ID 리스트
  const [headIds, setHeadIds] = useState<number[]>([]);
  const [headIdsLoading, setHeadIdsLoading] = useState<boolean>(false);
  const [headIdsError, setHeadIdsError] = useState<string | null>(null);

  // (D) 학습 모드 관련 상태 (질문 상세 보기)
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [currentInterview, setCurrentInterview] =
    useState<InterviewResponseDto | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // (E) 이전 질문 히스토리 (이전 질문 다시보기)
  const [history, setHistory] = useState<InterviewResponseDto[]>([]);

  // (F) 정답 보이기/가리기 상태
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // (G) 추가 상태: 마지막 머리 질문 ID (headIds에 있는 값)
  const [currentHeadId, setCurrentHeadId] = useState<number | null>(null);

  // (H) 추가 상태: 메모(댓글) 입력 및 공개/비공개 상태
  const [commentText, setCommentText] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // (I) 추가 상태: 메모(댓글) 조회 관련 상태
  const [myMemos, setMyMemos] = useState<InterviewCommentResponseDto[]>([]);
  const [publicMemos, setPublicMemos] = useState<InterviewCommentResponseDto[]>(
    []
  );
  const [loadingMemos, setLoadingMemos] = useState<boolean>(false);
  const [memosError, setMemosError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"my" | "public" | null>(null);

  // (J) 추가 상태: 북마크 응답 메시지 상태
  const [bookmarkMessage, setBookmarkMessage] = useState<string>("");

  // (A) 키워드 목록 불러오기
  useEffect(() => {
    setKeywordsLoading(true);
    fetch("http://localhost:8080/interview/keyword", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push("http://localhost:3000/login");
            return;
          }
          throw new Error("키워드 목록을 불러오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data: string[]) => {
        setKeywords(Array.isArray(data) ? data : []);
        setKeywordsLoading(false);
      })
      .catch((err: Error) => {
        setKeywordsError(err.message);
        setKeywordsLoading(false);
      });
  }, [router]);

  // (B) 키워드 선택 토글 (다중 선택)
  const toggleKeywordSelection = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
    );
  };

  // (C) "면접 질문 생성하기" 버튼 클릭 시
  const generateQuestions = () => {
    if (selectedKeywords.length === 0) {
      alert("하나 이상의 키워드를 선택하세요.");
      return;
    }
    setHeadIdsLoading(true);
    fetch("http://localhost:8080/interview/keyword/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywordList: selectedKeywords }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push("http://localhost:3000/login");
            return;
          }
          throw new Error("키워드를 포함한 질문 ID를 받아오는데 실패했습니다.");
        }
        return res.json();
      })
      .then((data: number[]) => {
        setHeadIds(Array.isArray(data) ? data : []);
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
      const res = await fetch(`http://localhost:8080/interview/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
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
      // 질문 변경 시 메모 탭 초기화 및 북마크 메시지 초기화
      setActiveTab(null);
      setBookmarkMessage("");
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // (E) "다음 질문" 버튼
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
    if (headIds.includes(prevInterview.id)) {
      setCurrentHeadId(prevInterview.id);
    }
    setShowAnswer(false);
    setActiveTab(null);
  };

  // (G) 상위 질문 보기
  const handleHeadQuestion = () => {
    if (currentInterview?.head_id) {
      fetchInterview(currentInterview.head_id);
      setCurrentHeadId(currentInterview.head_id);
    }
  };

  // (H) 꼬리 질문 보기 (머리 질문 ID는 그대로 유지)
  const handleTailQuestion = () => {
    if (currentInterview?.tail_id) {
      fetchInterview(currentInterview.tail_id);
    }
  };

  // (I) 정답 보기 토글
  const toggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  // (J) 메모(댓글) 저장 함수
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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("댓글 저장에 실패했습니다.");
      }
      setCommentText("");
      alert("댓글이 저장되었습니다.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // (K) 내 메모 보기 함수
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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
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

  // (L) 다른 사람 메모 보기 함수
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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
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

  // 스타일 객체들
  const containerStyle: React.CSSProperties = {
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const mainBoxStyle: React.CSSProperties = {
    width: "800px",
    margin: "0 auto",
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

  const tabButtonStyleFn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.5rem",
    cursor: "pointer",
    border: active ? "2px solid #2e56bc" : "1px solid #ccc",
    backgroundColor: active ? "#e8e8e8" : "#fff",
    textAlign: "center",
    borderRadius: "6px",
  });

  // (M) 추가 함수: 북마크 토글 기능
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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("북마크 요청에 실패했습니다.");
      }
      const message = await res.text();
      setBookmarkMessage(message);
      alert(message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={mainBoxStyle}>
        {/* 키워드 목록 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          {keywordsLoading && <p>키워드 로딩중...</p>}
          {keywordsError && <p style={{ color: "red" }}>{keywordsError}</p>}
          {!keywordsLoading &&
            Array.isArray(keywords) &&
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
          <div style={{ marginTop: "2rem" }}>
            {detailLoading && <p>질문 로딩중...</p>}
            {detailError && <p style={{ color: "red" }}>{detailError}</p>}
            {!detailLoading && !detailError && (
              <div style={questionBoxStyle}>
                {/* 상단 헤더 영역: 질문 정보와 북마크 버튼 */}
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
                      textAlign: "center",
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
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    내 노트에 추가
                  </button>
                </div>

                {/* 북마크 응답 메시지 */}
                {bookmarkMessage && (
                  <p style={{ marginBottom: "1rem", textAlign: "center" }}>
                    {bookmarkMessage}
                  </p>
                )}

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

                {/* 정답 보기 토글 */}
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
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                  }}
                >
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
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <button
                      onClick={fetchMyMemos}
                      style={tabButtonStyleFn(activeTab === "my")}
                    >
                      내 메모 보기
                    </button>
                    <button
                      onClick={fetchPublicMemos}
                      style={tabButtonStyleFn(activeTab === "public")}
                    >
                      다른 사람 메모 보기
                    </button>
                  </div>
                  {loadingMemos && <p>메모 로딩중...</p>}
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
                                padding: "0.6rem",
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
                                padding: "0.6rem",
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
