import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body에 interviewType (예: "CS" 또는 "프로젝트")가 포함되어 있음
    const { interviewType } = body;
    // Spring 백엔드의 시작 엔드포인트 호출 (환경에 맞게 URL 수정)
    const response = await fetch("http://localhost:8080/api/interview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewType }),
    });
    const data = await response.text();
    return NextResponse.json({ response: data });
  } catch (error) {
    console.error("Error in start route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
