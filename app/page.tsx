'use client';

import Link from 'next/link';
import { Users, BookOpen, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              リアルタイム競争型クイズシステム
            </h1>
            <p className="text-xl text-gray-600">
              楽しく競い合いながら理解度をチェック
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/host">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <BookOpen className="w-10 h-10 text-blue-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">講師として始める</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  クイズを作成してセッションを開始します。参加者の進捗をリアルタイムで確認できます。
                </p>
                <div className="flex items-center text-blue-500 font-medium">
                  セッションを作成 →
                </div>
              </div>
            </Link>

            <Link href="/join">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center mb-4">
                  <Users className="w-10 h-10 text-green-500 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">参加者として参加</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  6桁のアクセスコードを入力してクイズに参加します。他の参加者と競い合いましょう。
                </p>
                <div className="flex items-center text-green-500 font-medium">
                  クイズに参加 →
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">主な機能</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">🎮 ゲーミフィケーション</h4>
                <p className="text-sm text-gray-600">
                  リアルタイムランキングとプログレスバーで競争心を刺激
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">⚡ リアルタイム同期</h4>
                <p className="text-sm text-gray-600">
                  全員の進捗が即座に反映される双方向通信
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">📊 即座のフィードバック</h4>
                <p className="text-sm text-gray-600">
                  結果と分析がすぐに確認できる詳細レポート
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
