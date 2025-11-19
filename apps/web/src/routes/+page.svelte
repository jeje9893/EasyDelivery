<script lang="ts">
  let name = "";
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<main class="container">
  <h1>EasyDelivery 데모 페이지 🚀</h1>

  <section>
    <label>
      이름 입력:
      <input bind:value={name} placeholder="예: 재경" />
    </label>

    {#if name}
      <p>안녕하세요, <strong>{name}</strong>!</p>
    {/if}
  </section>

  <section>
    <p>버튼 클릭 횟수: {count}</p>
    <button on:click={increment}>+1 증가</button>
  </section>
</main>

<style>
  .container {
    max-width: 400px;
    margin: 40px auto;
    padding: 24px;
    border: 1px solid #ddd;
    border-radius: 12px;
    font-family: system-ui, sans-serif;
  }
  h1 {
    font-size: 1.4rem;
    margin-bottom: 16px;
  }
  input {
    margin-left: 8px;
    padding: 4px 8px;
  }
  button {
    margin-top: 12px;
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: #111827;
    color: #fff;
    cursor: pointer;
  }
</style>
