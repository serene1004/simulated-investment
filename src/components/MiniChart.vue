<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  values: number[]
  positive?: boolean
}>();

const width = 220;
const height = 72;
const padding = 8;

const chartGeometry = computed(() => {
  if (!props.values.length) {
    return {
      points: '',
      areaPoints: '',
    };
  }

  const baseline = props.values[0] || 1;
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
  const innerHeight = height - padding * 2;
  const baselineY = height - padding - ((0 - min) / range) * innerHeight;

  const pointList = percentValues.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, percentValues.length - 1);
    const y = height - padding - ((value - min) / range) * innerHeight;

    return { x, y };
  });

  const points = pointList.map((point) => `${point.x},${point.y}`).join(' ');
  const firstX = pointList[0]?.x ?? padding;
  const lastX = pointList[pointList.length - 1]?.x ?? width - padding;
  const areaPoints = [`${firstX},${baselineY}`, points, `${lastX},${baselineY}`].join(' ');

  return {
    points,
    areaPoints,
  };
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-parsing-error -->
  <svg class="sparkline-chart" :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="理쒓렐 媛寃?異붿씠">
    <polygon :points="chartGeometry.areaPoints" :class="positive ? 'sparkline-area-positive' : 'sparkline-area-negative'" />
    <polyline :points="chartGeometry.points" fill="none" :class="positive ? 'sparkline-line-positive' : 'sparkline-line-negative'" />
  </svg>
</template>

