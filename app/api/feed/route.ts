import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";


export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/posts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store", 
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errData.message || "Failed to fetch feeds from backend" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      data: result.data || result,
      source: "backend-api"
    });

  } catch (error) {
    console.error("GET /api/feed proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server proxy connection failure" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || "Validation or creation failed at backend server",
          details: result.details || null 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Feed created successfully via backend",
        data: result.data || result
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/feed proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server proxy connection failure" },
      { status: 500 }
    );
  }
}