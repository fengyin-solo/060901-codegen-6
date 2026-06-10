<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useExpire } from './composables/useExpire'

const { checkAndCleanExpiredRooms } = useExpire()

onMounted(() => {
  checkAndCleanExpiredRooms()
  
  const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🍻', '🥳', '🎒']
  const container = document.getElementById('emojiRain')
  if (!container) return

  for (let i = 0; i < 15; i++) {
    const emoji = document.createElement('div')
    emoji.className = 'emoji-drop'
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)]
    emoji.style.left = Math.random() * 100 + '%'
    emoji.style.animationDelay = Math.random() * 3 + 's'
    emoji.style.animationDuration = (3 + Math.random() * 2) + 's'
    container.appendChild(emoji)
  }
})
</script>

<template>
  <div class="min-h-screen relative">
    <div class="emoji-rain" id="emojiRain"></div>
    <div class="relative z-10">
      <RouterView />
    </div>
  </div>
</template>
