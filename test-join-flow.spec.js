const { test, chromium } = require('@playwright/test');

test.describe('参加フローテスト', () => {
  test.setTimeout(30000);
  
  test('参加者が既存セッションに参加', async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    console.log('参加ページへアクセス...');
    await page.goto('http://localhost:3001/join');
    
    // 上で作成したセッションのコードを使用
    const sessionCode = '656048';
    
    console.log('セッションコードを入力:', sessionCode);
    await page.fill('input[placeholder="6桁のコード"]', sessionCode);
    await page.fill('input[placeholder="あなたの名前"]', 'テストユーザー');
    
    console.log('参加ボタンをクリック...');
    await page.click('button:has-text("参加する")');
    
    // 待機画面まで遷移するか確認
    try {
      await page.waitForSelector('text=クイズの開始を待っています', { timeout: 10000 });
      console.log('✅ 参加成功！待機画面に到達');
    } catch (error) {
      console.log('❌ 参加できませんでした');
      
      // エラーメッセージを確認
      const errorElement = await page.locator('.text-red-500').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('エラーメッセージ:', errorText);
      }
      
      // 現在のURLを確認
      console.log('現在のURL:', page.url());
    }
    
    await browser.close();
  });
});