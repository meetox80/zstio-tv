const _InMemoryLimits = new Map<string, number>()

export async function RateLimit(
  Key: string,
  LimitWindowMs: number,
  MaxRequests: number = 1
): Promise<{ Success: boolean; RemainingTime: number }> {
  const CurrentTime = Date.now()
  const LastRequestTime = _InMemoryLimits.get(Key)
  
  if (LastRequestTime && (CurrentTime - LastRequestTime) < LimitWindowMs) {
    const RemainingTime = Math.ceil((LimitWindowMs - (CurrentTime - LastRequestTime)) / 1000)
    return { Success: false, RemainingTime }
  }
  
  _InMemoryLimits.set(Key, CurrentTime)
  
  if (_InMemoryLimits.size > 1000) {
    const OldEntries: string[] = []
    _InMemoryLimits.forEach((Time, EntryKey) => {
      if (CurrentTime - Time > LimitWindowMs) {
        OldEntries.push(EntryKey)
      }
    })
    OldEntries.forEach(EntryKey => _InMemoryLimits.delete(EntryKey))
  }
  
  return { Success: true, RemainingTime: 0 }
} 