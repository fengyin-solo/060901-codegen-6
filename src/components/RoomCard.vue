<script setup lang="ts">
import type { Room } from '@/types'
import { useExpire } from '@/composables/useExpire'
import { getDaysRemaining, formatDate } from '@/utils/helpers'

defineProps<{
  room: Room
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { getExpirationWarning } = useExpire()

const statusText = (status: Room['status']) => {
  switch (status) {
    case 'preparing': return '准备中'
    case 'playing': return '进行中'
    case 'ended': return '已结束'
  }
}

const statusColor = (status: Room['status']) => {
  switch (status) {
    case 'preparing': return 'bg-blue-500'
    case 'playing': return 'bg-green-500'
    case 'ended': return 'bg-gray-500'
  }
}
</script>

<template>
  <div 
    class="room-card bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 border border-gray-100"
    @click="emit('click')"
  >
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-lg font-bold text-gray-800 truncate flex-1 mr-2">
        {{ room.name }}
      </h3>
      <span 
        class="px-2 py-1 rounded-full text-xs text-white font-medium"
        :class="statusColor(room.status)"
      >
        {{ statusText(room.status) }}
      </span>
    </div>
    
    <div class="space-y-2 text-sm text-gray-600">
      <div class="flex items-center gap-2">
        <span class="text-gray-400">🎫</span>
        <span class="font-mono bg-gray-100 px-2 py-0.5 rounded">
          {{ room.code }}
        </span>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-gray-400">👥</span>
        <span>{{ room.members.length }} 位成员</span>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-gray-400">📝</span>
        <span>{{ room.topics.length }} 个话题</span>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-gray-400">⏰</span>
        <span>{{ formatDate(room.createdAt) }}</span>
      </div>
    </div>
    
    <div 
      v-if="getExpirationWarning(room.expiresAt)"
      class="mt-3 pt-3 border-t border-gray-100"
    >
      <span 
        class="text-xs px-2 py-1 rounded-full"
        :class="{
          'bg-red-100 text-red-600': getDaysRemaining(room.expiresAt) <= 1,
          'bg-orange-100 text-orange-600': getDaysRemaining(room.expiresAt) > 1 && getDaysRemaining(room.expiresAt) <= 3,
          'bg-yellow-100 text-yellow-600': getDaysRemaining(room.expiresAt) > 3
        }"
      >
        {{ getExpirationWarning(room.expiresAt) }}
      </span>
    </div>
    
    <div class="mt-4 -space-x-2 flex">
      <div 
        v-for="member in room.members.slice(0, 5)" 
        :key="member.id"
        class="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center text-sm border-2 border-white"
        :title="member.name"
      >
        {{ member.avatar }}
      </div>
      <div 
        v-if="room.members.length > 5"
        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white text-gray-600"
      >
        +{{ room.members.length - 5 }}
      </div>
    </div>
  </div>
</template>
