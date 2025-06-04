import { NextRequest, NextResponse } from "next/server";

const _TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const _TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function POST(Request: NextRequest) {
  try {
    const Body = await Request.json();
    const { Token } = Body;

    if (!Token) {
      return NextResponse.json(
        {
          Success: false,
          Error: "Missing token",
        },
        { status: 400 },
      );
    }

    if (!_TURNSTILE_SECRET_KEY) {
      console.error(
        "TURNSTILE_SECRET_KEY is not defined in environment variables",
      );
      return NextResponse.json(
        {
          Success: false,
          Error: "Server configuration error",
        },
        { status: 500 },
      );
    }

    const ForwardedFor = Request.headers.get("x-forwarded-for") || "unknown";
    const IpAddress = ForwardedFor.split(",")[0].trim();

    const FormData = new URLSearchParams();
    FormData.append("secret", _TURNSTILE_SECRET_KEY);
    FormData.append("response", Token);
    FormData.append("remoteip", IpAddress);

    const Response = await fetch(_TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: FormData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const Result = await Response.json();

    if (!Result.success) {
      return NextResponse.json(
        {
          Success: false,
          Error: "Captcha verification failed",
          Details: Result["error-codes"],
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ Success: true });
  } catch (Error) {
    console.error("Error verifying Turnstile token:", Error);
    return NextResponse.json(
      {
        Success: false,
        Error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
