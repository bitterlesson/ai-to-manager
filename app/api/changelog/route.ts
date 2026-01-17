import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * CHANGELOG.md 파일 내용을 반환하는 API
 */
export async function GET() {
  try {
    // 프로젝트 루트의 CHANGELOG.md 파일 경로
    const filePath = path.join(process.cwd(), "CHANGELOG.md");
    
    // 파일 읽기
    const content = await fs.readFile(filePath, "utf-8");
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error("CHANGELOG 읽기 실패:", error);
    return NextResponse.json(
      { error: "변경 이력을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
