// composables/useSearch.ts para saber el estdo de CommandSearh

export const useSearch = () => {
  const searchOpen = useState('searchOpen', () => false)

  const openSearch = () => {
    searchOpen.value = true
  }

  const closeSearch = () => {
    searchOpen.value = false
  }

  return {
    searchOpen,
    openSearch,
    closeSearch
  }
}
