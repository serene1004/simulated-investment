<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import StockListItem from '../shared/StockListItem.vue';
import type { StockState } from '../../types/game';

const props = defineProps<{
  marketMinute: number
  marketOpen: boolean
  marketIndexValue: number
  marketIndexChange: number
  marketIndexChangeRate: number
  stocks: StockState[]
}>();

const emit = defineEmits<{
  selectStock: [code: string]
  navigate: [view: 'companies' | 'portfolio']
}>();

const marketIndexImage = `${import.meta.env.BASE_URL}assets/market-index-mark-pixel.png`;
const stockQuery = ref('');
const priceSort = ref<'default' | 'asc' | 'desc' | 'volume'>('default');
const showSortPicker = ref(false);
const sortOptions = [
  { value: 'default', label: '기본순', description: '등록된 종목 순서' },
  { value: 'asc', label: '낮은 가격순', description: '현재가가 낮은 종목부터' },
  { value: 'desc', label: '높은 가격순', description: '현재가가 높은 종목부터' },
  { value: 'volume', label: '인기순', description: '평균 거래량이 많은 종목부터' },
] as const;
const selectedSortOption = computed(() => sortOptions.find((option) => option.value === priceSort.value) ?? sortOptions[0]);
const watchlistStorageKey = 'simulated-investment-watchlist';
const readWatchlist = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(watchlistStorageKey) ?? '[]');
    return Array.isArray(saved)
      ? [...new Set(saved.filter((code): code is string => typeof code === 'string' && props.stocks.some((stock) => stock.code === code)))].slice(0, 5)
      : [];
  } catch {
    return [];
  }
};
const watchlist = ref<string[]>(readWatchlist());
const maintenance = computed(() => props.marketMinute >= 15 * 60 + 30 && props.marketMinute < 16 * 60);
const afterMarket = computed(() => props.marketMinute >= 16 * 60 && props.marketOpen);
const marketClock = computed(() => `${String(Math.floor(props.marketMinute / 60)).padStart(2, '0')}:${String(props.marketMinute % 60).padStart(2, '0')}`);
const openSortPicker = () => {
  showSortPicker.value = true;
  void nextTick(() => document.querySelector<HTMLButtonElement>('#market-sort-options [aria-pressed="true"]')?.focus());
};
const closeSortPicker = () => {
  showSortPicker.value = false;
  void nextTick(() => document.querySelector<HTMLButtonElement>('#market-sort-trigger')?.focus());
};
const selectSort = (value: typeof priceSort.value) => {
  priceSort.value = value;
  closeSortPicker();
};
const visibleStocks = computed(() => props.stocks
  .filter((stock) => `${stock.name} ${stock.code} ${stock.theme}`.toLocaleLowerCase().includes(stockQuery.value.trim().toLocaleLowerCase()))
  .sort((left, right) => {
    const leftWatchIndex = watchlist.value.indexOf(left.code);
    const rightWatchIndex = watchlist.value.indexOf(right.code);
    if (leftWatchIndex >= 0 || rightWatchIndex >= 0) {
      if (leftWatchIndex < 0) return 1;
      if (rightWatchIndex < 0) return -1;
      return leftWatchIndex - rightWatchIndex;
    }
    if (priceSort.value === 'volume') return right.averageVolume - left.averageVolume;
    return priceSort.value === 'default' ? 0 : (left.price - right.price) * (priceSort.value === 'asc' ? 1 : -1);
  }));

const movePickerFocus = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSortPicker();
    return;
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const options = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button')];
  const index = options.indexOf((event.target as HTMLElement).closest('button') as HTMLButtonElement);
  const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
    : index < 0 ? (event.key === 'ArrowUp' ? options.length - 1 : 0)
      : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
  event.preventDefault();
  options[nextIndex]?.focus();
};
const toggleWatchlist = (code: string) => {
  watchlist.value = watchlist.value.includes(code)
    ? watchlist.value.filter((item) => item !== code)
    : watchlist.value.length < 5 ? [...watchlist.value, code] : watchlist.value;
  try {
    window.localStorage.setItem(watchlistStorageKey, JSON.stringify(watchlist.value));
  } catch {
    // Keep the in-memory watchlist usable when browser storage is unavailable.
  }
};
</script>

<template>
  <main class="market-information-view">
    <header class="market-view-toolbar"><div><span>MARKET WATCH</span><strong>종목 시세</strong></div><nav class="market-toolbar-actions" aria-label="증권 화면"><button class="return-market-link" type="button" @click="emit('navigate', 'companies')">기업 정보</button><button class="return-market-link" type="button" @click="emit('navigate', 'portfolio')">내 주식</button></nav></header>

    <section class="market-breadth-strip" aria-label="시장 종합지수">
      <div class="market-index-mark"><img :src="marketIndexImage" alt="" /></div>
      <div class="market-index-lead"><span>LEXIP 종합지수 <small>기준 1,000.00</small></span><strong>{{ marketIndexValue.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong></div>
      <div class="market-index-change" :class="marketIndexChange >= 0 ? 'up' : 'down'"><strong>{{ marketIndexChange > 0 ? '+' : '' }}{{ marketIndexChange.toFixed(2) }}</strong><span>{{ marketIndexChangeRate > 0 ? '+' : '' }}{{ marketIndexChangeRate.toFixed(3) }}%</span><small>전일 대비</small></div>
      <span class="market-index-session">{{ maintenance ? '장 정비' : afterMarket ? '애프터마켓' : marketOpen ? '정규장' : '장 마감' }} · {{ marketClock }}</span>
    </section>

    <section class="market-table-section" aria-label="전체 종목 시세">
      <header class="market-table-title"><h2>전체 종목 시세</h2><strong>{{ visibleStocks.length }} / {{ stocks.length }}</strong></header>
      <div class="market-search-controls">
        <label class="stock-search-box"><span>종목 검색</span><input v-model="stockQuery" type="search" placeholder="종목명, 코드, 업종 검색" /></label>
        <div class="market-sort-picker order-stock-picker">
          <span class="order-stock-picker-label">종목 정렬</span>
          <button id="market-sort-trigger" class="order-stock-picker-trigger" type="button" aria-controls="market-sort-options" :aria-expanded="showSortPicker" @click="showSortPicker ? closeSortPicker() : openSortPicker()"><span><strong>{{ selectedSortOption.label }}</strong><small>{{ selectedSortOption.description }}</small></span><b aria-hidden="true">{{ showSortPicker ? '▴' : '▾' }}</b></button>
          <div v-if="showSortPicker" id="market-sort-options" class="order-stock-picker-menu" role="group" aria-label="종목 정렬 선택" @keydown="movePickerFocus">
            <button v-for="option in sortOptions" :key="option.value" type="button" :aria-pressed="priceSort === option.value" @click="selectSort(option.value)"><span><strong>{{ option.label }}</strong><small>{{ option.description }}</small></span><b v-if="priceSort === option.value" aria-hidden="true">✓</b></button>
          </div>
        </div>
        <span class="market-watch-count">관심 {{ watchlist.length }}/5</span>
      </div>
      <div class="market-list-heading" aria-hidden="true"><span>종목</span><span>현재가</span><span>전일 종가</span><span>전일 대비</span><span>관심</span></div>
      <div class="market-list market-list-compact">
        <StockListItem v-for="stock in visibleStocks" :key="stock.code" :stock="stock" :watched="watchlist.includes(stock.code)" :watch-disabled="watchlist.length >= 5 && !watchlist.includes(stock.code)" @select="emit('selectStock', $event)" @toggle-watch="toggleWatchlist" />
      </div>
      <p v-if="visibleStocks.length === 0" class="market-search-empty">검색 결과가 없습니다.</p>
    </section>
  </main>
</template>
