<script lang="ts">
  import { fade } from 'svelte/transition';
</script>

<div class="landing-container">
  <header class="landing-header">
    <h1 class="app-title">노인 배달 서비스</h1>
    <p class="app-subtitle">간단하고 쉬운 음식 주문</p>
  </header>

  <main class="landing-content">
    <div class="mode-selector" in:fade={{ duration: 500 }}>
      <div class="mode-card guardian-card">
        <div class="mode-icon">👨‍💼</div>
        <h2>보호자 모드</h2>
        <p class="mode-desc">미리 가게, 메뉴, 주소, 결제 수단을 등록하고 관리할 수 있습니다.</p>
        <a href="/guardian" class="mode-btn guardian-btn">보호자 설정으로 이동</a>
      </div>

      <div class="mode-card user-card">
        <div class="mode-icon">👵</div>
        <h2>사용자 모드</h2>
        <p class="mode-desc">보호자가 등록한 메뉴를 선택하고 간편하게 주문할 수 있습니다.</p>
        <a href="/deliverypage" class="mode-btn user-btn">주문 시작하기</a>
      </div>
    </div>
  </main>

  <footer class="landing-footer">
    <p>© 2024 노인 배달 서비스. All rights reserved.</p>
  </footer>
</div>

<style>
  .landing-container {
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
  }

  .landing-header {
    text-align: center;
    padding: 50px 20px 30px;
    color: white;
  }

  .app-title {
    font-size: 2.8rem;
    font-weight: 900;
    margin: 0 0 10px 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.02em;
  }

  .app-subtitle {
    font-size: 1.3rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 300;
  }

  .landing-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1200px;
  }

  .mode-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    width: 100%;
    padding: 0 20px;
  }

  .mode-card {
    background: white;
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    text-align: center;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .mode-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .mode-icon {
    font-size: 5rem;
    margin-bottom: 10px;
  }

  .mode-card h2 {
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0;
    color: #333;
  }

  .mode-desc {
    font-size: 1rem;
    color: #666;
    margin: 0;
    line-height: 1.6;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mode-btn {
    padding: 16px 32px;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .guardian-card {
    border: 3px solid #4caf50;
    background: linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%);
  }

  .guardian-btn {
    background: #4caf50;
    color: white;
  }

  .guardian-btn:hover {
    background: #45a049;
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }

  .user-card {
    border: 3px solid #2196f3;
    background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
  }

  .user-btn {
    background: #2196f3;
    color: white;
  }

  .user-btn:hover {
    background: #1976d2;
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
  }

  .landing-footer {
    text-align: center;
    padding: 20px;
    color: white;
    opacity: 0.8;
  }

  .landing-footer p {
    font-size: 0.95rem;
    margin: 0;
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .landing-container {
      padding: 15px;
    }

    .landing-header {
      padding: 30px 15px 15px;
    }

    .app-title {
      font-size: 2rem;
    }

    .app-subtitle {
      font-size: 1.1rem;
    }

    .mode-selector {
      grid-template-columns: 1fr;
      gap: 20px;
      padding: 0 10px;
    }

    .mode-card {
      padding: 30px 20px;
    }

    .mode-icon {
      font-size: 4rem;
    }

    .mode-card h2 {
      font-size: 1.5rem;
    }

    .mode-desc {
      font-size: 0.95rem;
      min-height: 50px;
    }

    .mode-btn {
      padding: 14px 24px;
      font-size: 1rem;
    }
  }

  /* 매우 작은 화면 */
  @media (max-width: 480px) {
    .app-title {
      font-size: 1.6rem;
    }

    .app-subtitle {
      font-size: 1rem;
    }

    .mode-card {
      padding: 25px 15px;
      gap: 15px;
    }

    .mode-icon {
      font-size: 3.5rem;
    }

    .mode-card h2 {
      font-size: 1.3rem;
    }

    .mode-desc {
      font-size: 0.9rem;
    }
  }
</style>
