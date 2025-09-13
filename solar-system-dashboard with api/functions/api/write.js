/**
 * POST /api/write
 * body JSON:
 * {
 *   key: "sensor1",
 *   value: { temperature: 25.3, humidity: 60, timestamp: 1685600000 }
 * }
 */
export async function onRequestPost({ request, env }) {
  try {
    // 1. 解析 JSON body
    const data = await request.json();
    if (!data.key || data.value === undefined) {
      return new Response("Missing key or value", { status: 400 });
    }
    // 2. 把 JSON.value 序列化，寫入 `esp32` KV Namespace
    await env.esp32.put(data.key, JSON.stringify(data.value));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Invalid JSON body", { status: 400 });
  }
}
