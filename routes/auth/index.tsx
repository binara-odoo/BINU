import { Handlers } from "$fresh/server.ts";

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const REDIRECT_URI = Deno.env.get("REDIRECT_URI")!;

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile https://www.googleapis.com/auth/userinfo.profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    googleAuthUrl.searchParams.set("state", lang);

    return Response.redirect(googleAuthUrl.toString());
  },
};
