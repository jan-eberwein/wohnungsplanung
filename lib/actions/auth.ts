"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Interne E-Mail-Domain: Login läuft über Username, Supabase Auth über E-Mail.
const EMAIL_DOMAIN = "wohnung.janeberwein.at";

export async function login(
  username: string,
  password: string
): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: `${username}@${EMAIL_DOMAIN}`,
    password,
  });
  if (error) {
    return { error: "Das Passwort stimmt nicht. Probier's nochmal!" };
  }
  redirect("/");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
