"use client";

export default function AdminDashboard() {

  return (
    <div className="min-h-screen p-4 w-[65%]">
      <div>
        <h1>대시보드</h1>
        <p>구현 중.. </p>
      </div>
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
    </div>
  );
}
