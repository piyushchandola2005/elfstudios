import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function requireApiUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

export function isAdminEmail(email: string | null | undefined) {
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export async function requireApiAdmin() {
  const result = await requireApiUser();
  if (!result.user || !isAdminEmail(result.user.email)) {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}
