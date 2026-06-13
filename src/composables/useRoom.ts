import { ref, computed, onMounted } from 'vue'
import type { Room, Topic, Member, TopicType, GameReport, MemberFlipStat, TypeStat, MemberContributionStat } from '@/types'
import { TOPIC_COLORS, TOPIC_EMOJIS } from '@/types'
import { allTopics } from '@/topics'
import { 
  getRooms, getRoomById, getRoomByCode, saveRoom, deleteRoom 
} from '@/utils/storage'
import { 
  generateId, generateRoomCode, addDays, getRandomItem, shuffleArray 
} from '@/utils/helpers'
import { AVATAR_EMOJIS } from '@/types'

export function useRoom() {
  const rooms = ref<Room[]>([])
  const currentRoom = ref<Room | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadRooms = () => {
    rooms.value = getRooms()
  }

  const createRoom = (name: string, hostName: string): Room => {
    const now = new Date()
    const expiresAt = addDays(now, 7)
    
    const room: Room = {
      id: generateId(),
      name,
      code: generateRoomCode(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'preparing',
      currentTurn: 0,
      members: [
        {
          id: generateId(),
          roomId: '',
          name: hostName,
          avatar: getRandomItem(AVATAR_EMOJIS),
          isHost: true
        }
      ],
      topics: [],
      shuffledTopics: []
    }
    
    room.members.forEach(m => m.roomId = room.id)
    saveRoom(room)
    loadRooms()
    return room
  }

  const joinRoomByCode = (code: string, memberName: string): Room | null => {
    const room = getRoomByCode(code.toUpperCase())
    if (!room) {
      error.value = '房间不存在'
      return null
    }
    
    const existingMember = room.members.find(m => m.name === memberName)
    if (existingMember) {
      currentRoom.value = room
      return room
    }
    
    const newMember: Member = {
      id: generateId(),
      roomId: room.id,
      name: memberName,
      avatar: getRandomItem(AVATAR_EMOJIS),
      isHost: false
    }
    
    room.members.push(newMember)
    saveRoom(room)
    loadRooms()
    currentRoom.value = room
    return room
  }

  const loadRoom = (id: string): boolean => {
    const room = getRoomById(id)
    if (room) {
      currentRoom.value = room
      return true
    }
    error.value = '房间不存在'
    return false
  }

  const addTopic = (
    roomId: string, 
    content: string, 
    type: TopicType, 
    author: string,
    isAnonymous: boolean = false
  ): Topic | null => {
    const room = getRoomById(roomId)
    if (!room) return null

    const topic: Topic = {
      id: generateId(),
      roomId,
      content,
      type,
      author,
      isAnonymous,
      isFlipped: false,
      createdAt: new Date().toISOString(),
      color: TOPIC_COLORS[type]
    }

    room.topics.push(topic)
    saveRoom(room)
    
    if (currentRoom.value?.id === roomId) {
      currentRoom.value = room
    }
    loadRooms()
    
    return topic
  }

  const removeTopic = (roomId: string, topicId: string): boolean => {
    const room = getRoomById(roomId)
    if (!room) return false

    room.topics = room.topics.filter(t => t.id !== topicId)
    saveRoom(room)
    
    if (currentRoom.value?.id === roomId) {
      currentRoom.value = room
    }
    loadRooms()
    
    return true
  }

  const startGame = (roomId: string): boolean => {
    const room = getRoomById(roomId)
    if (!room || room.topics.length < 1) {
      error.value = '至少需要1个话题才能开始'
      return false
    }

    room.status = 'playing'
    room.currentTurn = 0
    room.shuffledTopics = shuffleArray(room.topics.map(t => t.id))
    saveRoom(room)
    
    if (currentRoom.value?.id === roomId) {
      currentRoom.value = room
    }
    loadRooms()
    
    return true
  }

  const endGame = (roomId: string): boolean => {
    const room = getRoomById(roomId)
    if (!room) return false

    room.status = 'ended'
    saveRoom(room)
    
    if (currentRoom.value?.id === roomId) {
      currentRoom.value = room
    }
    loadRooms()
    
    return true
  }

  const resetGame = (roomId: string): boolean => {
    const room = getRoomById(roomId)
    if (!room) return false

    room.status = 'preparing'
    room.currentTurn = 0
    room.shuffledTopics = []
    room.topics.forEach(t => t.isFlipped = false)
    saveRoom(room)
    
    if (currentRoom.value?.id === roomId) {
      currentRoom.value = room
    }
    loadRooms()
    
    return true
  }

  const removeRoom = (id: string): boolean => {
    deleteRoom(id)
    loadRooms()
    if (currentRoom.value?.id === id) {
      currentRoom.value = null
    }
    return true
  }

  const activeRooms = computed(() => 
    rooms.value.filter(r => r.status !== 'ended')
  )

  const getGameReport = (roomId: string): GameReport | null => {
    const room = getRoomById(roomId)
    if (!room) return null

    const flippedTopics = room.topics.filter(t => t.isFlipped)
    const totalTopics = room.topics.length

    const flipCountMap: Record<string, number> = {}
    flippedTopics.forEach(topic => {
      if (topic.flippedBy) {
        flipCountMap[topic.flippedBy] = (flipCountMap[topic.flippedBy] || 0) + 1
      }
    })

    const flipStats: MemberFlipStat[] = room.members.map(member => ({
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      flipCount: flipCountMap[member.name] || 0
    }))
    flipStats.sort((a, b) => b.flipCount - a.flipCount)

    const typeCountMap: Record<TopicType, number> = {
      trouble: 0,
      music: 0,
      gossip: 0,
      recommend: 0,
      deep: 0,
      silly: 0
    }

    flippedTopics.forEach(topic => {
      typeCountMap[topic.type] = (typeCountMap[topic.type] || 0) + 1
    })

    const typeStats: TypeStat[] = []
    Object.entries(typeCountMap).forEach(([type, count]) => {
      if (count > 0) {
        const template = allTopics.find(t => t.type === type as TopicType)
        typeStats.push({
          type: type as TopicType,
          count,
          name: template?.name || type,
          emoji: TOPIC_EMOJIS[type as TopicType],
          color: TOPIC_COLORS[type as TopicType]
        })
      }
    })
    typeStats.sort((a, b) => b.count - a.count)

    const contributionMap: Record<string, { total: number; flipped: number }> = {}
    room.topics.forEach(topic => {
      const author = topic.isAnonymous ? '匿名用户' : topic.author
      if (!contributionMap[author]) {
        contributionMap[author] = { total: 0, flipped: 0 }
      }
      contributionMap[author].total++
      if (topic.isFlipped) {
        contributionMap[author].flipped++
      }
    })

    const contributionStats: MemberContributionStat[] = Object.entries(contributionMap).map(([name, stats]) => {
      const member = room.members.find(m => m.name === name)
      return {
        memberName: name,
        memberAvatar: member?.avatar || '🎭',
        totalTopics: stats.total,
        flippedTopics: stats.flipped
      }
    })
    contributionStats.sort((a, b) => b.totalTopics - a.totalTopics)

    let mostActiveMember: string | null = null
    let mostActiveAvatar: string | null = null
    if (contributionStats.length > 0) {
      mostActiveMember = contributionStats[0].memberName
      mostActiveAvatar = contributionStats[0].memberAvatar
    }

    return {
      totalTopics,
      flippedTopics: flippedTopics.length,
      flipStats,
      typeStats,
      contributionStats,
      mostActiveMember,
      mostActiveAvatar
    }
  }

  onMounted(() => {
    loadRooms()
  })

  return {
    rooms,
    currentRoom,
    loading,
    error,
    activeRooms,
    loadRooms,
    createRoom,
    joinRoomByCode,
    loadRoom,
    addTopic,
    removeTopic,
    startGame,
    endGame,
    resetGame,
    removeRoom,
    getGameReport,
  }
}
