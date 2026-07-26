import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { statusUpdateSchema } from "@/lib/validations/lead";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = statusUpdateSchema.safeParse({ id: params.id, ...(body as object) });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json(
      { error: "Could not update this lead's status." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
