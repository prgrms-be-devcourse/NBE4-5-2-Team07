import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie");
    const body = await req.json();
    const { interviewType } = body;
    const response = await fetch("http://localhost:8080/api/interview/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}), // 쿠키 헤더 추가
      },
      credentials: "include",
      body: JSON.stringify({ interviewType }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.redirect("http://localhost:3000/login");
      }
      if (response.status === 403) {
        return NextResponse.redirect("http://localhost:3000/payment");
      }
      throw new Error("전체 질문 ID 리스트를 가져오는데 실패했습니다.");
    }
    // 응답의 content-type에 따라 파싱
    const contentType = response.headers.get("content-type") || "";
    let data: string;
    if (contentType.includes("application/json")) {
      data = JSON.stringify(await response.json());
    } else {
      data = await response.text();
    }
    return NextResponse.json({ response: data });
  } catch (error: any) {
    console.error("Error in start route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
