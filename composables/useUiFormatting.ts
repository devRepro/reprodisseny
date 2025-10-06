// composables/useUiFormatting.ts
export function useUiFormatting() {
    function safeUpper(input: unknown, fallback = ''): string {
      const s = typeof input === 'string' ? input : (input ?? '') + ''
      return s ? s.toUpperCase() : fallback
    }
  
    function titleFromRouteName(name: unknown): string {
      const s = (typeof name === 'string' ? name : '').trim()
      return s ? s.split('-').map(p => p.toUpperCase()).join(' / ') : ''
    }
  
    return { safeUpper, titleFromRouteName }
  }
  