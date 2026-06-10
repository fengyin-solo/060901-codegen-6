export interface Room {
  id: string
  name: string
  code: string
  createdAt: string
  expiresAt: string
  status: 'preparing' | 'playing' | 'ended'
  currentTurn: number
  members: Member[]
  topics: Topic[]
  shuffledTopics: string[]
}

export interface Topic {
  id: string
  roomId: string
  content: string
  type: TopicType
  author: string
  isAnonymous: boolean
  isFlipped: boolean
  createdAt: string
  color: string
}

export interface Member {
  id: string
  roomId: string
  name: string
  avatar: string
  isHost: boolean
}

export type TopicType = 'trouble' | 'music' | 'gossip' | 'recommend' | 'deep' | 'silly'

export interface TopicTemplate {
  type: TopicType
  name: string
  emoji: string
  description: string
  questions: string[]
}

export const TOPIC_COLORS: Record<TopicType, string> = {
  trouble: '#FF6B6B',
  music: '#FFD93D',
  gossip: '#FF85A2',
  recommend: '#6BCB77',
  deep: '#9D4EDD',
  silly: '#4ECDC4'
}

export const TOPIC_EMOJIS: Record<TopicType, string> = {
  trouble: '😤',
  music: '🎵',
  gossip: '☕',
  recommend: '💡',
  deep: '🤔',
  silly: '🤪'
}

export const AVATAR_EMOJIS = [
  '😀', '😎', '🥳', '🤗', '😇', '🤩', '😜', '🤭',
  '🐱', '🐶', '🐼', '🦊', '🐨', '🐯', '🦁', '🐸'
]
