"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const JobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { recrutPblntSn } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!recrutPblntSn) return;

    const fetchJobDetail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://devapi.store/api/v1/news/jobs/detail/${recrutPblntSn}`
        );
        setJobDetail(response.data);
      } catch (error) {
        console.error("Error fetching job detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetail();
  }, [recrutPblntSn]);

  // 로딩 중 표시
  if (loading)
    return (
      <div className="text-center text-gray-500 dark:text-gray-300">
        Loading...
      </div>
    );

  // 데이터가 없을 경우 표시
  if (!jobDetail)
    return (
      <div className="text-center text-gray-500 dark:text-gray-300">
        No job details available
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>

      {/* 코드 파티클 배경 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
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
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 md:p-12 relative">
          <button
            onClick={() => router.back()}
            className="absolute top-6 left-6 text-gray-500 dark:text-gray-300 hover:text-indigo-600 transition-all"
          >
            &larr; Back
          </button>

          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            {jobDetail.recrutPbancTtl}
          </h2>

          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              기관: <span className="font-semibold">{jobDetail.instNm}</span>
            </p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              모집 유형:{" "}
              <span className="font-semibold">{jobDetail.recrutSeNm}</span>
            </p>
          </div>

          <div className="mb-6">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              모집 설명:
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {jobDetail.prefCondCn}
            </p>
          </div>

          <div className="mb-6">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              지원 자격:
            </p>
            <div className="mt-2 text-gray-600 dark:text-gray-400">
              {jobDetail.aplyQlfcCn
                .split("□")
                .map((line: string, index: number) => (
                  <p key={index}>
                    <span className="font-semibold">{index + 1}.</span>{" "}
                    {line.trim()}
                  </p> // 각 항목에 번호 부여
                ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              모집 기간:{" "}
              <span className="font-semibold">
                {jobDetail.pbancBgngYmd} - {jobDetail.pbancEndYmd}
              </span>
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <a
              href={jobDetail.srcUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 font-semibold transition-all"
            >
              채용 공고 보기
            </a>
          </div>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
            <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
