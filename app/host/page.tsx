'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, FileJson, CheckCircle, PlusCircle, Clipboard, X } from 'lucide-react';
import { QuizData } from '@/lib/types';
import { generateSessionCode } from '@/lib/utils';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

export default function HostPage() {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [timeLimit, setTimeLimit] = useState(300); // 5分がデフォルト
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setQuizData(data);
      } catch (error) {
        alert('JSONファイルの解析に失敗しました。ファイル形式を確認してください。');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const handleJSONPaste = () => {
    setJsonError('');
    if (!jsonInput.trim()) {
      setJsonError('JSONを入力してください');
      return;
    }
    
    try {
      const data = JSON.parse(jsonInput);
      console.log('Parsed quiz data:', data);
      setQuizData(data);
      setShowJsonModal(false);
      setJsonInput('');
    } catch (error) {
      console.error('JSON parse error:', error);
      setJsonError('JSONの形式が正しくありません。確認してください。');
    }
  };

  const openJSONModal = () => {
    setShowJsonModal(true);
    setJsonInput('');
    setJsonError('');
  };

  const closeJSONModal = () => {
    setShowJsonModal(false);
    setJsonInput('');
    setJsonError('');
  };

  const createSession = async () => {
    if (!quizData) {
      console.error('No quiz data available');
      return;
    }
    
    console.log('Creating session with quiz data:', quizData);
    setIsCreating(true);
    try {
      const sessionCode = generateSessionCode();
      const sessionId = `session_${Date.now()}`;
      
      const sessionData = {
        id: sessionId,
        code: sessionCode,
        hostId: `host_${Date.now()}`, // 実際はFirebase Authから取得
        quizData: {
          ...quizData,
          timeLimit: timeLimit
        },
        status: 'waiting',
        createdAt: Date.now(),
      };

      console.log('Session data to save:', sessionData);

      // Firebaseに保存
      await set(ref(database, `sessions/${sessionId}`), sessionData);
      console.log('Session saved to Firebase');
      
      await set(ref(database, `sessionCodes/${sessionCode}`), sessionId);
      console.log('Session code saved to Firebase');
      
      // セッション画面へ遷移
      const targetPath = `/host/session/${sessionId}`;
      console.log('Navigating to session:', targetPath);
      
      // 遷移前にstateをクリア
      setIsCreating(false);
      
      // Next.jsのルーターを使用
      console.log('About to navigate with Next.js router...');
      
      // router.pushを使用（Next.js 15の推奨方法）
      await router.push(targetPath);
      console.log('Navigation should have completed');
    } catch (error) {
      console.error('Failed to create session:', error);
      console.error('Error details:', {
        error,
        stack: error instanceof Error ? error.stack : 'No stack',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      alert(`セッションの作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCreating(false);
    } finally {
      console.log('CreateSession function completed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              クイズセッションを作成
            </h1>
            <Link href="/host/create">
              <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center">
                <PlusCircle className="w-5 h-5 mr-2" />
                新規作成（GUI）
              </button>
            </Link>
          </div>

          {!quizData ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                クイズファイルをアップロード
              </h2>
              <p className="text-gray-500 mb-4">
                JSONファイルをドラッグ&ドロップまたは選択してください
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <div className="flex gap-3 justify-center">
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                >
                  ファイルを選択
                </label>
                <button
                  onClick={openJSONModal}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  JSONをペースト
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  クイズファイルを読み込みました
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <FileJson className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    タイトル: {quizData.title}
                  </span>
                </div>
                {quizData.description && (
                  <div className="text-gray-600">
                    説明: {quizData.description}
                  </div>
                )}
                <div className="text-gray-700">
                  問題数: {quizData.questions.length}問
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  制限時間（秒）
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={60}
                  max={3600}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log('Button clicked!');
                    createSession();
                  }}
                  disabled={isCreating}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'セッション作成中...' : 'セッションを開始'}
                </button>
                <button
                  onClick={() => setQuizData(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              サンプルJSONフォーマット
            </h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "title": "営業研修Day1",
  "description": "営業基礎知識の確認",
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "顧客満足度を向上させるために最も重要な要素は？",
      "options": [
        "価格を下げる",
        "品質を上げる",
        "顧客の声を聞く",
        "広告を増やす"
      ],
      "correct": 2
    },
    {
      "id": "q2",
      "type": "text",
      "question": "PDCA サイクルの4つのステップを順番に記述してください",
      "correct": "Plan Do Check Act"
    }
  ]
}`}</pre>
          </div>
        </div>
      </div>

      {/* JSON入力モーダル */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  JSONデータを貼り付け
                </h2>
                <button
                  onClick={closeJSONModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSONデータ
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder={`{
  "title": "クイズタイトル",
  "description": "説明（オプション）",
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correct": 0
    }
  ]
}`}
                />
              </div>

              {jsonError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {jsonError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeJSONModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleJSONPaste}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  インポート
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}