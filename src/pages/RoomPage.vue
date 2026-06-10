<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useExpire } from '@/composables/useExpire'
import { allTopics, getRandomQuestion } from '@/topics'
import type { Topic, TopicType, TopicTemplate } from '@/types'
import { TOPIC_COLORS, TOPIC_EMOJIS } from '@/types'
import TopicCard from '@/components/TopicCard.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import { copyToClipboard, getDaysRemaining } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const { loadRoom, currentRoom, addTopic, removeTopic, startGame, error, loadRooms } = useRoom()
const { isRoomExpired, getExpirationWarning } = useExpire()

const topicContent = ref('')
const selectedType = ref<TopicType>('trouble')
const isAnonymous = ref(false)
const authorName = ref('')
const showAddTopic = ref(false)
const copySuccess = ref(false)
const selectedTemplate = ref<TopicTemplate | null>(null)

const roomId = computed(() => route.params.id as string)

const unflippedTopics = computed(() => 
  currentRoom.value?.topics.filter((t: Topic) => !t.isFlipped) || []
)

const flippedTopics = computed(() => 
  currentRoom.value?.topics.filter((t: Topic) => t.isFlipped) || []
)

const canStartGame = computed(() => 
  currentRoom.value?.topics.length && currentRoom.value.topics.length >= 1
)

const expirationWarning = computed(() => 
  currentRoom.value ? getExpirationWarning(currentRoom.value.expiresAt) : null
)

onMounted(() => {
  loadRooms()
  const success = loadRoom(roomId.value)
  if (!success) {
    router.push('/')
    return
  }
  
  if (currentRoom.value && isRoomExpired(currentRoom.value.expiresAt)) {
    alert('房间已过期，话题已自动消失')
    router.push('/')
    return
  }
  
  if (currentRoom.value?.status === 'playing') {
    router.push(`/room/${roomId.value}/game`)
  }
  
  if (currentRoom.value?.members.length) {
    authorName.value = currentRoom.value.members[0].name
  }
})

const selectType = (type: TopicType) => {
  selectedType.value = type
  const template = allTopics.find((t: TopicTemplate) => t.type === type)
  selectedTemplate.value = template || null
  topicContent.value = ''
}

const useTemplateQuestion = () => {
  const question = getRandomQuestion(selectedType.value)
  if (question) {
    topicContent.value = question
  }
}

const handleAddTopic = () => {
  if (!topicContent.value.trim() || !currentRoom.value) return
  
  addTopic(
    roomId.value,
    topicContent.value.trim(),
    selectedType.value,
    authorName.value || '匿名',
    isAnonymous.value
  )
  
  topicContent.value = ''
  isAnonymous.value = false
  showAddTopic.value = false
}

const handleDeleteTopic = (topicId: string) => {
  if (confirm('确定要删除这个话题吗？')) {
    removeTopic(roomId.value, topicId)
  }
}

const handleCopyCode = () => {
  if (currentRoom.value) {
    copyToClipboard(currentRoom.value.code).then(() => {
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    })
  }
}

const handleStartGame = () => {
  if (startGame(roomId.value)) {
    router.push(`/room/${roomId.value}/game`)
  }
}

const goBack = () => {
  router.push('/')
}

const goToGame = () => {
  router.push(`/room/${roomId.value}/game`)
}
</script>

<template>
  <div 
    v-if="currentRoom"
    class="room-page min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
  >
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <button 
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          @click="goBack"
        >
          <span>←</span>
          <span>返回</span>
        </button>
        
        <button 
          v-if="currentRoom.status === 'ended'"
          class="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium"
          @click="goToGame"
        >
          查看结果
        </button>
      </div>

      <div class="bg-white rounded-3xl p-6 shadow-lg mb-6">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              🎒 {{ currentRoom.name }}
            </h1>
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2">
                <span class="text-gray-500">邀请码：</span>
                <button 
                  class="font-mono bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                  @click="handleCopyCode"
                >
                  <span>{{ currentRoom.code }}</span>
                  <span class="text-xs">📋</span>
                </button>
              </div>
              
              <span 
                v-if="expirationWarning"
                class="text-xs px-2 py-1 rounded-full"
                :class="{
                  'bg-red-100 text-red-600': getDaysRemaining(currentRoom.expiresAt) <= 1,
                  'bg-orange-100 text-orange-600': getDaysRemaining(currentRoom.expiresAt) > 1 && getDaysRemaining(currentRoom.expiresAt) <= 3,
                  'bg-yellow-100 text-yellow-600': getDaysRemaining(currentRoom.expiresAt) > 3
                }"
              >
                ⏰ {{ expirationWarning }}
              </span>
            </div>
          </div>
          
          <div class="text-center md:text-right">
            <div class="text-3xl font-bold text-purple-600">
              {{ currentRoom.topics.length }}
            </div>
            <div class="text-sm text-gray-500">个话题已投放</div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
            <span>👥</span> 成员 ({{ currentRoom.members.length }})
          </h3>
          <div class="flex flex-wrap gap-4">
            <MemberAvatar 
              v-for="member in currentRoom.members" 
              :key="member.id"
              :name="member.name"
              :avatar="member.avatar"
              :is-host="member.isHost"
              size="sm"
            />
          </div>
        </div>

        <div v-if="currentRoom.status === 'preparing'" class="flex gap-3">
          <button 
            class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canStartGame"
            @click="handleStartGame"
          >
            <span class="text-xl">🎴</span>
            开始洗牌翻牌
          </button>
          <button 
            class="px-6 py-3 bg-white border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
            @click="showAddTopic = true"
          >
            + 丢话题
          </button>
        </div>
        
        <div v-else-if="currentRoom.status === 'playing'" class="flex gap-3">
          <button 
            class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            @click="goToGame"
          >
            <span class="text-xl">▶️</span>
            继续游戏
          </button>
          <button 
            class="px-6 py-3 bg-white border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors"
            @click="showAddTopic = true"
          >
            + 追加话题
          </button>
        </div>
      </div>

      <div v-if="unflippedTopics.length > 0" class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📥</span> 待聊话题 ({{ unflippedTopics.length }})
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TopicCard 
            v-for="topic in unflippedTopics" 
            :key="topic.id"
            :topic="topic"
            :can-delete="currentRoom.status === 'preparing'"
            @delete="handleDeleteTopic(topic.id)"
          />
        </div>
      </div>

      <div v-if="flippedTopics.length > 0">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>✅</span> 已聊话题 ({{ flippedTopics.length }})
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70">
          <TopicCard 
            v-for="topic in flippedTopics" 
            :key="topic.id"
            :topic="topic"
          />
        </div>
      </div>

      <div v-if="currentRoom.topics.length === 0" class="text-center py-16 bg-white rounded-3xl shadow-md">
        <div class="text-6xl mb-4">🎁</div>
        <p class="text-gray-500 text-lg mb-4">保鲜袋还是空的，快丢点话题进去吧！</p>
        <button 
          class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          @click="showAddTopic = true"
        >
          + 丢第一个话题
        </button>
      </div>
    </div>

    <div 
      v-if="showAddTopic"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddTopic = false"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-gray-800 mb-4 text-center">
          ✨ 丢个话题进去
        </h2>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            选择话题类型
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              v-for="template in allTopics" 
              :key="template.type"
              class="p-3 rounded-xl border-2 transition-all text-center"
              :class="{
                'border-purple-500 bg-purple-50': selectedType === template.type,
                'border-gray-200 hover:border-gray-300': selectedType !== template.type
              }"
              @click="selectType(template.type)"
            >
              <div class="text-2xl mb-1">{{ template.emoji }}</div>
              <div class="text-xs font-medium">{{ template.name }}</div>
            </button>
          </div>
        </div>

        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-medium text-gray-700">
              话题内容
            </label>
            <button 
              v-if="selectedTemplate"
              class="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
              @click="useTemplateQuestion"
            >
              <span>🎲</span>
              随机一个
            </button>
          </div>
          <textarea 
            v-model="topicContent"
            placeholder="输入你想聊的话题..."
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
            :style="{ borderLeftColor: TOPIC_COLORS[selectedType], borderLeftWidth: '4px' }"
          ></textarea>
          <p v-if="selectedTemplate" class="mt-2 text-xs text-gray-500">
            {{ TOPIC_EMOJIS[selectedTemplate.type] }} {{ selectedTemplate.description }}
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            你的名字
          </label>
          <input 
            v-model="authorName"
            type="text" 
            placeholder="输入你的名字"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>

        <div class="mb-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input 
              v-model="isAnonymous"
              type="checkbox" 
              class="w-4 h-4 rounded text-purple-500 focus:ring-purple-400"
            />
            <span class="text-sm text-gray-600">🎭 匿名发布</span>
          </label>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {{ error }}
        </div>

        <div class="flex gap-3">
          <button 
            class="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            @click="showAddTopic = false"
          >
            取消
          </button>
          <button 
            class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            :disabled="!topicContent.trim() || !authorName.trim()"
            @click="handleAddTopic"
          >
            丢进去！
          </button>
        </div>
      </div>
    </div>

    <div 
      v-if="copySuccess"
      class="fixed top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
    >
      <span>✓</span>
      <span>邀请码已复制</span>
    </div>
  </div>
</template>
