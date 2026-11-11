<script setup lang="ts">
import { computed } from 'vue';
import type { StockState } from '../../types/game';

type TradeAction = 'buy' | 'sell';

const props = defineProps<{
  open: boolean;
  action: TradeAction | null;
  stock: StockState;
  quantity: number;
}>();

const emit = defineEmits<{ cancel: []; confirm: [] }>();
const formatWon = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;
const trade = computed(() => {
  if (!props.action) return null;
  const buying = props.action === 'buy';
  return {
    eyebrow: buying ? 'BUY ORDER' : 'SELL ORDER',
    title: buying ? '매수할까요?' : '매도할까요?',
    copy: `${props.stock.name} ${props.quantity}주를${buying ? ` ${formatWon(props.quantity * props.stock.price)}에` : ''} ${buying ? '매수해요.' : '매도해요.'}`,
    label: buying ? '매수하기' : '매도하기',
    buttonClass: buying ? 'confirm-buy-button' : 'confirm-sell-button',
  };
});
</script>

<template>
  <Transition name="confirm-pop">
    <div v-if="open && trade" class="confirm-overlay" @click.self="emit('cancel')">
      <section class="panel confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="trade-confirm-title">
        <p class="eyebrow">{{ trade.eyebrow }}</p>
        <h2 id="trade-confirm-title">{{ trade.title }}</h2>
        <p class="confirm-copy">{{ trade.copy }}</p>
        <div class="confirm-actions">
          <button class="secondary-button" @click="emit('cancel')">다시 보기</button>
          <button class="primary-button" :class="trade.buttonClass" @click="emit('confirm')">{{ trade.label }}</button>
        </div>
      </section>
    </div>
  </Transition>
</template>
