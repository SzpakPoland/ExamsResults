export interface ExamResult {
  id: number;
  nick: string;
  date?: string;
  attempt?: number; // Changed from string to number
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;
  timestamp: string;
  examType: 'sprawdzanie' | 'ortografia' | 'dokumenty';
  errors?: number;
  bonusPoints?: number;
  notes?: string;
  questionResults?: Array<{
    questionId: number;
    pointsEarned: number;
    passed: boolean;
  }>;
}

export interface Question {
  id: number;
  text: string;
  maxPoints: number;
}

export interface QuestionResult {
  questionId: number;
  passed: boolean;
  pointsEarned: number;
}

export interface SprawdzanieFormData {
  nick: string;
  date: string;
  questionResults: QuestionResult[];
  bonusPoints: number;
  notes: string;
}

export interface OrtografiaFormData {
  nick: string;
  attempt: number;
  percentage: number;
  date: string;
  notes?: string;
}

export interface DokumentyFormData {
  nick: string;
  date: string;
  maxPoints: number;
  achievedPoints: number;
  bonusPoints?: number;
  notes?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type ExamType = 'sprawdzanie' | 'ortografia' | 'dokumenty';

export interface User {
  id: number;
  username: string;
  role: 'superadmin' | 'administrator' | 'cmd' | 'user';
  name: string;
}

export interface UserFormData {
  username: string;
  password: string;
  role: string;
  name: string; // To pole dalej nazywa się 'name' w API, ale w UI pokazuje się jako "Nazwa konta"
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
