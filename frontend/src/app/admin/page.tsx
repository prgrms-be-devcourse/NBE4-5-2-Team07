"use client";

export default function AdminDashboard() {
  const logs = [
    "📌 사용자 A가 로그인했습니다.",
    "🛠️ 관리자가 학습 콘텐츠(id:00번)를 수정했습니다.",
    "🎉 사용자 B가 회원가입했습니다.",
  ];

  return (
    <div className="min-h-screen p-4 w-[65%]">
      
      {/* 대시보드 */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">총 사용자 수</h3>
          <p className="text-2xl font-bold text-blue-600">00명</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">신규 가입자</h3>
          <p className="text-2xl font-bold text-green-600">00명</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">등록된 콘텐츠</h3>
          <p className="text-2xl font-bold text-purple-600">000개</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">대기 중인 질문</h3>
          <p className="text-2xl font-bold text-red-600">00개</p>
        </div>
      </section>

      {/* 최근 활동 로그 */}
      <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">📝 최근 활동 로그</h3>
        <ul className="mt-3 space-y-2">
          {logs.map((log, index) => (
            <li key={index} className="border-b py-2">{log}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
