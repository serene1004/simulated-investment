<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  code: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
});

type IconVariant =
  | 'bars'
  | 'leaf'
  | 'capsule'
  | 'spark'
  | 'route'
  | 'play'
  | 'wheel'
  | 'chip'
  | 'shield'
  | 'neural'
  | 'box'
  | 'pulse'
  | 'ticket'
  | 'orbit';

const iconMap: Record<string, { variant: IconVariant; bg: string; accent: string; accentSoft: string }> = {
  BLUE: { variant: 'bars', bg: 'linear-gradient(135deg, #1b3e72 0%, #2e6fcb 100%)', accent: '#f5fbff', accentSoft: '#c6defd' },
  GREEN: { variant: 'leaf', bg: 'linear-gradient(135deg, #14744d 0%, #3bb97d 100%)', accent: '#effff6', accentSoft: '#c9f4de' },
  NEO: { variant: 'capsule', bg: 'linear-gradient(135deg, #7a2e64 0%, #ce5d94 100%)', accent: '#fff2f8', accentSoft: '#f6c6dc' },
  AUR: { variant: 'spark', bg: 'linear-gradient(135deg, #7a2f14 0%, #f06a3e 100%)', accent: '#fff7f2', accentSoft: '#ffd6c7' },
  SKY: { variant: 'route', bg: 'linear-gradient(135deg, #1c4e7c 0%, #54a8ea 100%)', accent: '#eff8ff', accentSoft: '#cfe8fb' },
  WAVE: { variant: 'play', bg: 'linear-gradient(135deg, #6940cf 0%, #8a70f4 100%)', accent: '#f6f1ff', accentSoft: '#ddd3ff' },
  NOVA: { variant: 'wheel', bg: 'linear-gradient(135deg, #7b4616 0%, #d58b34 100%)', accent: '#fff7ef', accentSoft: '#f7ddbb' },
  CORE: { variant: 'chip', bg: 'linear-gradient(135deg, #24324b 0%, #4c6d9f 100%)', accent: '#f2f6ff', accentSoft: '#cfdaee' },
  AEG: { variant: 'shield', bg: 'linear-gradient(135deg, #5d6476 0%, #9aa2b7 100%)', accent: '#fbfcff', accentSoft: '#dce3f1' },
  VXR: { variant: 'neural', bg: 'linear-gradient(135deg, #0f4d66 0%, #33a2d4 100%)', accent: '#f1fdff', accentSoft: '#c4eef9' },
  MINT: { variant: 'box', bg: 'linear-gradient(135deg, #157e73 0%, #4bcab7 100%)', accent: '#effffb', accentSoft: '#c8f4ec' },
  LUM: { variant: 'pulse', bg: 'linear-gradient(135deg, #34609b 0%, #5db1ff 100%)', accent: '#f2f8ff', accentSoft: '#d5e9ff' },
  POL: { variant: 'ticket', bg: 'linear-gradient(135deg, #6c2354 0%, #d1609d 100%)', accent: '#fff2fa', accentSoft: '#f6cde5' },
  ORB: { variant: 'orbit', bg: 'linear-gradient(135deg, #20283d 0%, #5e78b2 100%)', accent: '#f4f7ff', accentSoft: '#d4def3' },
  FIN: { variant: 'bars', bg: 'linear-gradient(135deg, #235275 0%, #4a93c8 100%)', accent: '#f4fbff', accentSoft: '#cae6fb' },
  JET: { variant: 'route', bg: 'linear-gradient(135deg, #20507f 0%, #67b5ef 100%)', accent: '#eff8ff', accentSoft: '#d2ebff' },
  HYP: { variant: 'box', bg: 'linear-gradient(135deg, #7f3f17 0%, #e18a41 100%)', accent: '#fff8f1', accentSoft: '#ffe0c0' },
  MEC: { variant: 'wheel', bg: 'linear-gradient(135deg, #44546b 0%, #7c9bc6 100%)', accent: '#f4f8ff', accentSoft: '#d6e0f2' },
};

const iconConfig = computed(() => iconMap[props.code] ?? iconMap.BLUE);

const iconStyle = computed(() => ({
  '--icon-bg': iconConfig.value.bg,
  '--icon-accent': iconConfig.value.accent,
  '--icon-accent-soft': iconConfig.value.accentSoft,
}));
</script>

<template>
  <span class="asset-icon" :class="[`asset-icon-${size}`, `asset-icon-variant-${iconConfig.variant}`]" :style="iconStyle" aria-hidden="true">
    <svg viewBox="0 0 32 32" focusable="false">
      <template v-if="iconConfig.variant === 'bars'">
        <rect x="7" y="17" width="4" height="8" rx="1.2" />
        <rect x="14" y="12" width="4" height="13" rx="1.2" />
        <rect x="21" y="8" width="4" height="17" rx="1.2" />
      </template>

      <template v-else-if="iconConfig.variant === 'leaf'">
        <path d="M16 7c5.2 0 8.6 4 8.6 9.1 0 5.3-3.8 8.9-8.9 8.9-4.3 0-7.7-2.9-7.7-7.1 0-5 4.4-9.7 8-10.9z" />
        <path class="icon-stroke" d="M11 21c3.1-2.1 6.1-5.2 8.3-8.8" />
      </template>

      <template v-else-if="iconConfig.variant === 'capsule'">
        <rect x="6.5" y="10" width="19" height="12" rx="6" />
        <path class="icon-stroke" d="M16 10v12" />
      </template>

      <template v-else-if="iconConfig.variant === 'spark'">
        <path d="M16 6.5l2.3 6.2 6.7 1-4.8 4.4 1.2 6.4L16 21.1l-5.4 3.4 1.2-6.4-4.8-4.4 6.7-1z" />
      </template>

      <template v-else-if="iconConfig.variant === 'route'">
        <path class="icon-stroke" d="M7 23c4.7 0 4.2-8.2 9-8.2s4.4 8.2 9 8.2" />
        <circle cx="8" cy="23" r="2.2" />
        <circle cx="24" cy="23" r="2.2" />
      </template>

      <template v-else-if="iconConfig.variant === 'play'">
        <path d="M11 8.8a1.2 1.2 0 0 1 1.8-1L23 14a1.2 1.2 0 0 1 0 2L12.8 22.2a1.2 1.2 0 0 1-1.8-1z" />
        <path class="icon-stroke" d="M6.5 12.3c1.5-.7 2.4-.7 3.9 0M6.5 19.7c1.5-.7 2.4-.7 3.9 0" />
      </template>

      <template v-else-if="iconConfig.variant === 'wheel'">
        <circle cx="16" cy="16" r="7.8" />
        <circle class="icon-cutout" cx="16" cy="16" r="3.1" />
        <path class="icon-stroke" d="M16 8.2v4.2M23.8 16h-4.2M16 23.8v-4.2M8.2 16h4.2" />
      </template>

      <template v-else-if="iconConfig.variant === 'chip'">
        <rect x="9.2" y="9.2" width="13.6" height="13.6" rx="2.2" />
        <rect class="icon-cutout" x="13" y="13" width="6" height="6" rx="1.2" />
        <path class="icon-stroke" d="M12 7v3M16 7v3M20 7v3M12 22v3M16 22v3M20 22v3M7 12h3M7 16h3M7 20h3M22 12h3M22 16h3M22 20h3" />
      </template>

      <template v-else-if="iconConfig.variant === 'shield'">
        <path d="M16 6.5 24 9.3v6.4c0 4.4-3 8.3-8 10.1-5-1.8-8-5.7-8-10.1V9.3z" />
        <path class="icon-stroke" d="M16 10.8v9.1M12 15.3h8" />
      </template>

      <template v-else-if="iconConfig.variant === 'neural'">
        <circle cx="10" cy="10" r="2.2" />
        <circle cx="22" cy="10" r="2.2" />
        <circle cx="10" cy="22" r="2.2" />
        <circle cx="22" cy="22" r="2.2" />
        <circle class="icon-cutout" cx="16" cy="16" r="3.1" />
        <path class="icon-stroke" d="M12 11.3 14.2 13M20 11.3 17.8 13M12 20.7 14.2 19M20 20.7 17.8 19" />
      </template>

      <template v-else-if="iconConfig.variant === 'box'">
        <path d="M8 11.5 16 7l8 4.5-8 4.5z" />
        <path d="M8 12.8V21l8 4 8-4v-8.2l-8 4.2z" />
      </template>

      <template v-else-if="iconConfig.variant === 'pulse'">
        <path class="icon-stroke" d="M6.5 18.2h5l2.3-4.9 3.1 8.1 2.4-5.1h6.2" />
        <circle cx="10" cy="11" r="2.1" />
      </template>

      <template v-else-if="iconConfig.variant === 'ticket'">
        <path d="M8 10.2h16a1.4 1.4 0 0 1 1.4 1.4v2.6a2.7 2.7 0 0 0 0 3.6v2.6A1.4 1.4 0 0 1 24 21.8H8a1.4 1.4 0 0 1-1.4-1.4v-2.6a2.7 2.7 0 0 0 0-3.6v-2.6A1.4 1.4 0 0 1 8 10.2z" />
        <path class="icon-stroke" d="M16 10.6v10.8" />
      </template>

      <template v-else>
        <circle cx="16" cy="16" r="4.1" />
        <ellipse class="icon-stroke" cx="16" cy="16" rx="10" ry="4.8" />
        <ellipse class="icon-stroke" cx="16" cy="16" rx="4.8" ry="10" />
      </template>
    </svg>
  </span>
</template>

<style scoped>
.asset-icon {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 14px;
  background: var(--icon-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 10px 20px rgba(20, 33, 55, 0.14);
}

.asset-icon svg {
  width: 70%;
  height: 70%;
}

.asset-icon :deep(path),
.asset-icon :deep(rect),
.asset-icon :deep(circle),
.asset-icon :deep(ellipse) {
  fill: var(--icon-accent);
}

.asset-icon :deep(.icon-stroke) {
  fill: none;
  stroke: var(--icon-accent-soft);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.asset-icon :deep(.icon-cutout) {
  fill: rgba(16, 24, 37, 0.18);
}

.asset-icon-sm {
  width: 2rem;
  height: 2rem;
  border-radius: 12px;
}

.asset-icon-md {
  width: 2.4rem;
  height: 2.4rem;
}

.asset-icon-lg {
  width: 2.95rem;
  height: 2.95rem;
  border-radius: 16px;
}
</style>

