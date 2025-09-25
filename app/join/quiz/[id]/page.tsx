'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Users, ChevronRight } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';
import { Session, Participant, Question } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [otherParticipants, setOtherParticipants] = useState<Participant[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaiting, setShowWaiting] = useState(true);

  // 参加者情報の取得
  useEffect(() => {
    const participantId = localStorage.getItem('participantId');
    const storedSessionId = localStorage.getItem('sessionId');
    
    if (!participantId || storedSessionId !== sessionId) {
      router.push('/join');
      return;
    }

    // セッション情報の監視
    const sessionRef = ref(database, `sessions/${sessionId}`);
    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSession(data);
        
        // セッションが開始されたら待機画面を非表示
        if (data.status === 'active') {
          setShowWaiting(false);
          if (data.quizData.timeLimit) {
            setTimeLeft(data.quizData.timeLimit);
          }
        }
        
        // セッションが終了したら結果画面へ
        if (data.status === 'finished') {
          router.push(`/join/result/${sessionId}`);
        }
      }
    });

    // 自分の情報を監視
    const myParticipantRef = ref(database, `participants/${sessionId}/${participantId}`);
    const unsubscribeMyParticipant = onValue(myParticipantRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentParticipant(data);
        // 現在の問題を設定
        if (session?.quizData.questions[data.currentQuestion]) {
          setCurrentQuestion(session.quizData.questions[data.currentQuestion]);
        }
      }
    });

    // 他の参加者情報の監視
    const participantsRef = ref(database, `participants/${sessionId}`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allParticipants = Object.values(data) as Participant[];
        const others = allParticipants.filter(p => p.id !== participantId);
        setOtherParticipants(others);
      }
    });

    return () => {
      unsubscribeSession();
      unsubscribeMyParticipant();
      unsubscribeParticipants();
    };
  }, [sessionId, router, session]);

  // タイマー処理
  useEffect(() => {
    if (!showWaiting && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 時間切れの場合、自動的に次の問題へ
            submitAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showWaiting, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitAnswer = async (isTimeout = false) => {
    if (!currentParticipant || !currentQuestion || !session) return;
    
    if (!isTimeout && !selectedAnswer && selectedAnswer !== 0) {
      alert('回答を選択してください');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const participantId = currentParticipant.id;
      const isCorrect = currentQuestion.type === 'choice'
        ? selectedAnswer === currentQuestion.correct
        : selectedAnswer === currentQuestion.correct;

      const newAnswer = {
        questionId: currentQuestion.id,
        answer: isTimeout ? '' : selectedAnswer,
        isCorrect: isTimeout ? false : isCorrect,
        answeredAt: Date.now(),
      };

      const updatedAnswers = [...(currentParticipant.answers || []), newAnswer];
      const newScore = updatedAnswers.filter(a => a.isCorrect).length * 10;
      const nextQuestionIndex = currentParticipant.currentQuestion + 1;
      const isCompleted = nextQuestionIndex >= session.quizData.questions.length;

      // 参加者情報を更新
      const updates: Record<string, unknown> = {
        [`participants/${sessionId}/${participantId}/answers`]: updatedAnswers,
        [`participants/${sessionId}/${participantId}/score`]: newScore,
        [`participants/${sessionId}/${participantId}/currentQuestion`]: nextQuestionIndex,
      };

      if (isCompleted) {
        updates[`participants/${sessionId}/${participantId}/completedAt`] = Date.now();
      }

      await update(ref(database), updates);

      // リセット
      setSelectedAnswer('');
      
      if (isCompleted) {
        // 完了画面へ
        router.push(`/join/result/${sessionId}`);
      } else {
        // 次の問題へ
        setCurrentQuestion(session.quizData.questions[nextQuestionIndex]);
        if (session.quizData.timeLimit) {
          setTimeLeft(session.quizData.timeLimit);
        }
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 待機画面
  if (showWaiting || !session || session.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Clock className="w-16 h-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            まもなく開始します
          </h2>
          <p className="text-gray-600">
            講師がセッションを開始するまでお待ちください
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !currentParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">問題</span>
                <span className="text-xl font-bold text-gray-900">
                  {currentParticipant.currentQuestion + 1} / {session.quizData.questions.length}
                </span>
              </div>
              <div className="flex items-center text-red-500">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-xl font-bold font-mono">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentParticipant.currentQuestion + 1) / session.quizData.questions.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* 問題 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === 'choice' ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedAnswer === index
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold text-gray-600 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-900">{option}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="回答を入力してください"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            )}

            <button
              onClick={() => submitAnswer()}
              disabled={isSubmitting || (!selectedAnswer && selectedAnswer !== 0)}
              className="w-full mt-6 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                '送信中...'
              ) : (
                <>
                  次へ進む
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* 他の参加者の進捗 */}
          {otherParticipants.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  みんなの進捗
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {otherParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    <span className="font-medium">{participant.name}</span>
                    <span className="text-gray-600 ml-1">
                      ({participant.currentQuestion + 1}問目)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}