import { getRooms, saveRooms } from '@/utils/storage'
import { getDaysRemaining } from '@/utils/helpers'

export function useExpire() {
  function checkAndCleanExpiredRooms(): number {
    const rooms = getRooms()
    const validRooms = rooms.filter(room => {
      const daysRemaining = getDaysRemaining(room.expiresAt)
      return daysRemaining > 0
    })
    
    const expiredCount = rooms.length - validRooms.length
    if (expiredCount > 0) {
      saveRooms(validRooms)
      console.log(`已清理 ${expiredCount} 个过期房间`)
    }
    
    return expiredCount
  }

  function isRoomExpired(expiresAt: string): boolean {
    return getDaysRemaining(expiresAt) <= 0
  }

  function getExpirationWarning(expiresAt: string): string | null {
    const days = getDaysRemaining(expiresAt)
    if (days <= 0) return '已过期'
    if (days === 1) return '今天过期'
    if (days <= 3) return `还有 ${days} 天过期`
    return null
  }

  return {
    checkAndCleanExpiredRooms,
    isRoomExpired,
    getExpirationWarning
  }
}
