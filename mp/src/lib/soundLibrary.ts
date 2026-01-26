// 声音定义接口
export interface SoundDefinition {
  id: string;
  name: string;
  name_zh: string;
  url: string; // 后端音频文件 URL
  translations: {
    en: string;
    zh: string;
  };
  context: {
    en: string;
    zh: string;
  };
}

// 猫咪声音库
export const CAT_SOUNDS: SoundDefinition[] = [
  {
    id: 'meow-1',
    name: 'Meow',
    name_zh: '喵喵叫',
    url: '/sounds/cat/meow-1.mp3',
    translations: {
      en: 'Hey! / Pay attention to me!',
      zh: '嘿！/ 注意我！'
    },
    context: {
      en: 'General communication, often directed at humans.',
      zh: '一般交流，通常是对人发出的。'
    }
  },
  {
    id: 'meow-2',
    name: 'Meow',
    name_zh: '喵喵叫',
    url: '/sounds/cat/meow-2.mp3',
    translations: {
      en: 'Hey! / Pay attention to me!',
      zh: '嘿！/ 注意我！'
    },
    context: {
      en: 'General communication, often directed at humans.',
      zh: '一般交流，通常是对人发出的。'
    }
  },
  {
    id: 'purr-1',
    name: 'Purr',
    name_zh: '呼噜声',
    url: '/sounds/cat/purr-1.mp3',
    translations: {
      en: 'I am content and relaxed.',
      zh: '我很满足，很放松。'
    },
    context: {
      en: 'Contentment, affection, or healing.',
      zh: '满足、喜爱或自我治疗。'
    }
  },
  {
    id: 'purr-2',
    name: 'Purr',
    name_zh: '呼噜声',
    url: '/sounds/cat/purr-2.mp3',
    translations: {
      en: 'I am content and relaxed.',
      zh: '我很满足，很放松。'
    },
    context: {
      en: 'Contentment, affection, or healing.',
      zh: '满足、喜爱或自我治疗。'
    }
  }
];

// 狗狗声音库
export const DOG_SOUNDS: SoundDefinition[] = [
  {
    id: 'bark-1',
    name: 'Bark',
    name_zh: '汪汪叫',
    url: '/sounds/dog/bark-1.mp3',
    translations: {
      en: 'Alert! / Attention!',
      zh: '警告！/ 注意！'
    },
    context: {
      en: 'Warning, excitement, or attention-seeking.',
      zh: '警告、兴奋或寻求关注。'
    }
  },
  {
    id: 'bark-2',
    name: 'Bark',
    name_zh: '汪汪叫',
    url: '/sounds/dog/bark-2.mp3',
    translations: {
      en: 'Alert! / Attention!',
      zh: '警告！/ 注意！'
    },
    context: {
      en: 'Warning, excitement, or attention-seeking.',
      zh: '警告、兴奋或寻求关注。'
    }
  },
  {
    id: 'whine-1',
    name: 'Whine',
    name_zh: '呜呜叫',
    url: '/sounds/dog/whine-1.mp3',
    translations: {
      en: 'I need something.',
      zh: '我需要什么。'
    },
    context: {
      en: 'Anxiety, need, or mild distress.',
      zh: '焦虑、需求或轻微的痛苦。'
    }
  },
  {
    id: 'whine-2',
    name: 'Whine',
    name_zh: '呜呜叫',
    url: '/sounds/dog/whine-2.mp3',
    translations: {
      en: 'I need something.',
      zh: '我需要什么。'
    },
    context: {
      en: 'Anxiety, need, or mild distress.',
      zh: '焦虑、需求或轻微的痛苦。'
    }
  },
  {
    id: 'howl-1',
    name: 'Howl',
    name_zh: '嚎叫',
    url: '/sounds/dog/howl-1.mp3',
    translations: {
      en: 'I am here! / Long-distance communication.',
      zh: '我在这里！/ 远距离交流。'
    },
    context: {
      en: 'Long-distance communication or excitement.',
      zh: '远距离交流或兴奋。'
    }
  },
  {
    id: 'howl-2',
    name: 'Howl',
    name_zh: '嚎叫',
    url: '/sounds/dog/howl-2.mp3',
    translations: {
      en: 'I am here! / Long-distance communication.',
      zh: '我在这里！/ 远距离交流。'
    },
    context: {
      en: 'Long-distance communication or excitement.',
      zh: '远距离交流或兴奋。'
    }
  },
  {
    id: 'pant-1',
    name: 'Pant',
    name_zh: '喘气声',
    url: '/sounds/dog/pant-1.mp3',
    translations: {
      en: 'I am warm or excited.',
      zh: '我很热或很兴奋。'
    },
    context: {
      en: 'Temperature regulation or excitement.',
      zh: '温度调节或兴奋。'
    }
  },
  {
    id: 'pant-2',
    name: 'Pant',
    name_zh: '喘气声',
    url: '/sounds/dog/pant-2.mp3',
    translations: {
      en: 'I am warm or excited.',
      zh: '我很热或很兴奋。'
    },
    context: {
      en: 'Temperature regulation or excitement.',
      zh: '温度调节或兴奋。'
    }
  }
];

// 豚鼠声音库
export const GUINEA_PIG_SOUNDS: SoundDefinition[] = [
  {
    id: 'wheek',
    name: 'Wheek',
    name_zh: '嘎吱声',
    url: '/sounds/guinea-pig/wheek.mp3',
    translations: {
      en: 'I am excited! / Where is my food?',
      zh: '我很兴奋！/ 我的食物在哪里？'
    },
    context: {
      en: 'Excitement or calling for food, often loud and high-pitched.',
      zh: '兴奋或呼唤食物，通常声音响亮且音调高。'
    }
  },
  {
    id: 'purr',
    name: 'Purr',
    name_zh: '咕噜声',
    url: '/sounds/guinea-pig/purr.mp3',
    translations: {
      en: 'I am relaxed and happy.',
      zh: '我很放松和快乐。'
    },
    context: {
      en: 'Contentment, gentle/relaxed vocalization.',
      zh: '满足感，温和/放松的发声。'
    }
  }
];

// 根据动物类型获取声音库
export const getSoundLibrary = (animal: 'cat' | 'dog' | 'guinea_pig'): SoundDefinition[] => {
  switch (animal) {
    case 'cat':
      return CAT_SOUNDS;
    case 'dog':
      return DOG_SOUNDS;
    case 'guinea_pig':
      return GUINEA_PIG_SOUNDS;
    default:
      return [];
  }
};
