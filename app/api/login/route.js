import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists in Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !user) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    return Response.json({ message: "Login successful", user });
  } catch (err) {
    console.error("Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
