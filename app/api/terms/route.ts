import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * 이용약관(TERMS_OF_SERVICE.md) 파일 내용을 반환하는 API
 */
export async function GET() {
  try {
    // docs/TERMS_OF_SERVICE.md 파일 경로
    const filePath = path.join(process.cwd(), "docs", "TERMS_OF_SERVICE.md");
    
    // 파일 읽기
    const content = await fs.readFile(filePath, "utf-8");
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error("이용약관 읽기 실패:", error);
    return NextResponse.json(
      { error: "이용약관을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
