<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  values: number[]
  positive?: boolean
  baseline?: number
  sessionStartIndex?: number
  marketMinute?: number
  showAxes?: boolean
  period?: 'intraday' | 'daily' | 'weekly'
  labels?: string[]
}>();

const width = computed(() => props.showAxes ? 420 : 220);
const height = computed(() => props.showAxes ? 112 : 72);
const left = computed(() => props.showAxes ? 8 : 8);
const right = computed(() => width.value - (props.showAxes ? 58 : 8));
const top = 8;
const bottom = computed(() => height.value - (props.showAxes ? 32 : 8));
const formatPrice = (price: number) => `${Math.round(price).toLocaleString('ko-KR')}`;
const formatTime = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

const chartGeometry = computed(() => {
  if (!props.values.length) {
    return {
      points: '',
      areaPoints: '',
      baselineY: height.value / 2,
      segments: [],
      pointList: [],
      yLabels: [],
      sessionX: left.value,
      timeLabels: [],
    };
  }

  const baseline = props.baseline && props.baseline > 0 ? props.baseline : props.values[0] || 1;
  const intraday = !props.period || props.period === 'intraday';
  const percentValues = props.values.map((value) => ((value - baseline) / baseline) * 100);
  let min = Math.min(...percentValues, 0);
  let max = Math.max(...percentValues, 0);

  if (Math.abs(max - min) < 0.8) {
    min -= 0.4;
    max += 0.4;
  } else {
    const paddingPercent = (max - min) * 0.16;
    min -= paddingPercent;
    max += paddingPercent;
  }

  const range = Math.max(0.8, max - min);
  const innerHeight = bottom.value - top;
  const baselineY = bottom.value - ((0 - min) / range) * innerHeight;
  const sessionStartIndex = intraday ? Math.max(0, Math.min(props.sessionStartIndex ?? 0, props.values.length - 1)) : 0;
  const sessionStartX = props.showAxes && sessionStartIndex > 0
    ? left.value + (right.value - left.value) * 0.28
    : left.value;
  const lastMinute = props.marketMinute ?? 20 * 60;
  const sampleMinutes = [9 * 60];
  for (let minute = 9 * 60 + 5; minute <= lastMinute; minute += 5) {
    if (minute > 15 * 60 + 30 && minute < 16 * 60) continue;
    sampleMinutes.push(minute);
  }
  const activeSampleCount = percentValues.length - sessionStartIndex;
  const sampleOffset = Math.max(0, sampleMinutes.length - activeSampleCount);

  const pointList = percentValues.map((value, index) => {
    let x = left.value + (index * (right.value - left.value)) / Math.max(1, percentValues.length - 1);
    if (props.showAxes && index < sessionStartIndex) {
      x = left.value + ((sessionStartX - left.value) * index) / Math.max(1, sessionStartIndex);
    } else if (props.showAxes && intraday) {
      const sampleIndex = sampleOffset + index - sessionStartIndex;
      const pointMinute = sampleMinutes[sampleIndex] ?? lastMinute;
      const progress = Math.max(0, Math.min(1, (pointMinute - 9 * 60) / (11 * 60)));
      x = sessionStartX + progress * (right.value - sessionStartX);
    }
    const y = bottom.value - ((value - min) / range) * innerHeight;

    return { x, y };
  });

  const points = pointList.map((point) => `${point.x},${point.y}`).join(' ');
  const firstX = pointList[0]?.x ?? left.value;
  const lastX = pointList[pointList.length - 1]?.x ?? right.value;
  const areaPoints = [`${firstX},${baselineY}`, points, `${lastX},${baselineY}`].join(' ');
  const segments = pointList.slice(1).flatMap((point, index) => {
    const previous = pointList[index];
    const previousValue = percentValues[index];
    const currentValue = percentValues[index + 1];
    const segment = (start: typeof point, end: typeof point, value: number, tone?: string) => ({ ...start, x2: end.x, y2: end.y, tone: tone ?? (value >= 0 ? 'positive' : 'negative') });

    if (index + 1 <= sessionStartIndex) {
      return [segment(previous, point, 0, 'history')];
    }

    if (previousValue * currentValue < 0) {
      const ratio = Math.abs(previousValue) / (Math.abs(previousValue) + Math.abs(currentValue));
      const crossing = { x: previous.x + (point.x - previous.x) * ratio, y: baselineY };
      return [segment(previous, crossing, previousValue), segment(crossing, point, currentValue)];
    }

    return [segment(previous, point, (previousValue + currentValue) / 2)];
  });
  const yLabels = props.showAxes ? [
    { price: baseline * (1 + max / 100), y: top },
    { price: baseline, y: baselineY },
    { price: baseline * (1 + min / 100), y: bottom.value },
  ] : [];
  const sessionX = pointList[sessionStartIndex]?.x ?? left.value;
  const timeLabels = props.showAxes && intraday ? Array.from({ length: 12 }, (_, hour) => {
    const minute = (9 + hour) * 60;
    const progress = (minute - 9 * 60) / (11 * 60);
    return { x: sessionStartX + progress * (right.value - sessionStartX), label: formatTime(minute), anchor: hour === 0 ? 'start' : hour === 11 ? 'end' : 'middle' };
  }) : props.showAxes ? [...new Set(props.period === 'weekly'
    ? percentValues.map((_, index) => index)
    : percentValues.length <= 6
      ? percentValues.map((_, index) => index)
      : Array.from({ length: 6 }, (_, index) => Math.round(index * (percentValues.length - 1) / 5)))].map((index) => ({
    x: pointList[index]?.x ?? left.value,
    label: props.labels?.[index] ?? `${index + 1}`,
    anchor: index === 0 ? 'start' : index === percentValues.length - 1 ? 'end' : 'middle',
  })) : [];

  return {
    points,
    areaPoints,
    baselineY,
    segments,
    pointList,
    yLabels,
    sessionX,
    timeLabels,
  };
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-parsing-error -->
  <svg class="sparkline-chart" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="period === 'daily' ? '거래일별 종가 추이' : period === 'weekly' ? '주별 종가 추이' : baseline ? '전일 종가 기준 가격 추이' : '최근 가격 추이'">
    <template v-if="baseline">
      <line :x1="left" :y1="chartGeometry.baselineY" :x2="right" :y2="chartGeometry.baselineY" class="sparkline-baseline" />
      <line v-if="showAxes && (!period || period === 'intraday')" :x1="chartGeometry.sessionX" :y1="top" :x2="chartGeometry.sessionX" :y2="bottom" class="sparkline-session-marker" />
      <line v-for="(segment, index) in chartGeometry.segments" :key="index" :x1="segment.x" :y1="segment.y" :x2="segment.x2" :y2="segment.y2" :class="`sparkline-line-${segment.tone}`" />
      <template v-if="period === 'daily' || period === 'weekly'">
        <circle v-for="(point, index) in chartGeometry.pointList" :key="`point-${index}`" :cx="point.x" :cy="point.y" r="1.8" :class="values[index] >= baseline ? 'sparkline-point-positive' : 'sparkline-point-negative'"><title>{{ labels?.[index] ?? index + 1 }} · {{ formatPrice(values[index]) }}원</title></circle>
      </template>
      <template v-if="showAxes">
        <line v-for="(label, index) in chartGeometry.timeLabels" :key="`grid-${index}`" :x1="label.x" :y1="top" :x2="label.x" :y2="bottom" class="sparkline-time-grid" />
        <line :x1="left" :y1="top" :x2="left" :y2="bottom" class="sparkline-axis" />
        <line :x1="left" :y1="bottom" :x2="right" :y2="bottom" class="sparkline-axis" />
        <text v-for="(label, index) in chartGeometry.yLabels" :key="`y-${index}`" :x="right + 6" :y="label.y + 3" class="sparkline-axis-label" text-anchor="start">{{ formatPrice(label.price) }}</text>
        <text :x="right + 6" y="8" class="sparkline-axis-unit" text-anchor="start">원</text>
        <text v-for="(label, index) in chartGeometry.timeLabels" :key="`x-${index}`" :x="label.x" :y="height - 4" class="sparkline-axis-label" :text-anchor="label.anchor">{{ label.label }}</text>
      </template>
    </template>
    <template v-else>
      <polygon :points="chartGeometry.areaPoints" :class="positive ? 'sparkline-area-positive' : 'sparkline-area-negative'" />
      <polyline :points="chartGeometry.points" fill="none" :class="positive ? 'sparkline-line-positive' : 'sparkline-line-negative'" />
    </template>
  </svg>
</template>

