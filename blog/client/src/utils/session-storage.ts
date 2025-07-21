export const SessionStorage = {
  set: (key: string, value: unknown) => {
    const valueToStore = typeof value === "string" ? value : JSON.stringify(value);
    sessionStorage.setItem(key, valueToStore);
  },
  get: (key: string) => {
    const value = sessionStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },
  remove: (key: string) => sessionStorage.removeItem(key),
  clear: () => sessionStorage.clear(),
};