'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, PieChart, Download, Home, Users, Target } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Session, Participant, Question } from '@/lib/types';

interface QuestionStats {
  question: Question;
  correctCount: number;
  incorrectCount: number;
  answerDistribution: { [key: string]: number };
}

export default function HostResultPage() {
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        // セッション情報を取得
        const sessionSnapshot = await get(ref(database, `sessions/${sessionId}`));
        if (!sessionSnapshot.exists()) return;
        
        const sessionData = sessionSnapshot.val() as Session;
        setSession(sessionData);

        // 参加者情報を取得
        const participantsSnapshot = await get(ref(database, `participants/${sessionId}`));
        if (!participantsSnapshot.exists()) return;
        
        const participantsData = Object.values(participantsSnapshot.val()) as Participant[];
        participantsData.sort((a, b) => b.score - a.score);
        setParticipants(participantsData);

        // 問題ごとの統計を計算
        const stats: QuestionStats[] = sessionData.quizData.questions.map((question) => {
          let correctCount = 0;
          let incorrectCount = 0;
          const distribution: { [key: string]: number } = {};

          participantsData.forEach((participant) => {
            const answer = participant.answers?.find(a => a.questionId === question.id);
            if (answer) {
              if (answer.isCorrect) {
                correctCount++;
              } else {
                incorrectCount++;
              }
              
              // 選択肢の分布を記録
              if (question.type === 'choice' && typeof answer.answer === 'number') {
                const optionIndex = answer.answer;
                const optionText = question.options?.[optionIndex] || `選択肢${optionIndex + 1}`;
                distribution[optionText] = (distribution[optionText] || 0) + 1;
              }
            }
          });

          return {
            question,
            correctCount,
            incorrectCount,
            answerDistribution: distribution,
          };
        });

        setQuestionStats(stats);
      } catch (error) {
        console.error(error);
      }
    };

    loadResults();
  }, [sessionId]);

  const downloadCSV = () => {
    if (!session || !participants) return;

    const csv = [
      ['名前', 'スコア', '正答数', '正答率(%)'],
      ...participants.map(p => [
        p.name,
        p.score,
        p.answers?.filter(a => a.isCorrect).length || 0,
        Math.round(((p.answers?.filter(a => a.isCorrect).length || 0) / session.quizData.questions.length) * 100),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `quiz_results_${sessionId}.csv`;
    link.click();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  const averageScore = participants.length > 0
    ? Math.round(participants.reduce((sum, p) => sum + p.score, 0) / participants.length)
    : 0;
  
  const completionRate = participants.length > 0
    ? Math.round((participants.filter(p => p.completedAt).length / participants.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  セッション結果分析
                </h1>
                <p className="text-gray-600 mt-1">
                  {session.quizData.title}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadCSV}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  CSVダウンロード
                </button>
                <Link href="/">
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    トップへ
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <p className="text-sm text-gray-600">参加者数</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {participants.length}
                <span className="text-sm text-gray-500 ml-1">人</span>
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm text-gray-600">完走率</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {completionRate}
                <span className="text-sm text-gray-500 ml-1">%</span>
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
                <p className="text-sm text-gray-600">平均スコア</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {averageScore}
                <span className="text-sm text-gray-500 ml-1">点</span>
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-2">
                <PieChart className="w-5 h-5 text-orange-500 mr-2" />
                <p className="text-sm text-gray-600">最高得点</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {participants[0]?.score || 0}
                <span className="text-sm text-gray-500 ml-1">点</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {participants[0]?.name || '-'}
              </p>
            </div>
          </div>

          {/* 問題ごとの正答率 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              問題ごとの正答率
            </h2>
            <div className="space-y-4">
              {questionStats.map((stat, index) => {
                const correctRate = stat.correctCount + stat.incorrectCount > 0
                  ? Math.round((stat.correctCount / (stat.correctCount + stat.incorrectCount)) * 100)
                  : 0;
                
                return (
                  <div key={stat.question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">
                          問題{index + 1}: {stat.question.question}
                        </p>
                        {stat.question.type === 'choice' && (
                          <p className="text-sm text-green-600">
                            正解: {stat.question.options?.[stat.question.correct as number]}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {correctRate}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {stat.correctCount}/{stat.correctCount + stat.incorrectCount}人正解
                        </p>
                      </div>
                    </div>
                    
                    {/* プログレスバー */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: `${correctRate}%` }}
                      />
                    </div>
                    
                    {/* 選択肢の分布 */}
                    {stat.question.type === 'choice' && Object.keys(stat.answerDistribution).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-semibold text-gray-700 mb-2">回答分布:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(stat.answerDistribution).map(([option, count]) => (
                            <div key={option} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                              <span className="text-sm text-gray-700">{option}:</span>
                              <span className="text-sm font-semibold">{count}人</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 参加者ランキング */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              参加者ランキング
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">順位</th>
                    <th className="text-left py-2 px-4">名前</th>
                    <th className="text-center py-2 px-4">正答数</th>
                    <th className="text-center py-2 px-4">正答率</th>
                    <th className="text-right py-2 px-4">スコア</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant, index) => {
                    const correctCount = participant.answers?.filter(a => a.isCorrect).length || 0;
                    const correctRate = Math.round((correctCount / session.quizData.questions.length) * 100);
                    
                    return (
                      <tr key={participant.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <span className="font-semibold">{index + 1}</span>
                        </td>
                        <td className="py-2 px-4">{participant.name}</td>
                        <td className="text-center py-2 px-4">
                          {correctCount}/{session.quizData.questions.length}
                        </td>
                        <td className="text-center py-2 px-4">{correctRate}%</td>
                        <td className="text-right py-2 px-4 font-bold">
                          {participant.score}点
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}