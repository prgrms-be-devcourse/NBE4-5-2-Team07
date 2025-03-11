"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/v1/admin/study";

interface StudyContentDetailDto {
  id: number;
  firstCategory: string;
  secondCategory: string;
  title: string;
  body: string;
}

interface StudyContentUpdateRequestDto {
  title: string;
  firstCategory: string;
  secondCategory: string;
  updateContent: string;
}

interface ContentEditModalProps {
  content: StudyContentDetailDto;
  onClose: () => void;
  onUpdate: (updatedContent: StudyContentDetailDto) => void;
}

export default function ContentEditModal({
  content,
  onClose,
  onUpdate,
}: ContentEditModalProps) {
  const [title, setTitle] = useState(content.title);
  const [firstCategory, setFirstCategory] = useState(content.firstCategory);
  const [secondCategory, setSecondCategory] = useState(content.secondCategory);
  const [updateContent, setUpdateContent] = useState(content.body);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/all`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`서버 오류 발생: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const firstKeys = Object.keys(data);
        setCategories(firstKeys);

        if (!firstCategory && firstKeys.length > 0) {
          setFirstCategory(firstKeys[0]);
        }
      })
      .catch(() => {
        setError("카테고리를 불러오는 데 실패했습니다.");
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const updatedData: StudyContentUpdateRequestDto = {
      title: title.trim() !== "" ? title : content.title,
      firstCategory,
      secondCategory,
      updateContent,
    };

    try {
      const response = await fetch(`${API_URL}/${content.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      let responseData;
      const responseText = await response.text();

      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        responseData = responseText;
      }

      if (!response.ok) {
        throw new Error(
          responseData.message || responseData || "수정에 실패했습니다."
        );
      }

      const updatedContent: StudyContentDetailDto = {
        id: content.id,
        firstCategory,
        secondCategory,
        title,
        body: updateContent,
      };

      onUpdate(updatedContent);
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animation-fadeIn">
        {/* 배경 장식 효과 */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-yellow-300 dark:bg-yellow-800 opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-pink-300 dark:bg-pink-800 opacity-20 blur-xl"></div>

        <div className="relative p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-4">
            학습 콘텐츠 수정
          </h2>

          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p className="font-medium">오류</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                제목:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                첫 번째 카테고리:
              </label>
              <select
                value={firstCategory}
                onChange={(e) => setFirstCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                ) : (
                  <option disabled>카테고리를 불러오는 중...</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                두 번째 카테고리:
              </label>
              <input
                type="text"
                value={secondCategory}
                onChange={(e) => setSecondCategory(e.target.value)}
                placeholder="새로운 카테고리를 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                내용:
              </label>
              <textarea
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-2 px-6 font-medium transition-all shadow-lg shadow-indigo-500/20 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
