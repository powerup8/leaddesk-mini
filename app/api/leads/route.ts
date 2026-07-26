import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validations/lead";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const supabase = createClient();
  const id = randomUUID();

  const { error } = await supabase.from("leads").insert({
    id,
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    company: parsed.data.company || null,
    message: parsed.data.message,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Could not save this lead. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id }, { status: 201 });
}