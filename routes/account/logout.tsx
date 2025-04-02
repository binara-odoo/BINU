import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    
    const headers = new Headers();
    // Clear the session cookie
    headers.set(
      "Set-Cookie",
      "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
    
    return new Response("", {
      status: 303,
      headers: {
        Location: `/?lang=${lang}`,
        ...Object.fromEntries(headers.entries()),
      },
    });
  },
}; 