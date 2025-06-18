export const initializeApp = async () => {
  // Placeholder for any async initialization logic
  return Promise.resolve()
}

export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

export const calculateAge = (dob: string) => {
  const birth = new Date(dob)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  if (days < 0) {
    months--
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  return `${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'm ' : ''}${days}d`
} 