'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Trash2, 
  GripVertical, 
  ChevronUp, 
  ChevronDown,
  Download,
  Upload,
  Play,
  Type,
  CheckSquare,
  Circle,
  Square,
  Clipboard,
  X
} from 'lucide-react';
import { QuizData, Question } from '@/lib/types';
import { generateSessionCode } from '@/lib/utils';
import { database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

type QuestionType = 'single' | 'multiple' | 'text';

interface EditableQuestion extends Omit<Question, 'type' | 'correct'> {
  type: QuestionType;
  options?: string[];
  correct: number | number[] | string;
  isMultiple?: boolean;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [timeLimit, setTimeLimit] = useState(300);
  const [isCreating, setIsCreating] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');

  const addQuestion = (type: QuestionType) => {
    const newQuestion: EditableQuestion = {
      id: `q${Date.now()}`,
      type,
      question: '',
      options: type !== 'text' ? ['', '', '', ''] : undefined,
      correct: type === 'multiple' ? [] : type === 'text' ? '' : 0,
      isMultiple: type === 'multiple'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<EditableQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
    }
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options!.push('');
    }
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options && updated[questionIndex].options!.length > 2) {
      updated[questionIndex].options!.splice(optionIndex, 1);
      // 正解の調整
      if (updated[questionIndex].type === 'single') {
        const correct = updated[questionIndex].correct as number;
        if (correct >= optionIndex && correct > 0) {
          updated[questionIndex].correct = correct - 1;
        }
      } else if (updated[questionIndex].type === 'multiple') {
        const correct = updated[questionIndex].correct as number[];
        updated[questionIndex].correct = correct
          .filter(c => c !== optionIndex)
          .map(c => c > optionIndex ? c - 1 : c);
      }
    }
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === questions.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const exportJSON = () => {
    const quizData: QuizData = {
      title,
      description,
      questions: questions.map(q => {
        if (q.type === 'text') {
          return {
            id: q.id,
            type: 'text',
            question: q.question,
            correct: q.correct as string
          };
        } else {
          return {
            id: q.id,
            type: q.isMultiple ? 'multiple' : 'choice',
            question: q.question,
            options: q.options || [],
            correct: q.correct
          };
        }
      }),
      timeLimit
    };

    const blob = new Blob([JSON.stringify(quizData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processJSONData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString) as QuizData;
      setTitle(data.title);
      setDescription(data.description || '');
      setTimeLimit(data.timeLimit || 300);
      
      const imported: EditableQuestion[] = data.questions.map(q => {
        if (q.type === 'text') {
          return {
            id: q.id,
            type: 'text' as QuestionType,
            question: q.question,
            correct: q.correct as string
          };
        } else if (q.type === 'multiple') {
          return {
            id: q.id,
            type: 'multiple' as QuestionType,
            question: q.question,
            options: q.options,
            correct: Array.isArray(q.correct) ? q.correct : [q.correct as number],
            isMultiple: true
          };
        } else {
          return {
            id: q.id,
            type: 'single' as QuestionType,
            question: q.question,
            options: q.options,
            correct: q.correct as number,
            isMultiple: false
          };
        }
      });
      
      setQuestions(imported);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!processJSONData(result)) {
        alert('JSONファイルの読み込みに失敗しました');
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
    
    if (processJSONData(jsonInput)) {
      setShowJsonModal(false);
      setJsonInput('');
    } else {
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


  const startSession = async () => {
    if (!title || questions.length === 0) {
      alert('タイトルと問題を入力してください');
      return;
    }

    const validQuestions = questions.every(q => {
      if (!q.question) return false;
      if (q.type === 'text') return true;
      if (!q.options || q.options.some(o => !o)) return false;
      return true;
    });

    if (!validQuestions) {
      alert('すべての問題と選択肢を入力してください');
      return;
    }

    setIsCreating(true);
    try {
      const sessionCode = generateSessionCode();
      const sessionId = `session_${Date.now()}`;
      
      const quizData: QuizData = {
        title,
        description,
        questions: questions.map(q => {
          if (q.type === 'text') {
            return {
              id: q.id,
              type: 'text',
              question: q.question,
              correct: q.correct as string
            };
          } else {
            return {
              id: q.id,
              type: q.isMultiple ? 'multiple' : 'choice',
              question: q.question,
              options: q.options || [],
              correct: q.correct
            };
          }
        }),
        timeLimit
      };

      const sessionData = {
        id: sessionId,
        code: sessionCode,
        hostId: `host_${Date.now()}`,
        quizData,
        status: 'waiting',
        createdAt: Date.now(),
      };

      await set(ref(database, `sessions/${sessionId}`), sessionData);
      await set(ref(database, `sessionCodes/${sessionCode}`), sessionId);
      
      router.push(`/host/session/${sessionId}`);
    } catch (error) {
      alert('セッションの作成に失敗しました');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              クイズを作成
            </h1>
            <p className="text-gray-600">
              問題を追加してクイズセッションを作成しましょう
            </p>
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  クイズタイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：営業研修Day1 - 基礎知識確認"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="例：営業活動における基本的な知識と考え方を確認します"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div>
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
            </div>
          </div>

          {/* 問題リスト */}
          <div className="space-y-4 mb-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-bold text-gray-900">
                      問題 {qIndex + 1}
                    </span>
                    {question.type === 'single' && (
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        単一選択
                      </span>
                    )}
                    {question.type === 'multiple' && (
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        複数選択
                      </span>
                    )}
                    {question.type === 'text' && (
                      <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        記述式
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveQuestion(qIndex, 'up')}
                      disabled={qIndex === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => moveQuestion(qIndex, 'down')}
                      disabled={qIndex === questions.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                    placeholder="問題文を入力してください"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {question.type === 'text' ? (
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">
                        正解の例（採点には使用されません）
                      </label>
                      <input
                        type="text"
                        value={question.correct as string}
                        onChange={(e) => updateQuestion(qIndex, { correct: e.target.value })}
                        placeholder="正解例を入力"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {question.options?.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (question.type === 'single') {
                                updateQuestion(qIndex, { correct: oIndex });
                              } else {
                                const current = question.correct as number[];
                                const updated = current.includes(oIndex)
                                  ? current.filter(i => i !== oIndex)
                                  : [...current, oIndex];
                                updateQuestion(qIndex, { correct: updated });
                              }
                            }}
                            className="flex-shrink-0"
                          >
                            {question.type === 'single' ? (
                              <Circle 
                                className={`w-5 h-5 ${
                                  question.correct === oIndex 
                                    ? 'text-green-500 fill-green-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            ) : (
                              <Square 
                                className={`w-5 h-5 ${
                                  (question.correct as number[]).includes(oIndex)
                                    ? 'text-green-500 fill-green-500' 
                                    : 'text-gray-400'
                                }`} 
                              />
                            )}
                          </button>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`選択肢 ${String.fromCharCode(65 + oIndex)}`}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {question.options!.length > 2 && (
                            <button
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(qIndex)}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        + 選択肢を追加
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 問題追加ボタン */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">問題を追加</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => addQuestion('single')}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Circle className="w-8 h-8 text-blue-500 mb-2" />
                <span className="font-medium">単一選択</span>
                <span className="text-xs text-gray-500">1つだけ選択</span>
              </button>
              <button
                onClick={() => addQuestion('multiple')}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <CheckSquare className="w-8 h-8 text-green-500 mb-2" />
                <span className="font-medium">複数選択</span>
                <span className="text-xs text-gray-500">複数選択可</span>
              </button>
              <button
                onClick={() => addQuestion('text')}
                className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Type className="w-8 h-8 text-purple-500 mb-2" />
                <span className="font-medium">記述式</span>
                <span className="text-xs text-gray-500">自由記述</span>
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={startSession}
                disabled={isCreating || !title || questions.length === 0}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                {isCreating ? 'セッション作成中...' : 'セッションを開始'}
              </button>
              
              <button
                onClick={exportJSON}
                disabled={questions.length === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
              >
                <Download className="w-5 h-5 mr-2" />
                JSONエクスポート
              </button>
              
              <label className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
                JSONインポート
                <input
                  type="file"
                  accept=".json"
                  onChange={importJSON}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={openJSONModal}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Clipboard className="w-5 h-5 mr-2" />
                JSONペースト
              </button>
              
              <Link href="/host">
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  キャンセル
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* JSONペーストモーダル */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">JSONをペースト</h2>
              <button
                onClick={closeJSONModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  JSONフォーマットのクイズデータをペーストしてください。
                </p>
                <details className="text-sm text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">JSONフォーマット例を見る</summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded-lg overflow-x-auto text-xs">
{`{
  "title": "クイズタイトル",
  "description": "説明（任意）",
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "単一選択の問題",
      "options": ["選択肢1", "選択肢2", "選択肢3"],
      "correct": 0
    },
    {
      "id": "q2",
      "type": "multiple",
      "question": "複数選択の問題",
      "options": ["選択肢A", "選択肢B", "選択肢C"],
      "correct": [0, 2]
    },
    {
      "id": "q3",
      "type": "text",
      "question": "記述式の問題",
      "correct": "正解の例"
    }
  ],
  "timeLimit": 300
}`}</pre>
                </details>
              </div>
              
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="JSONをここにペーストしてください..."
                className="w-full h-80 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              
              {jsonError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{jsonError}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={closeJSONModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleJSONPaste}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                インポート
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}