import { type NextRequest, NextResponse } from "next/server";

export function GET(_request: NextRequest) {
  return new NextResponse("Hello, from API!");
}
