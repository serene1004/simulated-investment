<script setup lang="ts">
defineEmits<{ start: [] }>();
</script>

<template>
  <main class="title-screen">
    <section class="title-scene">
      <div class="title-copy">
        <h1>백수의 주식투자</h1>
        <p>3년간 다닌 회사의 퇴직금 1000만원<br>과연 투자에 성공할 수 있을까</p>
        <div class="title-actions">
          <button class="primary-button" @click="$emit('start')">투자 시작하기</button>
        </div>
      </div>
      <div class="title-wordmark">STOCK SIMULATION WEB GAME</div>
    </section>
  </main>
</template>

<style scoped>
.title-screen { display:grid; place-items:center; width:100%; height:100%; min-height:0; padding:clamp(1rem,4vw,3rem); }
.title-scene { position:relative; display:flex; align-items:center; width:min(100%,1080px); min-height:min(76vh,720px); }
.title-copy { width:min(58%,620px); padding:clamp(1rem,4vw,3.5rem); color:#fff9e9; text-shadow:2px 2px 0 #17283b; }
.title-copy h1 { margin:0 0 1rem; color:#fff9e9; font-size:clamp(2.5rem,6vw,5rem); line-height:1.12; text-wrap:balance; }
.title-copy>p { max-width:30rem; color:#f2edda; line-height:1.7; }
.title-actions { display:flex; flex-wrap:wrap; gap:.75rem; margin-top:2rem; }
.title-actions button { min-height:3.2rem; padding:.75rem 1rem; border:2px solid #17283b; box-shadow:3px 3px 0 #17283b; font-weight:800; text-shadow:none; }
.title-actions .primary-button { background:#f0c34d; color:#17283b; }
.title-actions .secondary-button { background:#fff9e9; color:#17283b; }
.title-wordmark { position:absolute; right:1.25rem; bottom:1rem; color:#fff9e9; font:700 .72rem ui-monospace,monospace; letter-spacing:.12em; text-shadow:1px 1px #17283b; }
@media(max-width:680px) {
  .title-screen { align-items:end; padding:1rem; }
  .title-scene { min-height:82vh; align-items:center; }
  .title-copy { width:100%; padding:1.2rem; }
  .title-copy h1 { font-size:clamp(2.6rem,12vw,4rem); }
  .title-wordmark { right:.5rem; bottom:.5rem; font-size:.58rem; }
}
</style>
