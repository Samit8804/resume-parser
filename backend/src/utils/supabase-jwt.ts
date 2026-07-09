import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { prisma } from "../index";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_JWKS_URL = process.env.SUPABASE_JWKS_URL || "";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || "";

const supabaseAdmin = SUPABASE_SECRET_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export async function verifySupabaseToken(token: string) {
  try {
    const { data: { user }, error } = await supabaseAdmin!.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function findOrCreateUser(supabaseUser: any) {
  const email = supabaseUser.email;
  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email,
        name: supabaseUser.user_metadata?.name || email.split("@")[0],
        role: "RECRUITER",
      },
    });
  }
  return dbUser;
}
