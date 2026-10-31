const DATA_KEY = 'brightloop_app_data_v1'

export const readData = <T>(fallback: T): T => {
  try {
    const value = localStorage.getItem(DATA_KEY)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    // A damaged local cache should never block the customer portal.
    return fallback
  }
}

export const writeData = <T>(data: T): void => {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}