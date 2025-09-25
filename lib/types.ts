export interface Question {
  id: string;
  type: 'choice' | 'text' | 'multiple';
  question: string;
  options?: string[];
  correct: string | number | number[];
  timeLimit?: number;
  explanation?: string;
}

export interface QuizData {
  title: string;
  description?: string;
  questions: Question[];
  timeLimit: number;
}

export interface Session {
  id: string;
  code: string;
  hostId: string;
  quizData: QuizData;
  status: 'waiting' | 'active' | 'finished';
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface Participant {
  id: string;
  sessionId: string;
  name: string;
  currentQuestion: number;
  answers: Answer[];
  score: number;
  joinedAt: number;
  completedAt?: number;
}

export interface Answer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  answeredAt: number;
}

export interface SessionProgress {
  sessionId: string;
  totalParticipants: number;
  completedParticipants: number;
  averageProgress: number;
  participants: {
    [key: string]: {
      name: string;
      currentQuestion: number;
      totalQuestions: number;
    };
  };
}