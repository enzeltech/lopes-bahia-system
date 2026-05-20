const STORAGE_KEY = 'sidebar-collapsed'

export function useSidebarCollapsed() {
  const collapsed = useState<boolean>('ui-sidebar-collapsed', () => false)

  function setCollapsed(value: boolean) {
    collapsed.value = value
    if (import.meta.client)
      window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  }

  function toggle() {
    setCollapsed(!collapsed.value)
  }

  function hydrate() {
    if (!import.meta.client)
      return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null)
      collapsed.value = stored === '1'
  }

  return {
    collapsed,
    setCollapsed,
    toggle,
    hydrate,
  }
}
