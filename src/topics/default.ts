import type { TopicTemplate } from '@/types'

export const defaultTopics: TopicTemplate[] = [
  {
    type: 'trouble',
    name: '最近烦心事',
    emoji: '😤',
    description: '分享最近让你困扰的事情，大家一起出主意',
    questions: [
      '最近工作/学习上遇到了什么瓶颈？',
      '有没有什么人际关系的烦恼？',
      '最近让你失眠的事情是什么？',
      '你最近在焦虑什么？',
      '有没有什么决定让你纠结很久？'
    ]
  },
  {
    type: 'music',
    name: '想安利的歌',
    emoji: '🎵',
    description: '分享最近单曲循环的歌曲，说说背后的故事',
    questions: [
      '最近单曲循环的一首歌是什么？',
      '有没有一首歌对你有特殊意义？',
      '你想给大家推荐什么风格的音乐？',
      '有没有哪首歌让你想起某个人/某段时光？',
      '你最近发现了什么宝藏歌手？'
    ]
  },
  {
    type: 'gossip',
    name: '八卦时间',
    emoji: '☕',
    description: '聊聊最近的趣事、瓜或者吐槽',
    questions: [
      '最近吃到了什么有意思的瓜？',
      '有没有什么让你大跌眼镜的事情？',
      '最近看到最搞笑的新闻是什么？',
      '你最近发现了什么颠覆认知的事情？',
      '有没有什么圈内八卦想分享？'
    ]
  },
  {
    type: 'recommend',
    name: '求推荐',
    emoji: '💡',
    description: '互相推荐好东西，种草分享',
    questions: [
      '最近看过最好看的电影/剧是什么？',
      '有没有什么宝藏APP想推荐？',
      '你最近买到最满意的东西是什么？',
      '有什么好吃的餐厅/零食推荐？',
      '最近读了什么好书？'
    ]
  }
]
