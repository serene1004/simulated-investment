<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  score: number
  totalAssets: number
  returnRate: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  register: []
  restart: []
}>()

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const canRegister = computed(() => props.modelValue.trim().length > 0)

const submitRegister = () => {
  if (!canRegister.value) {
    return
  }

  emit('register')
}

const resultTone = computed(() => {
  if (props.returnRate >= 35) {
    return {
      emoji: '🚀',
      title: '이번 판, 제대로 터졌어요',
      line: '판단이랑 타이밍이 딱 맞아떨어진 플레이였어요.',
    }
  }

  if (props.returnRate >= 15) {
    return {
      emoji: '📈',
      title: '상승 흐름을 잘 탔어요',
      line: '중간에 흔들려도 끝까지 잘 끌고 갔어요.',
    }
  }

  if (props.returnRate >= 0) {
    return {
      emoji: '😌',
      title: '수익은 잘 지켜냈어요',
      line: '크게 무너지지 않고 안정적으로 마무리했어요.',
    }
  }

  if (props.returnRate >= -10) {
    return {
      emoji: '🛠️',
      title: '다음 판에서 충분히 뒤집을 수 있어요',
      line: '이번엔 조금 아쉬웠지만 흐름만 다시 읽으면 금방 반등할 수 있어요.',
    }
  }

  return {
    emoji: '🌧️',
    title: '다음 판은 더 좋아질 거예요',
    line: '이번 결과는 아쉽지만, 복기만 잘하면 더 좋은 선택이 나올 거예요.',
  }
})
</script>

<template>
  <div class="screen-result">
    <section class="panel screen-panel result-screen-panel scene-panel">
      <div class="screen-stack result-panel-stack">
        <p class="eyebrow">FINAL RESULT</p>
        <h2>최종 기록</h2>

        <div class="result-highlight">
          <div class="result-highlight-emoji">{{ resultTone.emoji }}</div>
          <div class="result-highlight-score">
            <strong>{{ totalAssets.toLocaleString() }}원</strong>
            <span>{{ resultTone.title }}</span>
          </div>
        </div>

        <p class="result-description">{{ resultTone.line }}</p>

        <div class="result-badges">
          <span>{{ score.toLocaleString() }} pt</span>
          <span>{{ returnRate > 0 ? '+' : '' }}{{ returnRate.toFixed(1) }}%</span>
        </div>

        <div class="screen-divider" aria-hidden="true"></div>

        <div class="form-field-stack result-name-panel">
          <label for="result-nickname" class="form-label">랭킹에 남길 닉네임</label>
          <input
            id="result-nickname"
            :value="props.modelValue"
            type="text"
            maxlength="12"
            placeholder="닉네임 입력"
            @input="onInput"
            @keydown.enter.prevent="submitRegister"
          />
          <p class="result-field-hint">랭킹에 남길 때만 잠깐 써요.</p>
        </div>

        <div class="screen-actions screen-actions-center">
          <button class="primary-button" :disabled="!canRegister" @click="submitRegister">랭킹에 남기기</button>
          <button class="secondary-button" @click="$emit('restart')">한 판 더 하기</button>
        </div>
      </div>
    </section>
  </div>
</template>
