'use client';

import Link from 'next/link';
import { Rocket, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-800 mb-3">
                リアルタイム参加型「進捗理解度テスト」
              </h1>
              <p className="text-sm text-slate-500 uppercase tracking-wider">
                Produced by Teleport inc.
              </p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                試験に参加する
              </h2>
              
              <p className="text-slate-600 mb-8 leading-relaxed">
                主催者から共有された<br />
                <span className="font-semibold text-slate-700">6桁のアクセスコード</span>を入力して<br />
                理解度テストに参加してください
              </p>

              <Link href="/join">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium px-10 py-4 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center mx-auto">
                  <FileText className="w-5 h-5 mr-2" />
                  試験会場へ入る
                </button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link href="/host" className="text-xs text-slate-400 hover:text-slate-500 transition-colors">
              管理者ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
