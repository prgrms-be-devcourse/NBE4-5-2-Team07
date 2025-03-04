import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body에 answer와 interviewType (후속 질문 시에도 주제 정보 전달)
    const { answer, interviewType } = body;
    const response = await fetch("http://localhost:8080/api/interview/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, interviewType }),
    });
    const data = await response.text();
    return NextResponse.json({ response: data });
  } catch (error) {
    console.error("Error in next route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
