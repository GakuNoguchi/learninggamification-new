'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Play, StopCircle, Copy, CheckCircle } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { Session, Participant } from '@/lib/types';

export default function SessionMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // セッション情報の監視
    const sessionRef = ref(database, `sessions/${sessionId}`);
    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSession(data);
      }
    });

    // 参加者情報の監視
    const participantsRef = ref(database, `participants/${sessionId}`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantList = Object.values(data) as Participant[];
        setParticipants(participantList);
      }
    });

    return () => {
      unsubscribeSession();
      unsubscribeParticipants();
    };
  }, [sessionId]);

  const startSession = async () => {
    await update(ref(database, `sessions/${sessionId}`), {
      status: 'active',
      startedAt: Date.now(),
    });
  };

  const endSession = async () => {
    await update(ref(database, `sessions/${sessionId}`), {
      status: 'finished',
      finishedAt: Date.now(),
    });
    router.push(`/host/result/${sessionId}`);
  };

  const copyCode = () => {
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProgress = (participant: Participant) => {
    if (!session) return 0;
    return Math.round(
      (participant.currentQuestion / session.quizData.questions.length) * 100
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">セッション情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {session.quizData.title}
              </h1>
              {session.status === 'active' && (
                <button
                  onClick={endSession}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  セッション終了
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">アクセスコード</p>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-blue-500 mr-2">
                    {session.code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">参加者数</p>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">
                    {participants.length}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ステータス</p>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    session.status === 'waiting'
                      ? 'bg-yellow-100 text-yellow-700'
                      : session.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {session.status === 'waiting'
                    ? '待機中'
                    : session.status === 'active'
                    ? '進行中'
                    : '終了'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">完了率</p>
                <span className="text-2xl font-bold text-gray-900">
                  {participants.length > 0
                    ? Math.round(
                        participants.filter((p) => p.completedAt).length /
                          participants.length *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>

            {session.status === 'waiting' && (
              <button
                onClick={startSession}
                className="w-full mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                セッションを開始
              </button>
            )}
          </div>

          {/* 参加者リスト */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              参加者の進捗状況
            </h2>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>まだ参加者がいません</p>
                <p className="text-sm mt-2">
                  アクセスコード「{session.code}」を共有してください
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {participant.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {participant.currentQuestion} /{' '}
                        {session.quizData.questions.length} 問
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(participant)}%` }}
                      />
                    </div>
                    {participant.completedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ 完了（スコア: {participant.score}点）
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}