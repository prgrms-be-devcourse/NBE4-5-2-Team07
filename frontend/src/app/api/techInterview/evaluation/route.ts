import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await fetch(
      "http://localhost:8080/api/interview/evaluation",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.redirect("http://localhost:3000/login");
      }
      throw new Error("대화 평가를 가져오는데 실패했습니다.");
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
    console.error("Evaluation API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
