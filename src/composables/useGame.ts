import { ref, computed } from 'vue'
import type { Room, Topic } from '@/types'
import { getRoomById, saveRoom } from '@/utils/storage'
import { getRandomBackupQuestion } from '@/topics'
import { getRandomItem } from '@/utils/helpers'

export function useGame() {
  const currentTopic = ref<Topic | null>(null)
  const isFlipping = ref(false)
  const isShuffling = ref(false)
  const showTruthOrDare = ref(false)
  const currentPlayer = ref<string>('')

  const getCurrentTopic = (room: Room): Topic | undefined => {
    if (room.shuffledTopics.length === 0) return undefined
    const topicId = room.shuffledTopics[room.currentTurn % room.shuffledTopics.length]
    return room.topics.find(t => t.id === topicId)
  }

  const getCurrentPlayer = (room: Room): string => {
    if (room.members.length === 0) return ''
    const memberIndex = room.currentTurn % room.members.length
    return room.members[memberIndex].name
  }

  const flipNextCard = (roomId: string): Topic | null => {
    const room = getRoomById(roomId)
    if (!room || room.status !== 'playing') return null

    const unflippedTopics = room.topics.filter(t => !t.isFlipped)
    if (unflippedTopics.length === 0) {
      return null
    }

    isFlipping.value = true
    
    const topic = getCurrentTopic(room)
    if (topic) {
      topic.isFlipped = true
      currentTopic.value = topic
    }

    room.currentTurn++
    saveRoom(room)
    
    currentPlayer.value = getCurrentPlayer(room)
    showTruthOrDare.value = true

    setTimeout(() => {
      isFlipping.value = false
    }, 600)

    return topic || null
  }

  const emergencyPick = (roomId: string): Topic | null => {
    const room = getRoomById(roomId)
    if (!room) return null

    const unflippedTopics = room.topics.filter(t => !t.isFlipped)
    
    if (unflippedTopics.length > 0) {
      const randomTopic = getRandomItem(unflippedTopics)
      randomTopic.isFlipped = true
      currentTopic.value = randomTopic
      saveRoom(room)
      return randomTopic
    } else {
      const backupQuestion = getRandomBackupQuestion()
      const emergencyTopic: Topic = {
        id: 'emergency-' + Date.now(),
        roomId,
        content: backupQuestion,
        type: 'silly',
        author: '急救箱',
        isAnonymous: true,
        isFlipped: true,
        createdAt: new Date().toISOString(),
        color: '#FFD93D'
      }
      currentTopic.value = emergencyTopic
      return emergencyTopic
    }
  }

  const shuffleCards = (roomId: string): boolean => {
    const room = getRoomById(roomId)
    if (!room || room.status !== 'playing') return false

    isShuffling.value = true
    
    room.topics.forEach(t => t.isFlipped = false)
    const shuffledIds = [...room.topics].sort(() => Math.random() - 0.5).map(t => t.id)
    room.shuffledTopics = shuffledIds
    room.currentTurn = 0
    
    saveRoom(room)

    setTimeout(() => {
      isShuffling.value = false
    }, 1000)

    return true
  }

  const progress = computed(() => {
    if (!currentTopic.value) return { flipped: 0, total: 0, percentage: 0 }
    const room = getRoomById(currentTopic.value.roomId)
    if (!room) return { flipped: 0, total: 0, percentage: 0 }
    const flipped = room.topics.filter(t => t.isFlipped).length
    const total = room.topics.length
    return {
      flipped,
      total,
      percentage: total > 0 ? Math.round((flipped / total) * 100) : 0
    }
  })

  const closeTruthOrDare = () => {
    showTruthOrDare.value = false
  }

  return {
    currentTopic,
    isFlipping,
    isShuffling,
    showTruthOrDare,
    currentPlayer,
    progress,
    flipNextCard,
    emergencyPick,
    shuffleCards,
    getCurrentTopic,
    getCurrentPlayer,
    closeTruthOrDare
  }
}
