"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface JobResponseDto {
  totalCount: number;
  result: Job[];
}

interface Job {
  recrutPblntSn: number;
  pblntInstCd: string;
  pbadmsStdInstCd: string;
  instNm: string;
  ncsCdLst: string;
  ncsCdNmLst: string;
  hireTypeLst: string;
  hireTypeNmLst: string;
  workRgnLst: string;
  workRgnNmLst: string;
  recrutSe: string;
  recrutSeNm: string;
  prefCondCn: string;
  recrutNope: number;
  pbancBgngYmd: string;
  pbancEndYmd: string;
  recrutPbancTtl: string;
  srcUrl: string;
  replmprYn: string;
  aplyQlfcCn: string;
  disqlfcRsn: string;
  scrnprcdrMthdExpln: string;
  prefCn: string;
  acbgCondLst: string;
  acbgCondNmLst: string;
  nonatchRsn: string;
  ongoingYn: string;
  decimalDay: number;
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobResponseDto | null>(null);
  const router = useRouter();
  const [ncsCdLst] = useState<string>("R600020");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const handleJobClick = (recrutPblntSn: string) => {
    router.push(`/news/${recrutPblntSn}`); // 클릭 시 동적 경로로 이동
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://devapi.store/api/v1/news/jobs?ncsCdLst=${ncsCdLst}&page=${currentPage}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch jobs.");
        }

        const data: JobResponseDto = await response.json();
        setJobs(data);
        setHasMore(data.result.length > 0);
      } catch (err) {
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [ncsCdLst, currentPage]);

  const loadMore = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : jobs && jobs.result.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="https://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              결과가 없습니다.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs && jobs.result ? (
                jobs.result.map((job) => (
                  <li
                    key={job.recrutPblntSn}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <div
                      className="block p-5 cursor-pointer"
                      onClick={() =>
                        handleJobClick(job.recrutPblntSn.toString())
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {job.recrutPbancTtl}
                          </h3>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {job.instNm}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {job.ncsCdNmLst}
                          </div>
                          <div className="prose prose-indigo dark:prose-invert max-w-none">
                            <p>{job.prefCondCn}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li>No jobs available</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          className={`px-5 py-2 flex items-center rounded-full border transition-colors duration-200 ${
            currentPage > 1
              ? "border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700"
              : "border-gray-300 text-gray-400 cursor-not-allowed"
          }`}
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="https://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          이전 페이지
        </button>
        <button
          className="px-5 py-2 flex items-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          onClick={loadMore}
          disabled={!hasMore || loading}
        >
          다음 페이지
          <svg
            className="w-5 h-5 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="https://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JobsPage;
