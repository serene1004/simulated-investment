<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow: string
  title: string
  headingLevel?: 'h2' | 'h3'
}>(), {
  headingLevel: 'h2',
});
</script>

<template>
  <div class="section-header">
    <div class="section-heading">
      <p class="eyebrow">{{ eyebrow }}</p>
      <component :is="headingLevel">{{ title }}</component>
    </div>
    <slot name="meta" />
  </div>
</template>
