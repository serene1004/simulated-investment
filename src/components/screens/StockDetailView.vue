<script setup lang="ts">
import { computed, ref } from 'vue';
import MiniChart from '../shared/MiniChart.vue';
import StockIcon from '../shared/StockIcon.vue';
import { maxGameDays } from '../../data/gameData';
import type { StockState } from '../../types/game';

const props = defineProps<{ currentPhase: number; marketMinute: number; selectedCode: string; selectedStock: StockState }>();
const emit = defineEmits<{ back: []; order: [code: string] }>();
const chartPeriod = ref<'intraday' | 'daily' | 'weekly'>('intraday');
const dailyChartPoints = computed(() => {
  const points = props.selectedStock.dailyHistory.filter((close) => close.day < props.currentPhase).slice(-maxGameDays);
  const todayClose = props.selectedStock.dailyHistory.find((close) => close.day === props.currentPhase);
  const current = { day: props.currentPhase, price: todayClose?.price ?? props.selectedStock.price };
  return (points.length ? [...points, current] : [{ day: Math.max(0, props.currentPhase - 1), price: props.selectedStock.previousClose }, current]).slice(-maxGameDays);
});
const chartPoints = computed(() => {
  const weeks = new Map<number, (typeof dailyChartPoints.value)[number]>();
  dailyChartPoints.value.forEach((point) => weeks.set(Math.ceil(point.day / 5), point));
  return [...weeks.values()];
});
const chartValues = computed(() => chartPeriod.value === 'intraday' ? props.selectedStock.history : (chartPeriod.value === 'daily' ? dailyChartPoints.value : chartPoints.value).map((point) => point.price));
const chartLabels = computed(() => chartPeriod.value === 'daily'
  ? dailyChartPoints.value.map((point) => point.day === 0 ? '개장' : `${point.day}일`)
  : chartPeriod.value === 'weekly' ? chartPoints.value.map((point) => point.day === 0 ? '개장' : `${Math.ceil(point.day / 5)}주`) : []);
const chartBaseline = computed(() => chartPeriod.value === 'intraday' ? props.selectedStock.previousClose : chartValues.value[0] ?? props.selectedStock.previousClose);
const selectedChangeAmount = computed(() => props.selectedStock.price - props.selectedStock.previousClose);
const selectedCompanyNote = computed(() => ({
  BLUE: '저전력 칩 공정의 수율이 개선돼 다음 분기 공급 확대를 검토하고 있다.', GREEN: '지역 태양광 설비 장기 공급 계약을 체결했다.', NEO: '희귀 질환 치료제의 임상 2상 참가자 모집을 시작했다.', AUR: '신작 출시를 앞두고 사전 예약 이용자가 늘고 있다.', SKY: '화물 노선 조정으로 상반기 운영 비용을 낮출 계획이다.', WAVE: '중소 상점을 위한 새 정기 구독 요금제를 공개했다.', NOVA: '전기 모터 부품의 국내 생산 라인을 추가한다.', CORE: '서버용 반도체 수요에 맞춰 생산 설비를 증설한다.', AEG: '무인 감시 장비의 수출 협상을 진행 중이다.', VXR: '차세대 AI 가속기 시제품을 파트너사에 전달했다.', MINT: '간편식 신제품이 편의점 체인에 입점한다.', LUM: '지역 의원용 원격 진료 장비 공급을 늘리고 있다.', POL: '겨울 공연 일정과 티켓 예매 계획을 발표했다.', ORB: '물류 창고 자동화 로봇의 현장 시험을 시작했다.', FIN: '간편 결제 수수료 개편안을 가맹점에 안내했다.', JET: '연료 절감형 항공기 도입 일정을 공개했다.', HYP: '당일 배송 가능 지역을 지방 거점까지 확대했다.', MEC: '완성차 업체와 차세대 구동 부품을 공동 개발한다.',
}[props.selectedCode] ?? `${props.selectedStock.theme} 관련 사업과 신제품 개발을 이어가고 있다.`));
</script>

<template>
  <main class="market-chart-view">
    <header class="market-chart-heading"><div><span>종목 상세 · {{ selectedStock.code }}</span><h2>{{ selectedStock.name }}</h2></div><button type="button" class="return-market-link" @click="emit('back')">종목 시세로 돌아가기</button></header>
    <section class="market-focus-quote" aria-label="선택 종목 시세 및 차트">
      <div class="focus-quote-identity">
        <div class="focus-quote-name"><StockIcon :code="selectedStock.code" size="md"/><div><span>{{ selectedStock.code }} · {{ selectedStock.theme }}</span><h2>{{ selectedStock.name }}</h2></div></div>
        <div class="focus-quote-price"><strong>{{ selectedStock.price.toLocaleString() }}<small>원</small></strong><b :class="selectedStock.changeRate > 0 ? 'up' : selectedStock.changeRate < 0 ? 'down' : ''">{{ selectedChangeAmount > 0 ? '▲ +' : selectedChangeAmount < 0 ? '▼ ' : '' }}{{ selectedChangeAmount.toLocaleString() }}원 ({{ selectedStock.changeRate > 0 ? '+' : '' }}{{ selectedStock.changeRate.toFixed(2) }}%)</b><span v-if="selectedStock.halted" class="stock-limit-tag">{{ selectedStock.price > selectedStock.previousClose ? '상한가 · 거래 정지' : '하한가 · 거래 정지' }}</span></div>
        <dl class="focus-quote-baseline"><dt>전일 종가</dt><dd>{{ selectedStock.previousClose.toLocaleString() }}원</dd><dt>시가총액</dt><dd>{{ (selectedStock.price * selectedStock.sharesOutstanding / 1e12).toFixed(1) }}조원</dd><dt>평균 거래량</dt><dd>{{ selectedStock.averageVolume.toLocaleString() }}주</dd></dl>
        <button class="quote-order-link" type="button" :disabled="selectedStock.halted" @click="emit('order', selectedCode)">{{ selectedStock.halted ? '오늘 거래 정지' : '주문 화면으로' }}</button>
      </div>
      <div class="focus-quote-chart"><div class="focus-chart-toolbar"><strong>{{ chartPeriod === 'intraday' ? '당일 주가' : chartPeriod === 'daily' ? '일별 종가' : '주별 종가' }}</strong><span>{{ chartPeriod === 'intraday' ? `전일 종가 ${selectedStock.previousClose.toLocaleString()}원` : chartPeriod === 'daily' ? `최근 ${dailyChartPoints.length}거래일` : '5거래일 단위' }}</span><div class="chart-period-toggle" role="group" aria-label="차트 기간"><button type="button" :aria-pressed="chartPeriod === 'intraday'" @click="chartPeriod = 'intraday'">당일</button><button type="button" :aria-pressed="chartPeriod === 'daily'" @click="chartPeriod = 'daily'">일별</button><button type="button" :aria-pressed="chartPeriod === 'weekly'" @click="chartPeriod = 'weekly'">주별</button></div></div><MiniChart :values="chartValues" :labels="chartLabels" :period="chartPeriod" :baseline="chartBaseline" :session-start-index="selectedStock.sessionStartIndex" :market-minute="marketMinute" show-axes /></div>
    </section>
    <section class="company-detail-news"><header><div><span>COMPANY NOTE</span><h3>{{ selectedStock.name }} 소식</h3></div><strong>{{ currentPhase }}일차</strong></header><p>{{ selectedCompanyNote }}</p></section>
  </main>
</template>
