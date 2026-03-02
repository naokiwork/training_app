export type LocalSession = {
  id: string;
  date: string;
  notes?: string;
  painFlag: boolean;
  createdAt: number;
  updatedAt: number;
};

export type LocalSessionExercise = {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type LocalSet = {
  id: string;
  sessionExerciseId: string;
  setOrder: number;
  reps: number;
  weightKg?: number;
  rpe?: number;
  restSeconds?: number;
  formQualityFlag: boolean;
  createdAt: number;
  updatedAt: number;
};

export type LocalExerciseCache = {
  id: string;
  name: string;
  category?: string;
  updatedAt: number;
};

export type LocalSessionSetInput = {
  reps: number;
  weightKg?: number;
  rpe?: number;
  restSeconds?: number;
  formQualityFlag?: boolean;
};

export type LocalSessionExerciseInput = {
  exerciseId: string;
  sets: LocalSessionSetInput[];
};

export type UpsertLocalSessionInput = {
  id?: string;
  date: string;
  notes?: string;
  painFlag?: boolean;
  exercises: LocalSessionExerciseInput[];
};

export type LocalSessionDetail = {
  id: string;
  date: string;
  notes?: string;
  painFlag: boolean;
  createdAt: number;
  updatedAt: number;
  exercises: Array<{
    id: string;
    exerciseId: string;
    exerciseName: string;
    category?: string;
    exerciseOrder: number;
    sets: Array<{
      id: string;
      setOrder: number;
      reps: number;
      weightKg?: number;
      rpe?: number;
      restSeconds?: number;
      formQualityFlag: boolean;
    }>;
  }>;
};
