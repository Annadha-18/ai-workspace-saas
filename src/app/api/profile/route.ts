import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/api";

export async function GET() {
  const auth = await requireUser();

  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const auth = await requireUser();

  if (auth.error) return auth.error;

  const body = await req.json();

  const payload = {
    id: auth.user.id,
    full_name: body.full_name || "",
    bio: body.bio || "",
    avatar_url: body.avatar_url || "",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("profiles")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}