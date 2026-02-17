export default defineEventHandler((event) => {
  const url = event.node.req.url || ""
  if (!url.startsWith("/api/")) return

  const start = Date.now()
  const method = event.node.req.method || "GET"

  console.log("[API IN ]", method, url)

  event.node.res.on("finish", () => {
    console.log("[API OUT]", event.node.res.statusCode, method, url, `${Date.now() - start}ms`)
  })

  event.node.res.on("close", () => {
    console.log("[API CLS]", event.node.res.statusCode, method, url, `${Date.now() - start}ms`)
  })
})
