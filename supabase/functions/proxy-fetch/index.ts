import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    console.log(`Proxying request to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    const contentType = response.headers.get("content-type") || "";
    const finalUrl = response.url;

    // For HTML content, rewrite relative URLs to absolute
    if (contentType.includes("text/html")) {
      let html = await response.text();

      // Inject a <base> tag so relative URLs resolve correctly
      const baseTag = `<base href="${finalUrl}">`;
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}`);
      } else if (html.includes("<HEAD>")) {
        html = html.replace("<HEAD>", `<HEAD>${baseTag}`);
      } else {
        html = baseTag + html;
      }

      return new Response(
        JSON.stringify({ html, finalUrl, contentType: "text/html" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For non-HTML, return info
    const body = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(body).slice(0, 50000)));

    return new Response(
      JSON.stringify({ finalUrl, contentType, size: body.byteLength, base64Preview: base64 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch the URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
