"use client";

const API_URL = "https://devapi.store/api/v1/admin/study";

interface ContentDeleteModalProps {
  content: { id: number; title: string };
  onClose: () => void;
  onDelete: (contentId: number) => void;
}

export default function ContentDeleteModal({
  content,
  onClose,
  onDelete,
}: ContentDeleteModalProps) {
  const handleDelete = async () => {
    try {
      console.log(`삭제 요청: ${API_URL}/${content.id}`);

      const response = await fetch(`${API_URL}/${content.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const responseText = await response.text();
      console.log("서버 응답:", responseText);

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status} ${responseText}`);
      }

      onDelete(content.id);
      onClose();
    } catch (error: any) {
      console.error("삭제 오류:", error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animation-fadeIn">
        {/* 배경 장식 효과 */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-red-300 dark:bg-red-800 opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-purple-300 dark:bg-purple-800 opacity-20 blur-xl"></div>

        <div className="relative p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="https://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
            삭제 확인
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            아래 콘텐츠를 삭제하시겠습니까?
          </p>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <p className="text-gray-800 dark:text-gray-200 font-medium text-center break-words">
              "{content.title}"
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-6 font-medium transition-all flex-1"
            >
              취소
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-2 px-6 font-medium transition-all flex-1 shadow-lg shadow-red-500/20"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
