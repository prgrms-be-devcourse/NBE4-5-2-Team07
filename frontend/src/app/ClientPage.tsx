import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold">
          개발자 꿈나무를 위한 CS & 면접 준비 플랫폼
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl">
          우리 서비스는 취업 준비생과 학생들에게 컴퓨터 과학 지식 학습과 실제
          기술 면접 준비에 필요한 자료와 인터랙티브한 학습 경험을 제공합니다.
          여러분의 커리어 성장을 응원합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/learn"
          >
            학습 자료 보기
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="/interview/all"
          >
            면접 준비 시작하기
          </a>
        </div>
      </main>
    </div>
  );
}
