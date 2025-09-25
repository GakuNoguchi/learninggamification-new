const { test, chromium } = require('@playwright/test');

test.describe('基本ワークフローテスト', () => {
  
  test('ホストと参加者の基本フロー', async () => {
    const browser = await chromium.launch({ headless: true });
    
    console.log('\n=== 基本ワークフローテスト開始 ===\n');
    
    // 1. ホストがセッションを作成
    console.log('1. ホスト: セッション作成');
    const hostPage = await browser.newPage();
    await hostPage.goto('http://localhost:3001/host');
    
    // JSONペーストでクイズをインポート
    await hostPage.click('button:has-text("JSONをペースト")');
    await hostPage.waitForSelector('textarea');
    
    const testQuiz = JSON.stringify({
      title: "シンプルテストクイズ",
      questions: [
        {
          id: "q1",
          type: "choice",
          question: "1 + 1 = ?",
          options: ["1", "2", "3", "4"],
          correct: 1
        },
        {
          id: "q2",
          type: "text",
          question: "日本の首都は？",
          correct: "東京"
        }
      ]
    });
    
    await hostPage.fill('textarea', testQuiz);
    await hostPage.click('button:has-text("インポート")');
    console.log('  ✓ クイズデータをインポート');
    
    // セッション作成
    await hostPage.waitForSelector('text=クイズファイルを読み込みました');
    await hostPage.click('button:has-text("セッションを開始")');
    
    // セッション画面へ遷移を待つ
    await hostPage.waitForURL('**/host/session/**', { timeout: 10000 });
    const sessionUrl = hostPage.url();
    console.log('  ✓ セッション作成成功:', sessionUrl);
    
    // アクセスコードを取得
    await hostPage.waitForSelector('.text-4xl.font-mono');
    const codeElement = await hostPage.locator('.text-4xl.font-mono').first();
    const sessionCode = await codeElement.textContent();
    console.log('  ✓ アクセスコード:', sessionCode);
    
    // 2. 参加者が参加
    console.log('\n2. 参加者: セッションに参加');
    const participantPage = await browser.newPage();
    await participantPage.goto('http://localhost:3001/join');
    
    await participantPage.fill('input[placeholder="6桁のコード"]', sessionCode);
    await participantPage.fill('input[placeholder="あなたの名前"]', 'テスト参加者');
    await participantPage.click('button:has-text("参加する")');
    
    // 待機画面を確認
    await participantPage.waitForSelector('text=クイズの開始を待っています', { timeout: 5000 });
    console.log('  ✓ 参加者が待機中');
    
    // ホスト側で参加者を確認
    await hostPage.waitForSelector('text=テスト参加者', { timeout: 5000 });
    console.log('  ✓ ホスト側で参加者を確認');
    
    // 3. クイズを開始
    console.log('\n3. クイズ開始');
    await hostPage.click('button:has-text("クイズを開始")');
    console.log('  ✓ ホストがクイズを開始');
    
    // 参加者側で問題が表示されるのを待つ
    await participantPage.waitForSelector('text=問題 1', { timeout: 5000 });
    console.log('  ✓ 参加者に問題が表示');
    
    // 問題1に回答
    await participantPage.click('button:has-text("2")');
    await participantPage.click('button:has-text("次へ")');
    console.log('  ✓ 問題1に回答');
    
    // 問題2に回答
    await participantPage.waitForSelector('input[type="text"]');
    await participantPage.fill('input[type="text"]', '東京');
    await participantPage.click('button:has-text("送信")');
    console.log('  ✓ 問題2に回答');
    
    // 完了画面
    await participantPage.waitForSelector('text=クイズ完了', { timeout: 5000 });
    console.log('  ✓ クイズ完了');
    
    // 4. セッション終了
    console.log('\n4. セッション終了');
    await hostPage.click('button:has-text("セッション終了")');
    
    // 結果画面へ遷移
    await hostPage.waitForURL('**/host/result/**', { timeout: 5000 });
    console.log('  ✓ 結果画面へ遷移');
    
    // 結果を確認
    const hasResults = await hostPage.locator('text=クイズ結果').isVisible();
    if (hasResults) {
      console.log('  ✓ 結果表示成功');
      
      // スコアを確認
      const score = await hostPage.locator('text=/\\d+点/').first();
      if (score) {
        const scoreText = await score.textContent();
        console.log('  ✓ スコア:', scoreText);
      }
    }
    
    console.log('\n=== テスト完了 ===');
    console.log('全ての基本機能が正常に動作しています！\n');
    
    await browser.close();
  });
});