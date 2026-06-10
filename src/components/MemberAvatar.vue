<script setup lang="ts">
defineProps<{
  name: string
  avatar: string
  isHost?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div 
    class="member-avatar flex flex-col items-center gap-1"
    :class="{
      'w-12': size === 'sm',
      'w-16': size === 'md' || !size,
      'w-24': size === 'lg'
    }"
  >
    <div 
      class="avatar-circle relative rounded-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 shadow-md border-2 border-white"
      :class="{
        'w-10 h-10 text-xl': size === 'sm',
        'w-14 h-14 text-2xl': size === 'md' || !size,
        'w-20 h-20 text-4xl': size === 'lg',
        'ring-2 ring-yellow-400 ring-offset-2': isHost
      }"
    >
      <span class="transform hover:scale-110 transition-transform">{{ avatar }}</span>
      <span 
        v-if="isHost" 
        class="absolute -top-1 -right-1 text-xs bg-yellow-400 rounded-full px-1 py-0.5"
      >
        👑
      </span>
    </div>
    <span 
      class="text-center font-medium truncate w-full"
      :class="{
        'text-xs': size === 'sm',
        'text-sm': size === 'md' || !size,
        'text-base': size === 'lg'
      }"
    >
      {{ name }}
    </span>
  </div>
</template>
