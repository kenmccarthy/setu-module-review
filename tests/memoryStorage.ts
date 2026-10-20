/** Minimal in-memory Storage for tests; `failAfter` makes setItem throw after n writes. */
export class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  writes = 0
  failAfter: number
  constructor(failAfter = Infinity) {
    this.failAfter = failAfter
  }
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    if (this.writes >= this.failAfter) throw new Error('QuotaExceededError')
    this.writes++
    this.data.set(key, value)
  }
  keys() {
    return [...this.data.keys()]
  }
}
