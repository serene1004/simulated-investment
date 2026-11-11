<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ code: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });
const order = ['BLUE', 'GREEN', 'NEO', 'AUR', 'SKY', 'WAVE', 'NOVA', 'CORE', 'AEG', 'VXR', 'MINT', 'LUM', 'POL', 'ORB', 'FIN', 'JET', 'HYP', 'MEC', 'CLOUD', 'FOOD', 'PORT', 'CARE', 'LOOP', 'BUILD'];
const index = computed(() => order.indexOf(props.code));
const style = computed(() => ({
  backgroundPosition: `${(index.value % 6) * 20}% ${Math.floor(index.value / 6) * (100 / 3)}%`,
  backgroundImage: index.value < 0 ? 'none' : `url('${import.meta.env.BASE_URL}assets/company-emblems-pixel.png')`,
}));
</script>

<template><span class="asset-icon" :class="[`asset-icon-${size}`, { 'asset-icon-fallback': index < 0 }]" :style="style" aria-hidden="true">{{ index < 0 ? code.slice(0, 2) : '' }}</span></template>

<style scoped>
.asset-icon{display:inline-block;flex:0 0 auto;border:1px solid #26394b;background-color:#fffef7;background-size:600% 400%;background-repeat:no-repeat;image-rendering:pixelated}.asset-icon-sm{width:2rem;height:2rem}.asset-icon-md{width:2.4rem;height:2.4rem}.asset-icon-lg{width:2.95rem;height:2.95rem}
.asset-icon-fallback{display:grid;place-items:center;background-image:none;background-color:#e8f0e8;color:#17283b;font:700 .62rem ui-monospace,monospace}
</style>
