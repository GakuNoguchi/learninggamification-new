'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Medal, Award, Download, Home } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Session, Participant } from '@/lib/types';

export default function ParticipantResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [rank, setRank] = useState(0);

  useEffect(() => {
    const loadResults = async () => {
      const participantId = localStorage.getItem('participantId');
      if (!participantId) return;

      try {
        // セッション情報を取得
        const sessionSnapshot = await get(ref(database, `sessions/${sessionId}`));
        if (sessionSnapshot.exists()) {
          setSession(sessionSnapshot.val());
        }

        // 全参加者情報を取得
        const participantsSnapshot = await get(ref(database, `participants/${sessionId}`));
        if (participantsSnapshot.exists()) {
          const participantsData = Object.values(participantsSnapshot.val()) as Participant[];
          
          // スコアでソート
          participantsData.sort((a, b) => b.score - a.score);
          setAllParticipants(participantsData);
          
          // 現在の参加者を特定
          const current = participantsData.find(p => p.id === participantId);
          if (current) {
            setCurrentParticipant(current);
            // ランキングを計算
            const currentRank = participantsData.findIndex(p => p.id === participantId) + 1;
            setRank(currentRank);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadResults();
  }, [sessionId]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-gray-600 font-bold">{position}</span>;
    }
  };

  const downloadPDF = () => {
    // 簡易的なPDFダウンロード（実際はブラウザの印刷機能を使用）
    window.print();
  };

  if (!session || !currentParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  const correctRate = Math.round(
    (currentParticipant.answers.filter(a => a.isCorrect).length / 
    session.quizData.questions.length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* 結果サマリー */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              {rank === 1 && (
                <div className="inline-block animate-bounce mb-4">
                  <Trophy className="w-20 h-20 text-yellow-500" />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                クイズ完了！
              </h1>
              <p className="text-xl text-gray-600">
                お疲れさまでした、{currentParticipant.name}さん
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">スコア</p>
                <p className="text-3xl font-bold text-purple-600">
                  {currentParticipant.score}
                </p>
                <p className="text-sm text-gray-500">ポイント</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">正答率</p>
                <p className="text-3xl font-bold text-green-600">
                  {correctRate}%
                </p>
                <p className="text-sm text-gray-500">
                  {currentParticipant.answers.filter(a => a.isCorrect).length}/{session.quizData.questions.length}問正解
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">順位</p>
                <div className="flex items-center justify-center">
                  {getRankIcon(rank)}
                  <p className="text-3xl font-bold text-gray-900 ml-2">
                    {rank}位
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {allParticipants.length}人中
                </p>
              </div>
            </div>

            {rank === 1 && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-orange-800">
                  🎉 優勝おめでとうございます！ 🎉
                </p>
              </div>
            )}
          </div>

          {/* ランキング */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              最終ランキング
            </h2>
            <div className="space-y-3">
              {allParticipants.slice(0, 10).map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    participant.id === currentParticipant.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-4 w-8">
                      {getRankIcon(index + 1)}
                    </div>
                    <span className={`font-semibold ${
                      participant.id === currentParticipant.id
                        ? 'text-purple-700'
                        : 'text-gray-900'
                    }`}>
                      {participant.name}
                      {participant.id === currentParticipant.id && ' (あなた)'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-4">
                      {participant.answers.filter(a => a.isCorrect).length}/{session.quizData.questions.length}問正解
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {participant.score}pt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4">
            <button
              onClick={downloadPDF}
              className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              結果をダウンロード
            </button>
            <Link href="/" className="flex-1">
              <button className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
                <Home className="w-5 h-5 mr-2" />
                トップへ戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}