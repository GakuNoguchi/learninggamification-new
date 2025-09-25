'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, User } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ローカルストレージから名前を復元
    const savedName = localStorage.getItem('participantName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  const joinSession = async () => {
    if (code.length !== 6) {
      setError('6桁のコードを入力してください');
      return;
    }

    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // コードからセッションIDを取得
      const codeRef = ref(database, `sessionCodes/${code}`);
      const codeSnapshot = await get(codeRef);
      
      if (!codeSnapshot.exists()) {
        setError('無効なアクセスコードです');
        setIsJoining(false);
        return;
      }

      const sessionId = codeSnapshot.val();
      
      // セッション情報を取得
      const sessionRef = ref(database, `sessions/${sessionId}`);
      const sessionSnapshot = await get(sessionRef);
      
      if (!sessionSnapshot.exists()) {
        setError('セッションが見つかりません');
        setIsJoining(false);
        return;
      }

      const session = sessionSnapshot.val();
      
      if (session.status === 'finished') {
        setError('このセッションは既に終了しています');
        setIsJoining(false);
        return;
      }

      // 参加者情報を作成
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const participantData = {
        id: participantId,
        sessionId: sessionId,
        name: name.trim(),
        currentQuestion: 0,
        answers: [],
        score: 0,
        joinedAt: Date.now(),
      };

      // Firebaseに参加者情報を保存
      await set(ref(database, `participants/${sessionId}/${participantId}`), participantData);
      
      // 名前をローカルストレージに保存
      localStorage.setItem('participantName', name.trim());
      localStorage.setItem('participantId', participantId);
      localStorage.setItem('sessionId', sessionId);

      // クイズ画面へ遷移
      router.push(`/join/quiz/${sessionId}`);
    } catch (error) {
      console.error(error);
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                クイズに参加
              </h1>
              <p className="text-gray-600">
                アクセスコードを入力して参加しましょう
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                joinSession();
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  アクセスコード（6桁）
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 text-2xl text-center font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  お名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="田中太郎"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isJoining || code.length !== 6 || !name.trim()}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
              >
                {isJoining ? '参加中...' : '参加する'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                講師から共有された6桁のコードを入力してください
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}