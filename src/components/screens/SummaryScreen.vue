<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { Holding, PhaseSummary, StockState } from '../../types/game';
import MiniChart from '../shared/MiniChart.vue';
import StockIcon from '../shared/StockIcon.vue';
import { maxGameDays } from '../../data/gameData';

const props = defineProps({
  summary: { type: Object as PropType<PhaseSummary>, required: true },
  stocks: { type: Array as PropType<StockState[]>, required: true },
  holdings: { type: Array as PropType<Holding[]>, required: true },
  cash: { type: Number, required: true },
  strongestStock: { type: Object as PropType<StockState | null>, default: null },
  weakestStock: { type: Object as PropType<StockState | null>, default: null },
  marketMinute: { type: Number, required: true },
});

defineEmits<{ next: [] }>();

const dailyChange = computed(() => props.summary.totalAssets - (props.summary.openingAssets ?? props.summary.totalAssets));
const marketCloseBackground = `url('${import.meta.env.BASE_URL}assets/market-close-pixel.png')`;
const positions = computed(() => props.holdings.flatMap((holding) => {
  const stock = props.stocks.find((item) => item.code === holding.code);
  return stock ? [{ ...holding, stock, value: stock.price * holding.quantity }] : [];
}));
const formatTime = (minute?: number) => minute === undefined ? '—' : `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
</script>

<template>
  <main class="market-close-shell" :style="{ '--market-close-background': marketCloseBackground }">
    <header class="market-close-header"><strong>LEXIP 증권</strong><span>DAY {{ String(summary.phaseNumber).padStart(2, '0') }} · 애프터마켓 마감 20:00</span></header>
    <section class="market-close-body">
      <div class="market-close-title"><div><h1>오늘의 장 마감</h1><p>{{ summary.eventTitle }} · {{ summary.eventDescription }}</p></div><span class="market-closed-tag">거래 종료</span></div>

      <section class="close-metrics" aria-label="오늘의 자산 결과">
        <article><span>개장 시 총자산</span><strong>{{ (summary.openingAssets ?? summary.totalAssets).toLocaleString() }}원</strong></article>
        <article><span>마감 시 총자산</span><strong>{{ summary.totalAssets.toLocaleString() }}원</strong></article>
        <article :class="dailyChange >= 0 ? 'gain' : 'loss'"><span>일일 손익</span><strong>{{ dailyChange > 0 ? '+' : '' }}{{ dailyChange.toLocaleString() }}원</strong></article>
        <article :class="summary.phaseProfitRate >= 0 ? 'gain' : 'loss'"><span>일 수익률</span><strong>{{ summary.phaseProfitRate > 0 ? '+' : '' }}{{ summary.phaseProfitRate.toFixed(2) }}%</strong></article>
      </section>

      <section class="close-chart-panel"><header><h2>장중 자산 변화</h2><span>09:00 — 20:00</span></header><MiniChart :values="summary.assetHistory?.length ? summary.assetHistory : [summary.totalAssets]" :baseline="summary.openingAssets ?? summary.totalAssets" :session-start-index="0" :market-minute="marketMinute" show-axes /></section>

      <div class="close-details">
        <section class="close-panel"><header><h2>오늘 체결 내역</h2><span>{{ summary.trades?.length ?? 0 }}건</span></header>
          <div v-if="summary.trades?.length" class="close-trades"><div v-for="(trade, index) in summary.trades" :key="`${trade.code}-${trade.marketMinute}-${index}`"><time>{{ formatTime(trade.marketMinute) }}</time><strong>{{ stocks.find((stock) => stock.code === trade.code)?.name ?? trade.code }}</strong><b :class="trade.side">{{ trade.side === 'buy' ? '매수' : '매도' }}</b><span>{{ trade.quantity }}주</span><span>{{ (trade.price ?? 0).toLocaleString() }}원</span></div></div>
          <p v-else class="close-empty">오늘은 거래하지 않았습니다.</p>
        </section>
        <section class="close-panel"><header><h2>보유 종목 평가</h2><span>현금 {{ cash.toLocaleString() }}원</span></header>
          <div v-if="positions.length" class="close-positions"><div v-for="position in positions" :key="position.code"><StockIcon :code="position.code" size="sm"/><strong>{{ position.stock.name }}</strong><span>{{ position.quantity }}주</span><b>{{ position.value.toLocaleString() }}원</b></div></div>
          <p v-else class="close-empty">보유 중인 종목이 없습니다.</p>
          <footer><span>최대 상승 {{ strongestStock?.name ?? '—' }}</span><span>최대 하락 {{ weakestStock?.name ?? '—' }}</span></footer>
        </section>
      </div>
      <button class="next-session-button" @click="$emit('next')">{{ summary.phaseNumber >= maxGameDays ? '30일 투자 결과 보기' : '다음 거래일 시작' }}</button>
    </section>
  </main>
</template>

<style scoped>
.market-close-shell{width:min(100%,1120px);margin:0 auto;border:3px solid #26394b;background:linear-gradient(rgba(255,254,247,.91),rgba(255,254,247,.96)),var(--market-close-background) center/cover;box-shadow:6px 6px 0 #26394b;color:#17283b}.market-close-header{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.8rem 1.1rem;background:#17283b;color:#fff9e9;font:700 .8rem ui-monospace,monospace}.market-close-header strong{font-size:1rem}.market-close-body{padding:clamp(1rem,3vw,2rem)}.market-close-title{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem}.market-close-title h1{margin:0;font-size:clamp(1.8rem,4vw,3rem)}.market-close-title p{margin:.35rem 0;color:#586979}.market-closed-tag{padding:.5rem .7rem;border:2px solid #26394b;background:#e8f0e8;font:700 .75rem ui-monospace,monospace;white-space:nowrap}.close-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:2px solid #26394b}.close-metrics article{display:grid;gap:.4rem;padding:.8rem;border-right:1px solid #82968c}.close-metrics article:last-child{border:0}.close-metrics span,.close-chart-panel header span,.close-panel header span{color:#586979;font-size:.75rem}.close-metrics strong{font-size:clamp(.9rem,1.8vw,1.35rem);font-variant-numeric:tabular-nums}.gain strong{color:#138064}.loss strong{color:#c74636}.close-chart-panel,.close-panel{margin-top:.9rem;border:2px solid #26394b;background:#fffef7}.close-chart-panel header,.close-panel header{display:flex;justify-content:space-between;align-items:center;gap:.75rem;padding:.6rem .8rem;border-bottom:1px solid #82968c;background:#e8f0e8}.close-chart-panel h2,.close-panel h2{margin:0;font-size:.95rem}.close-chart-panel :deep(.sparkline-chart){display:block;width:100%;height:160px;padding:.8rem}.close-details{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}.close-trades>div,.close-positions>div{display:grid;grid-template-columns:3.2rem minmax(0,1fr) auto auto;align-items:center;gap:.5rem;padding:.55rem .7rem;border-bottom:1px solid #d6dccc;font-size:.78rem}.close-trades time,.close-trades span,.close-positions span{color:#586979;font-variant-numeric:tabular-nums}.close-trades b{padding:.15rem .3rem;border:1px solid currentColor}.close-trades b.buy{color:#c74636}.close-trades b.sell{color:#245bb5}.close-positions>div{grid-template-columns:auto minmax(0,1fr) auto auto}.close-positions strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.close-positions b{font-variant-numeric:tabular-nums}.close-empty{padding:1.2rem;color:#586979;text-align:center}.close-panel footer{display:flex;justify-content:space-between;gap:.5rem;padding:.6rem .7rem;background:#f2f4ed;color:#586979;font-size:.72rem}.next-session-button{display:block;margin:1rem 0 0 auto;padding:.8rem 1.1rem;border:2px solid #26394b;background:#f0c34d;color:#17283b;box-shadow:3px 3px 0 #26394b;font-weight:800}.next-session-button span{margin-left:.5rem}@media(max-width:700px){.market-close-title{align-items:flex-start}.close-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.close-metrics article:nth-child(2){border-right:0}.close-metrics article:nth-child(-n+2){border-bottom:1px solid #82968c}.close-details{grid-template-columns:1fr}.market-close-header{font-size:.68rem}.close-trades>div{grid-template-columns:2.8rem minmax(0,1fr) auto auto;gap:.3rem;font-size:.7rem}}
@media(max-width:480px){.market-close-shell{width:100%;margin:0;border-width:2px;box-shadow:3px 3px 0 #26394b}.market-close-header{flex-wrap:wrap;gap:.3rem .6rem;padding:.65rem .7rem;font-size:.64rem}.market-close-header span{max-width:100%;white-space:normal;text-align:start}.market-close-body{padding:.75rem}.market-close-title{flex-direction:column;align-items:flex-start;gap:.55rem}.market-close-title h1{font-size:1.6rem;word-break:keep-all}.market-close-title p{font-size:.78rem;line-height:1.45}.market-closed-tag{align-self:flex-start}.close-metrics article{gap:.3rem;padding:.55rem}.close-metrics span{font-size:.66rem}.close-metrics strong{font-size:.88rem;overflow-wrap:anywhere}.close-trades>div{grid-template-columns:2.5rem minmax(0,1fr) auto;gap:.35rem;padding:.55rem}.close-trades>div>time{grid-column:1;grid-row:1/span 2}.close-trades>div>strong{grid-column:2;grid-row:1;min-width:0;overflow-wrap:anywhere}.close-trades>div>b{grid-column:3;grid-row:1}.close-trades>div>span:first-of-type{grid-column:2;grid-row:2}.close-trades>div>span:last-of-type{grid-column:3;grid-row:2;text-align:end}.close-positions>div{grid-template-columns:auto minmax(0,1fr) auto;gap:.35rem}.close-positions>div>svg{grid-column:1;grid-row:1/span 2}.close-positions>div>strong{grid-column:2;grid-row:1;min-width:0}.close-positions>div>span{grid-column:3;grid-row:1}.close-positions>div>b{grid-column:2/4;grid-row:2;text-align:end}.close-panel footer{flex-wrap:wrap}.next-session-button{width:100%}}
</style>
