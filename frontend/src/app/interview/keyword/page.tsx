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
  likeCount: number;
  likedByUser: boolean;
}

// 수정된 필드명 (public)
interface InterviewCommentResponseDto {
  commentId: number;
  comment: string;
  public: boolean; // 서버에서 응답하는 필드명은 'public'
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
    fetch("https://devapi.store/interview/keyword", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push("https://chilldevprep.vercel.app/login");
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
    fetch("https://devapi.store/interview/keyword/content", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywordList: selectedKeywords }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push("https://chilldevprep.vercel.app/login");
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
      const res = await fetch(`https://devapi.store/interview/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://chilldevprep.vercel.app/login");
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
      // 질문 변경 시 메모 탭 및 북마크 메시지 초기화
      setActiveTab(null);
      setBookmarkMessage("");
    } catch (err: any) {
      setDetailError(err.message);
      setDetailLoading(false);
    }
  };

  // (추가) 좋아요 토글 함수
  const handleLikeToggle = async () => {
    if (!currentInterview) return;
    try {
      const res = await fetch(
        `https://devapi.store/interview/like?id=${currentInterview.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://chilldevprep.vercel.app/login");
          return;
        }
        throw new Error("좋아요 요청에 실패했습니다.");
      }
      const message = await res.text();
      // 복사본 생성 후 상태 업데이트
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
      const res = await fetch("https://devapi.store/api/v1/interview/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          comment: commentText,
          isPublic: isPublic, // API 요청 시에는 isPublic 필드명 유지 (백엔드 요구사항에 따름)
          interviewContentId: currentInterview.id,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://chilldevprep.vercel.app/login");
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
        `https://devapi.store/api/v1/interview/comment/my/${currentInterview.id}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://chilldevprep.vercel.app/login");
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
        `https://devapi.store/api/v1/interview/comment/public/${currentInterview.id}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://chilldevprep.vercel.app/login");
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

  // (M) 추가 함수: 북마크 토글 기능 (이미 구현됨)
  const handleBookmark = async () => {
    if (!currentInterview) return;
    try {
      const res = await fetch(
        `https://devapi.store/interview/bookmark?id=${currentInterview.id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) {
        if (res.status === 401) {
          router.push("https://chilldevprep.vercel.app/login");
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

      {/* Main content container */}
      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* 페이지 헤더 */}
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
          키워드 기반 면접 스터디
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            키워드 선택
          </h2>

          {/* 키워드 목록 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {keywordsLoading && (
              <div className="w-full flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
              </div>
            )}

            {keywordsError && (
              <div className="w-full bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded mb-4">
                <p>{keywordsError}</p>
              </div>
            )}

            {!keywordsLoading &&
              Array.isArray(keywords) &&
              keywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => toggleKeywordSelection(kw)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedKeywords.includes(kw)
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {kw}
                </button>
              ))}
          </div>

          {/* "면접 질문 생성하기" 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={generateQuestions}
              disabled={selectedKeywords.length === 0 || headIdsLoading}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2 px-6 font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {headIdsLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  처리 중...
                </>
              ) : (
                <>
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  면접 질문 생성하기
                </>
              )}
            </button>
          </div>

          {headIdsError && (
            <div className="mt-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded">
              <p>{headIdsError}</p>
            </div>
          )}
        </div>

        {/* 학습 모드: 질문 상세 영역 */}
        {isStudyMode && (
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

            {!detailLoading && !detailError && currentInterview && (
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
                        xmlns="https://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill={
                          currentInterview.likedByUser ? "currentColor" : "none"
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
                      xmlns="https://www.w3.org/2000/svg"
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
                  <div className="mb-4 text-center text-indigo-600 dark:text-indigo-400 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
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
                          xmlns="https://www.w3.org/2000/svg"
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
                          xmlns="https://www.w3.org/2000/svg"
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
                    showAnswer ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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
                        xmlns="https://www.w3.org/2000/svg"
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
                        xmlns="https://www.w3.org/2000/svg"
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
                        xmlns="https://www.w3.org/2000/svg"
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
                      xmlns="https://www.w3.org/2000/svg"
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
                        xmlns="https://www.w3.org/2000/svg"
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
  );
}
