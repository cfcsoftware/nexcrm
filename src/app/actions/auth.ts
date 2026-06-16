"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { encrypt } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function loginAction(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Please enter email and password." };
    }

    // 1. Fetch user from Supabase using Admin client (bypassing RLS on users table)
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST205") {
        return {
          success: false,
          error: "Database tables are not set up. Please copy the contents of 'schema.sql' in the project root and run it in your Supabase SQL Editor.",
        };
      }
      return { success: false, error: "Invalid email or password." };
    }

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // 2. Compare password hash
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return { success: false, error: "Invalid email or password." };
    }

    // 3. Create session token
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    const token = await encrypt({
      userId: user.id,
      email: user.email,
      name: user.name,
      expiresAt,
    });

    // 4. Set session cookie (cookies() is async in Next.js 15+)
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return { success: true };
  } catch (err: any) {
    console.error("Login action error:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const { decrypt } = await import("@/lib/auth");
    const payload = await decrypt(token);
    if (!payload) return null;

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    return null;
  }
}
