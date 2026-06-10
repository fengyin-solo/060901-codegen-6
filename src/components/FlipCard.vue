<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Topic } from '@/types'
import { TOPIC_EMOJIS } from '@/types'

const props = defineProps<{
  topic: Topic | null
  isFlipping: boolean
  playerName?: string
}>()

const isFlipped = ref(false)

watch(() => props.isFlipping, (flipping) => {
  if (flipping) {
    isFlipped.value = false
    setTimeout(() => {
      isFlipped.value = true
    }, 300)
  }
})

watch(() => props.topic, () => {
  isFlipped.value = false
})
</script>

<template>
  <div class="flip-card-container perspective-1000 w-full max-w-md mx-auto">
    <div 
      class="flip-card relative w-full h-80 transition-transform duration-600 transform-style-preserve-3d"
      :class="{ 'rotate-y-180': isFlipped }"
    >
      <div class="flip-card-front absolute inset-0 backface-hidden rounded-3xl shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8">
        <div class="text-7xl mb-4 animate-bounce">🎁</div>
        <h3 class="text-white text-2xl font-bold mb-2">下一个话题</h3>
        <p class="text-white/80 text-center">
          {{ playerName ? `轮到 ${playerName} 啦！` : '点击翻牌' }}
        </p>
        <div class="mt-6 flex gap-2">
          <span 
            v-for="(emoji, type) in TOPIC_EMOJIS" 
            :key="type"
            class="text-2xl opacity-60 hover:opacity-100 transition-opacity"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
      
      <div 
        class="flip-card-back absolute inset-0 backface-hidden rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 rotate-y-180"
        :style="{ backgroundColor: topic?.color || '#666' }"
      >
        <div v-if="topic" class="text-center">
          <div class="text-6xl mb-4">{{ TOPIC_EMOJIS[topic.type] }}</div>
          <span class="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
            {{ topic.type }}
          </span>
          <p class="text-white text-xl font-bold leading-relaxed mb-4">
            {{ topic.content }}
          </p>
          <p class="text-white/80 text-sm">
            —— {{ topic.isAnonymous ? '🎭 匿名朋友' : topic.author }}
          </p>
        </div>
        <div v-else class="text-center text-white">
          <div class="text-6xl mb-4">😅</div>
          <p class="text-xl">没有话题了</p>
          <p class="text-white/80 text-sm mt-2">点击"急救"试试！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.duration-600 {
  transition-duration: 600ms;
}
</style>
