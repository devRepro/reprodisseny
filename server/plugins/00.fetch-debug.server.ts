import { defineNitroPlugin } from "nitropack/runtime"

export default defineNitroPlugin(() => {
  const origFetch = globalThis.fetch

  globalThis.fetch = async (input: any, init?: any) => {
    try {
      return await origFetch(input, init)
    } catch (err: any) {
      const url =
        typeof input === "string"
          ? input
          : input?.url
            ? String(input.url)
            : String(input)

      console.error("[FETCH FAIL]", url, err?.message, err?.cause)
      throw err
    }
  }

  const g: any = globalThis as any
  if (typeof g.$fetch === "function") {
    const orig$fetch = g.$fetch
    g.$fetch = async (req: any, opts?: any) => {
      try {
        return await orig$fetch(req, opts)
      } catch (err: any) {
        console.error("[$fetch FAIL]", req, err?.message, err?.cause)
        throw err
      }
    }
  }
})
