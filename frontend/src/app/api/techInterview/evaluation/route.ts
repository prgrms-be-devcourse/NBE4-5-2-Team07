import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body 내에 conversation 필드가 포함됨 (대화 기록 배열)
    const response = await fetch(
      "http://localhost:8080/api/interview/evaluation",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await response.text();
    return NextResponse.json({ response: data });
  } catch (error) {
    console.error("Evaluation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
