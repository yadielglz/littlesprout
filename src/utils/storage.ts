export const loadData = async () => {
  try {
    const data = localStorage.getItem('littlesprout-storage')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export const saveData = (data: any) => {
  try {
    localStorage.setItem('littlesprout-storage', JSON.stringify(data))
  } catch {}
} 