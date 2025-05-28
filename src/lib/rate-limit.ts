import { Redis } from '@upstash/redis'

let _Redis: Redis | null = null

try {
  if (process.env.REDIS_URL) {
    _Redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN || ''
    })
  }
} catch (Error) {
  console.error('Failed to initialize Redis client:', Error)
}

const _InMemoryLimits = new Map<string, number>()

export async function RateLimit(
  Key: string,
  LimitWindowMs: number,
  MaxRequests: number = 1
): Promise<{ Success: boolean; RemainingTime: number }> {
  const CurrentTime = Date.now()
  
  if (_Redis) {
    try {
      const Result = await _Redis.get<string>(`ratelimit:${Key}`)
      const LastRequestTime = Result ? parseInt(Result, 10) : 0
      
      if (LastRequestTime && (CurrentTime - LastRequestTime) < LimitWindowMs) {
        const RemainingTime = Math.ceil((LimitWindowMs - (CurrentTime - LastRequestTime)) / 1000)
        return { Success: false, RemainingTime }
      }
      
      await _Redis.set(`ratelimit:${Key}`, CurrentTime.toString(), {
        ex: Math.ceil(LimitWindowMs / 1000)
      })
      
      return { Success: true, RemainingTime: 0 }
    } catch (Error) {
      console.error('Redis rate limiting error:', Error)

    }
  }
  
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