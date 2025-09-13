/**
 * GET /api/read?key=sensor1
 * 讀取 esp32 KV 裡 key 為 sensor1 的值（必定是 JSON.stringify 後的字串）
 */
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) {
    return new Response("Missing key", { status: 400 });
  }
  // 從 KV 拉取字串。若沒找到，回 404
  const stored = await env.esp32.get(key);
  if (stored === null) {
    return new Response("Key not found", { status: 404 });
  }
  // 直接把字串回傳，前端拿到後用 JSON.parse()
  return new Response(stored, {
    headers: { "Content-Type": "application/json" },
  });
}
