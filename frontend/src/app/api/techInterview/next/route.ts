import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie");
    const body = await req.json();
    const { answer, interviewType } = body;
    const response = await fetch("http://localhost:8080/api/interview/next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}), // 쿠키 헤더 추가
      },
      credentials: "include",
      body: JSON.stringify({ answer, interviewType }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.redirect("http://localhost:3000/login");
      }
      if (response.status === 403) {
        // 403 응답일 경우, 에러 메시지를 그대로 클라이언트에 전달
        const errorText = await response.text();
        return NextResponse.json({ error: errorText }, { status: 403 });
      }
      throw new Error("후속 질문을 가져오는데 실패했습니다.");
    }
    const contentType = response.headers.get("content-type") || "";
    let data: string;
    if (contentType.includes("application/json")) {
      data = JSON.stringify(await response.json());
    } else {
      data = await response.text();
    }
    return NextResponse.json({ response: data });
  } catch (error: any) {
    console.error("Error in next route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
