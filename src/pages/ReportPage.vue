<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useExpire } from '@/composables/useExpire'
import type { GameReport } from '@/types'

const route = useRoute()
const router = useRouter()
const { loadRoom, currentRoom, getGameReport, loadRooms } = useRoom()
const { isRoomExpired } = useExpire()

const report = ref<GameReport | null>(null)

const roomId = computed(() => route.params.id as string)

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
  
  report.value = getGameReport(roomId.value)
})

const goBack = () => {
  router.push(`/room/${roomId.value}`)
}

const goHome = () => {
  router.push('/')
}

const maxFlipCount = computed(() => {
  if (!report.value) return 0
  return Math.max(...report.value.flipStats.map(s => s.flipCount), 1)
})

const maxContribution = computed(() => {
  if (!report.value) return 0
  return Math.max(...report.value.contributionStats.map(s => s.totalTopics), 1)
})
</script>

<template>
  <div 
    v-if="currentRoom && report"
    class="report-page min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
  >
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 left-10 text-6xl opacity-10">🎉</div>
      <div class="absolute top-20 right-20 text-5xl opacity-10">🏆</div>
      <div class="absolute bottom-20 left-20 text-5xl opacity-10">✨</div>
      <div class="absolute bottom-10 right-10 text-6xl opacity-10">🎊</div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <button 
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          @click="goBack"
        >
          <span>←</span>
          <span>返回房间</span>
        </button>
        
        <div class="text-center">
          <h1 class="text-xl font-bold text-gray-800">{{ currentRoom.name }}</h1>
          <div class="text-sm text-gray-500">📋 聚会战报</div>
        </div>
        
        <button 
          class="text-gray-600 hover:text-gray-800 transition-colors"
          @click="goHome"
        >
          🏠
        </button>
      </div>

      <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-6 mb-6 text-white text-center shadow-lg">
        <div class="text-5xl mb-3">🎮</div>
        <h2 class="text-2xl font-bold mb-2">游戏结束！</h2>
        <p class="text-white/80 mb-4">来看看今晚的战绩吧～</p>
        <div class="flex justify-center gap-8">
          <div>
            <div class="text-3xl font-bold">{{ report.flippedTopics }}</div>
            <div class="text-sm text-white/70">已聊话题</div>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ report.totalTopics }}</div>
            <div class="text-sm text-white/70">总话题数</div>
          </div>
          <div>
            <div class="text-3xl font-bold">{{ currentRoom.members.length }}</div>
            <div class="text-sm text-white/70">参与人数</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 mb-6 shadow-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏆</span> 最活跃成员
        </h3>
        <div v-if="report.mostActiveMember" class="flex flex-col items-center py-4">
          <div class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl mb-3 shadow-lg">
            {{ report.mostActiveAvatar }}
          </div>
          <div class="text-xl font-bold text-gray-800">{{ report.mostActiveMember }}</div>
          <div class="text-sm text-gray-500 mt-1">话题贡献王 👑</div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          暂无数据
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 mb-6 shadow-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🎴</span> 翻牌统计
        </h3>
        <div class="space-y-3">
          <div 
            v-for="stat in report.flipStats" 
            :key="stat.memberId"
            class="flex items-center gap-3"
          >
            <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              {{ stat.memberAvatar }}
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-medium text-gray-700">{{ stat.memberName }}</span>
                <span class="text-sm text-gray-500">{{ stat.flipCount }} 张</span>
              </div>
              <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
                  :style="{ width: `${(stat.flipCount / maxFlipCount) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 mb-6 shadow-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📊</span> 话题类型分布
        </h3>
        <div v-if="report.typeStats.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div 
            v-for="stat in report.typeStats" 
            :key="stat.type"
            class="p-4 rounded-2xl text-center transition-transform hover:scale-105"
            :style="{ backgroundColor: stat.color + '20' }"
          >
            <div class="text-3xl mb-1">{{ stat.emoji }}</div>
            <div class="font-bold text-gray-800">{{ stat.count }}</div>
            <div class="text-xs text-gray-500">{{ stat.name }}</div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          暂无数据
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 mb-6 shadow-md">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>💪</span> 话题贡献榜
        </h3>
        <div class="space-y-3">
          <div 
            v-for="(stat, index) in report.contributionStats" 
            :key="stat.memberName"
            class="flex items-center gap-3"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              :class="{
                'bg-yellow-400 text-white': index === 0,
                'bg-gray-300 text-gray-600': index === 1,
                'bg-orange-300 text-white': index === 2,
                'bg-gray-100 text-gray-500': index > 2
              }"
            >
              {{ index + 1 }}
            </div>
            <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              {{ stat.memberAvatar }}
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-medium text-gray-700">{{ stat.memberName }}</span>
                <span class="text-sm text-gray-500">
                  {{ stat.flippedTopics }}/{{ stat.totalTopics }} 被聊
                </span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-green-400 to-teal-400 rounded-full transition-all duration-500"
                  :style="{ width: `${(stat.totalTopics / maxContribution) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center pb-8">
        <p class="text-gray-400 text-sm">感谢参与，下次再聚！ 🎉</p>
      </div>
    </div>
  </div>
</template>
