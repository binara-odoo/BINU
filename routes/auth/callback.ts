import { Handlers } from "$fresh/server.ts";
import { setCookie } from "https://deno.land/std@0.224.0/http/cookie.ts";
import { encodeBase64 as encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const REDIRECT_URI = Deno.env.get("REDIRECT_URI")!;

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "es";
    const lang = state;

    if (!code) {
      return new Response("No code provided", { status: 400 });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Error getting token:", tokenData.error);
      return new Response(`Error fetching token: ${tokenData.error}`, {
        status: 500,
      });
    }

    // Get user info with picture
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    const userData = await userResponse.json();
    console.log("User data from Google:", userData); // Debug log

    const { email, name, picture } = userData;

    // Create session data with loggedIn flag
    const sessionData = JSON.stringify({ 
      email, 
      name, 
      picture, 
      loggedIn: true 
    });
    const encodedSession = encode(sessionData);

    const headers = new Headers();
    setCookie(headers, {
      name: "session",
      value: encodedSession,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
    });

    // Redirect to dashboard with language parameter
    headers.set("Location", `/dashboard/dashboard?lang=${lang}`);
    return new Response(null, { status: 302, headers });
  },
};
