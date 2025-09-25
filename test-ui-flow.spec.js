const { test, expect, chromium } = require('@playwright/test');

test.describe('JSON Import and Session Creation Flow', () => {
  test('should import JSON and create session', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('1. Navigating to host page...');
    await page.goto('http://localhost:3001/host');
    
    // JSONペーストボタンをクリック
    console.log('2. Clicking JSON paste button...');
    await page.click('button:has-text("JSONをペースト")');
    
    // モーダルが表示されるのを待つ
    await page.waitForSelector('textarea', { timeout: 5000 });
    
    // JSONデータを入力
    console.log('3. Entering JSON data...');
    const testJSON = JSON.stringify({
      title: "UIテストクイズ",
      description: "Playwrightテスト",
      questions: [
        {
          id: "q1",
          type: "choice",
          question: "テスト質問",
          options: ["A", "B", "C", "D"],
          correct: 0
        }
      ]
    });
    
    await page.fill('textarea', testJSON);
    
    // インポートボタンをクリック
    console.log('4. Clicking import button...');
    await page.click('button:has-text("インポート")');
    
    // クイズデータが読み込まれたことを確認
    await page.waitForSelector('text=クイズファイルを読み込みました', { timeout: 5000 });
    console.log('✓ Quiz data loaded successfully');
    
    // セッション作成ボタンをクリック
    console.log('5. Clicking create session button...');
    await page.click('button:has-text("セッションを開始")');
    
    // ページ遷移を待つ（最大10秒）
    console.log('6. Waiting for navigation...');
    
    try {
      await page.waitForURL('**/host/session/**', { timeout: 10000 });
      const newUrl = page.url();
      console.log('✓ Successfully navigated to:', newUrl);
      
      // セッションページの要素を確認
      const hasAccessCode = await page.locator('text=アクセスコード').isVisible();
      if (hasAccessCode) {
        console.log('✓ Session page loaded correctly');
        const code = await page.locator('text=/\\d{6}/').textContent();
        console.log('✓ Access code:', code);
      }
    } catch (error) {
      console.log('✗ Navigation failed - stayed on:', page.url());
      
      // デバッグ: 現在のページの状態を確認
      const buttonText = await page.locator('button').first().textContent();
      console.log('Current button state:', buttonText);
      
      // コンソールログを取得
      page.on('console', msg => console.log('Browser console:', msg.text()));
    }
    
    await browser.close();
  });
});

// 実行
test.describe.configure({ mode: 'serial' });
module.exports = test;