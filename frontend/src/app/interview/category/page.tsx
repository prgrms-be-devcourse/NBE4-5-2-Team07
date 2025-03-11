"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  likeCount: number;
  likedByUser: boolean;
}

// 댓글(메모) 데이터 타입 - public 필드명 수정
interface InterviewCommentResponseDto {
  commentId: number;
  comment: string;
  public: boolean; // 서버에서 응답하는 필드명은 'public'
  interviewContentId: number;
}

export default function CategoryStudyPage() {
  const router = useRouter();

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

  // 북마크 응답 메시지 상태
  const [bookmarkMessage, setBookmarkMessage] = useState<string>("");

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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("북마크 요청에 실패했습니다.");
      }
      const message = await res.text();
      setBookmarkMessage(message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 좋아요 토글 함수
  const handleLikeToggle = async () => {
    if (!currentInterview) return;
    try {
      const res = await fetch(
        `http://localhost:8080/interview/like?id=${currentInterview.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("좋아요 요청에 실패했습니다.");
      }
      const message = await res.text();
      let updatedInterview = { ...currentInterview };
      if (message === "좋아요 추가") {
        updatedInterview.likedByUser = true;
        updatedInterview.likeCount = updatedInterview.likeCount + 1;
      } else if (message === "좋아요 취소") {
        updatedInterview.likedByUser = false;
        updatedInterview.likeCount = updatedInterview.likeCount - 1;
      }
      setCurrentInterview(updatedInterview);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 카테고리 버튼 클릭 시
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsStudyMode(false);
    setCurrentInterview(null);
    setHistory([]);
    setListLoading(true);
    fetch(`http://localhost:8080/interview/category/${category}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push("http://localhost:3000/login");
            return;
          }
          throw new Error(
            `"${category}" 질문 리스트를 받아오는데 실패했습니다.`
          );
        }
        return res.json();
      })
      .then((data: number[]) => {
        setHeadIds(Array.isArray(data) ? data : []);
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
      const res = await fetch(`http://localhost:8080/interview/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("면접 질문을 가져오는 데 실패했습니다.");
      }
      const data: InterviewResponseDto = await res.json();
      setCurrentInterview(data);
      setDetailLoading(false);
      setDetailError(null);
      setShowAnswer(false);
      setBookmarkMessage("");
      setActiveTab(null);
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // "학습하기" 버튼 클릭 시
  const startStudy = () => {
    if ((headIds || []).length === 0) {
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
        "http://localhost:8080/api/v1/interview/comment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            comment: commentText,
            isPublic: isPublic, // API 요청 시에는 isPublic 필드명 유지 (백엔드 요구사항에 따름)
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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("내 메모를 가져오는데 실패했습니다.");
      }
      const data: InterviewCommentResponseDto[] = await res.json();
      setMyMemos(Array.isArray(data) ? data : []);
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
        if (res.status === 401) {
          router.push("http://localhost:3000/login");
          return;
        }
        throw new Error("공개 메모를 가져오는데 실패했습니다.");
      }
      const data: InterviewCommentResponseDto[] = await res.json();
      setPublicMemos(Array.isArray(data) ? data : []);
      setActiveTab("public");
    } catch (err: any) {
      setMemosError(err.message);
    } finally {
      setLoadingMemos(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>

      {/* Code particles decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-gray-800 dark:text-gray-200 text-opacity-30 font-mono text-sm"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 90 - 45}deg)`,
            }}
          >
            {
              [
                "function()",
                "const data = []",
                "for(let i=0;)",
                "if(isValid)",
                "return result",
                "{ }",
                "=> {}",
                "import",
                "export",
                "class",
              ][Math.floor(Math.random() * 10)]
            }
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측 카테고리 영역 */}
          <div className="lg:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 h-fit">
            <h3 className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
              카테고리 선택
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full py-3 px-4 rounded-md text-base font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600 dark:border-indigo-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 중앙 질문 박스 */}
          <div className="flex-1 max-w-4xl mx-auto">
            {listLoading && (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            )}

            {listError && (
              <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded mb-6">
                <p className="font-medium">오류 발생:</p>
                <p>{listError}</p>
              </div>
            )}

            {/* 카테고리 선택 후 학습 모드 시작 전 "학습하기" 버튼 */}
            {selectedCategory && !isStudyMode && !listLoading && !listError && (
              <div className="text-center mt-12">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                  {selectedCategory} 분야 학습
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  {selectedCategory} 분야의 면접 질문들을 학습하고 메모할 수
                  있습니다.
                </p>
                <button
                  onClick={startStudy}
                  disabled={!(headIds && headIds.length > 0)}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {selectedCategory} 분야 학습하기
                </button>
              </div>
            )}

            {/* 학습 모드: 질문 상세 영역 */}
            {isStudyMode && currentInterview && (
              <div className="mt-8">
                {detailLoading && (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                  </div>
                )}

                {detailError && (
                  <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded mb-6">
                    <p className="font-medium">오류 발생:</p>
                    <p>{detailError}</p>
                  </div>
                )}

                {!detailLoading && !detailError && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-all">
                    {/* 상단 헤더 영역: 카테고리/키워드, 북마크, 좋아요 버튼 */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md font-semibold">
                          {currentInterview.category.toUpperCase()} &gt;{" "}
                          {currentInterview.keyword}
                        </div>
                        <button
                          onClick={handleLikeToggle}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-white transition-colors ${
                            currentInterview.likedByUser
                              ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                              : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill={
                              currentInterview.likedByUser
                                ? "currentColor"
                                : "none"
                            }
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {currentInterview.likedByUser
                            ? `취소 (${currentInterview.likeCount})`
                            : `좋아요 (${currentInterview.likeCount})`}
                        </button>
                      </div>
                      <button
                        onClick={handleBookmark}
                        className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                        내 노트에 추가
                      </button>
                    </div>

                    {/* 북마크 응답 메시지 */}
                    {bookmarkMessage && (
                      <div className="text-center text-indigo-600 dark:text-indigo-400 py-2">
                        {bookmarkMessage}
                      </div>
                    )}

                    {/* 질문 내용 */}
                    <div className="mb-6">
                      <h2 className="text-lg font-medium mb-2 text-gray-600 dark:text-gray-400">
                        질문:
                      </h2>
                      <p className="text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
                        {currentInterview.question}
                      </p>
                    </div>

                    {/* 정답 보기 */}
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={toggleAnswer}
                        className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${
                          showAnswer
                            ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                        }`}
                      >
                        {showAnswer ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                            정답 가리기
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            정답 보기
                          </>
                        )}
                      </button>
                    </div>

                    {/* 정답 내용 */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        showAnswer
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      } mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4`}
                    >
                      <h2 className="text-lg font-medium mb-2 text-gray-600 dark:text-gray-400">
                        모범 답안:
                      </h2>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                        {currentInterview.model_answer}
                      </p>
                    </div>

                    {/* 탐색 버튼 그룹 */}
                    <div className="flex flex-wrap gap-2 justify-center my-6">
                      {currentInterview.head_id && (
                        <button
                          onClick={handleHeadQuestion}
                          className="inline-flex items-center px-4 py-2 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 11l5-5m0 0l5 5m-5-5v12"
                            />
                          </svg>
                          상위 질문 보기
                        </button>
                      )}
                      {currentInterview.tail_id && (
                        <button
                          onClick={handleTailQuestion}
                          className="inline-flex items-center px-4 py-2 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                            />
                          </svg>
                          꼬리 질문
                        </button>
                      )}
                      {history.length > 0 && (
                        <button
                          onClick={handlePreviousQuestion}
                          className="inline-flex items-center px-4 py-2 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                            />
                          </svg>
                          이전 질문 다시보기
                        </button>
                      )}
                      <button
                        onClick={handleNextQuestion}
                        className="inline-flex items-center px-4 py-2 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                        다음 질문
                      </button>
                    </div>

                    {/* 메모 입력 영역 */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                        나의 메모
                      </h3>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="질문에 대한 메모를 남겨보세요..."
                        className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y mb-4"
                      />
                      <div className="flex flex-wrap justify-between items-center">
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={() => setIsPublic((prev) => !prev)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                          />
                          다른 사용자에게 공개
                        </label>
                        <button
                          onClick={handleCommentSubmit}
                          className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          저장하기
                        </button>
                      </div>
                    </div>

                    {/* 메모 조회 영역 */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={fetchMyMemos}
                          className={`flex-1 px-4 py-3 text-center font-medium ${
                            activeTab === "my"
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          }`}
                        >
                          내 메모 보기
                        </button>
                        <button
                          onClick={fetchPublicMemos}
                          className={`flex-1 px-4 py-3 text-center font-medium ${
                            activeTab === "public"
                              ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          }`}
                        >
                          다른 사람 메모 보기
                        </button>
                      </div>

                      <div className="p-4">
                        {loadingMemos && (
                          <div className="flex justify-center items-center h-24">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                          </div>
                        )}

                        {memosError && (
                          <div className="text-red-500 dark:text-red-400 text-center py-4">
                            {memosError}
                          </div>
                        )}

                        {activeTab === "my" && !loadingMemos && (
                          <>
                            {myMemos.length > 0 ? (
                              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {myMemos.map((memo) => (
                                  <li key={memo.commentId} className="py-3">
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                      {memo.comment}
                                    </p>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                          memo.public
                                            ? "bg-green-500"
                                            : "bg-yellow-500"
                                        }`}
                                      ></span>
                                      {memo.public ? "공개" : "비공개"}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                                작성한 메모가 없습니다
                              </div>
                            )}
                          </>
                        )}

                        {activeTab === "public" && !loadingMemos && (
                          <>
                            {publicMemos.length > 0 ? (
                              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {publicMemos.map((memo) => (
                                  <li key={memo.commentId} className="py-3">
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                      {memo.comment}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                                공개된 메모가 없습니다
                              </div>
                            )}
                          </>
                        )}

                        {!activeTab && !loadingMemos && (
                          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                            탭을 선택하여 메모를 확인하세요
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
