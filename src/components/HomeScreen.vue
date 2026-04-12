<script setup lang="ts">
defineEmits<{
  start: []
  ranking: []
}>()
</script>

<template>
  <div class="screen-shell screen-home">
    <section class="panel screen-panel scene-panel">
      <div class="screen-stack home-screen-stack">
        <p class="eyebrow">STOCK SURVIVAL DASH</p>
        <h1>모의투자 서바이벌</h1>
        <p class="screen-copy">5페이즈 동안 흐름을 읽고 가볍게 즐기는 모의투자 게임이에요.</p>

        <div class="screen-divider" aria-hidden="true"></div>

        <div class="feature-stack home-feature-stack">
          <article class="feature-panel accent-red">
            <span>투자 전 체크</span>
            <strong>개장 전 흐름을 보고 오늘 들어갈 종목을 정해봐요.</strong>
          </article>

          <article class="feature-panel accent-blue">
            <span>종목별 1회 거래</span>
            <strong>같은 페이즈에서는 한 번 건드린 종목을 다시 거래할 수 없어요.</strong>
          </article>

          <article class="feature-panel accent-gold">
            <span>최종 자산 랭킹 기록</span>
            <strong>마지막 자산 점수로 랭킹에 기록을 남길 수 있어요.</strong>
          </article>
        </div>

        <div class="screen-divider" aria-hidden="true"></div>

        <div class="screen-actions">
          <button class="secondary-button" @click="$emit('ranking')">랭킹 보기</button>
          <button class="primary-button" @click="$emit('start')">게임 시작</button>
        </div>
      </div>
    </section>
  </div>
</template>
