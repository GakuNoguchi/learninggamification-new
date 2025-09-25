const { test, chromium } = require('@playwright/test');

test.describe('クイックデモ', () => {
  test.setTimeout(60000);
  
  test('基本機能のデモンストレーション', async () => {
    const browser = await chromium.launch({ headless: false }); // ブラウザを表示
    
    console.log('\n🎮 クイズシステム デモンストレーション 🎮\n');
    console.log('=======================================\n');
    
    // 1. ホストがセッションを作成
    console.log('👨‍💼 ホスト: セッションを作成中...');
    const hostPage = await browser.newPage();
    await hostPage.goto('http://localhost:3001/host');
    
    // JSONペーストでクイズを読み込み
    await hostPage.click('button:has-text("JSONをペースト")');
    await hostPage.waitForSelector('textarea');
    
    const demoQuiz = JSON.stringify({
      title: "🎉 クイックデモクイズ",
      questions: [
        {
          id: "q1",
          type: "choice",
          question: "2 + 2 = ?",
          options: ["3", "4", "5", "6"],
          correct: 1
        },
        {
          id: "q2",
          type: "text",
          question: "Helloを日本語で？",
          correct: "こんにちは"
        }
      ]
    });
    
    await hostPage.fill('textarea', demoQuiz);
    await hostPage.click('button:has-text("インポート")');
    console.log('  ✅ クイズデータをインポート');
    
    await hostPage.waitForSelector('text=クイズファイルを読み込みました');
    await hostPage.click('button:has-text("セッションを開始")');
    
    await hostPage.waitForURL('**/host/session/**', { timeout: 10000 });
    console.log('  ✅ セッション作成成功\n');
    
    // アクセスコードを取得
    await hostPage.waitForSelector('text=アクセスコード');
    const pageContent = await hostPage.content();
    const codeMatch = pageContent.match(/>([0-9]{6})</); 
    const sessionCode = codeMatch[1];
    console.log('🔢 アクセスコード: ' + sessionCode);
    console.log('=======================================\n');
    
    // 2. 参加者が参加
    console.log('👥 参加者: セッションに参加中...');
    const participantPage = await browser.newPage();
    await participantPage.goto('http://localhost:3001/join');
    
    await participantPage.fill('input[placeholder="6桁のコード"]', sessionCode);
    await participantPage.fill('input[placeholder="あなたの名前"]', 'テスト太郎');
    await participantPage.click('button:has-text("参加する")');
    
    await participantPage.waitForSelector('text=クイズの開始を待っています');
    console.log('  ✅ 参加成功！待機中...');
    
    // ホスト側で参加者を確認
    await hostPage.waitForSelector('text=テスト太郎');
    console.log('  ✅ ホストが参加者を確認\n');
    
    // 3. クイズ開始
    console.log('🎯 クイズ開始！');
    await hostPage.click('button:has-text("クイズを開始")');
    
    // 参加者が問題に回答
    await participantPage.waitForSelector('text=問題 1', { timeout: 5000 });
    console.log('  📝 問題1: 2 + 2 = ?');
    
    await participantPage.click('button:has-text("4")');
    await participantPage.click('button:has-text("次へ")');
    console.log('    → 回答: 4 ✅');
    
    await participantPage.waitForSelector('text=問題 2');
    console.log('  📝 問題2: Helloを日本語で？');
    
    await participantPage.fill('input[type="text"]', 'こんにちは');
    await participantPage.click('button:has-text("送信")');
    console.log('    → 回答: こんにちは ✅');
    
    // 完了
    await participantPage.waitForSelector('text=クイズ完了', { timeout: 5000 });
    console.log('\n🏆 クイズ完了！');
    
    // 4. 結果確認
    await hostPage.click('button:has-text("セッション終了")');
    await hostPage.waitForURL('**/host/result/**');
    console.log('📊 結果画面へ移動');
    
    // サマリー
    console.log('\n=======================================');
    console.log('🎆 デモンストレーション完了！');
    console.log('=======================================\n');
    console.log('✨ 確認できた機能:');
    console.log('  • JSONペーストでのクイズインポート');
    console.log('  • セッション作成とアクセスコード');
    console.log('  • 参加者のセッション参加');
    console.log('  • リアルタイム同期');
    console.log('  • クイズの実施と回答');
    console.log('  • 結果表示\n');
    
    // 3秒待ってからブラウザを閉じる
    await new Promise(r => setTimeout(r, 3000));
    await browser.close();
  });
});