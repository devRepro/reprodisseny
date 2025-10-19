// composables/useNotify.ts
import { toast } from 'vue-sonner'

type Opts = {
  description?: string
  duration?: number
  action?: { label: string; onClick: () => void }
  id?: string | number
}

export function useNotify() {
  // helpers básicos
  const show    = (title: string, opts: Opts = {}) => toast(title, opts)
  const success = (title: string, description?: string, opts: Omit<Opts, 'description'> = {}) =>
    toast.success(title, { description, ...opts })
  const error   = (title: string, description?: string, opts: Omit<Opts, 'description'> = {}) =>
    toast.error(title, { description, ...opts })
  const info    = (title: string, description?: string, opts: Omit<Opts, 'description'> = {}) =>
    toast.message(title, { description, ...opts })

  // envolver promesas (carga/ok/error)
  const promise = <T>(
    p: Promise<T>,
    msgs: { loading: string; success: string | ((v: T) => string); error: string | ((e: any) => string) }
  ) => toast.promise(p, msgs)

  // pequeño anti-ruido: evita duplicados very-fast
  let lastKey = ''; let lastAt = 0
  const safe = {
    success(title: string, description?: string, dedupeKey?: string) {
      const key = dedupeKey ?? `${title}|${description ?? ''}`
      const now = Date.now()
      if (key === lastKey && now - lastAt < 1200) return
      lastKey = key; lastAt = now
      success(title, description)
    },
    error(title: string, description?: string) { error(title, description) }
  }

  return { show, success, error, info, promise, safe }
}
