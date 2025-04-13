// composables/useSearch.ts
export const useSearch = () => {
    const searchOpen = useState('searchOpen', () => false)
    const openSearch = () => (searchOpen.value = true)
    const closeSearch = () => (searchOpen.value = false)
  
    return { searchOpen, openSearch, closeSearch }
  }
  