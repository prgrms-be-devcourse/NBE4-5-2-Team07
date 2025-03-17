export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 overflow-hidden relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl"></div>
      </div>

      {/* Code particles decoration */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content Side */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
              DevPrep
              <span className="block mt-2">개발자의 꿈을 현실로</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-xl">
              CS 기초 지식부터 실전 기술 면접까지, 당신의 개발자 커리어를 위한
              모든 준비를 도와드립니다. 체계적인 학습과 실전형 면접
              시뮬레이션으로 자신감을 키우세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                href="/studyContent"
              >
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                학습 자료 보기
              </a>
              <a
                className="rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-3 px-8 font-medium text-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                href="/interview/all"
              >
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                면접 준비 시작하기
              </a>
            </div>

            <div className="flex items-center gap-4 mt-4 text-gray-600 dark:text-gray-400">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-xs">
                  JH
                </div>
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  MS
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white text-xs">
                  KJ
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs">
                  JY
                </div>
              </div>
              <p className="text-sm">1,000+ 개발자가 이용 중</p>
            </div>
          </div>

          {/* Right Image Side */}
          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center">
            {/* Floating elements */}
            <div className="absolute top-1/4 -left-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl rotate-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center">
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-1/4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl -rotate-6 animate-pulse delay-700">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <svg
                  xmlns="https://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg mb-4 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg
                xmlns="https://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              CS 기초 강화
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              알고리즘, 자료구조, 네트워크 등 필수 CS 지식을 체계적으로
              학습하세요.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <svg
                xmlns="https://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              실전형 면접 대비
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              실제 기업 면접과 유사한 환경에서 모의 면접을 통해 자신감을
              키우세요.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg
                xmlns="https://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
              맞춤형 학습 경로
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              개인의 수준과 목표에 맞는 커스텀 학습 경로로 효율적인 공부가
              가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
