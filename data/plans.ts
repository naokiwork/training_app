export type PlanItem = {
  exerciseName: string;
  sets: number;
  repRange: string;
};

export type PlanDay = {
  day: string;
  focus: string;
  items: PlanItem[];
};

export type Plan = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  weeklyStructure: string;
  progressionRule: string;
  days: PlanDay[];
};

export const plans: Plan[] = [
  {
    id: "beginner-fullbody",
    title: "Beginner Full Body",
    level: "Beginner",
    summary: "3 days per week. Learn movement quality and consistency.",
    weeklyStructure: "A / B / A (next week B / A / B)",
    progressionRule:
      "When all sets hit the top of range with good form, add 1-2 reps next week or move to a harder variation.",
    days: [
      {
        day: "Day A",
        focus: "Push + Pull + Legs + Core",
        items: [
          { exerciseName: "Incline Push-up", sets: 3, repRange: "8-12" },
          { exerciseName: "Inverted Row", sets: 3, repRange: "8-12" },
          { exerciseName: "Bodyweight Squat", sets: 3, repRange: "12-15" },
          { exerciseName: "Plank", sets: 3, repRange: "30-45 sec" },
        ],
      },
      {
        day: "Day B",
        focus: "Shoulders + Pull + Single Leg + Core",
        items: [
          { exerciseName: "Pike Push-up", sets: 3, repRange: "6-10" },
          { exerciseName: "Pull-up (assisted if needed)", sets: 3, repRange: "5-8" },
          { exerciseName: "Split Squat", sets: 3, repRange: "8-10 / side" },
          { exerciseName: "Hollow Body Hold", sets: 3, repRange: "20-30 sec" },
        ],
      },
    ],
  },
  {
    id: "intermediate-upper-lower",
    title: "Intermediate Upper/Lower",
    level: "Intermediate",
    summary: "4 days per week. Build volume and improve performance.",
    weeklyStructure: "Upper 1 / Lower 1 / Upper 2 / Lower 2",
    progressionRule:
      "Use double progression: hit rep cap first, then increase variation difficulty.",
    days: [
      {
        day: "Upper 1",
        focus: "Vertical push/pull",
        items: [
          { exerciseName: "Pull-up", sets: 4, repRange: "6-8" },
          { exerciseName: "Dip", sets: 4, repRange: "6-8" },
          { exerciseName: "Inverted Row", sets: 3, repRange: "10-12" },
        ],
      },
      {
        day: "Lower 1",
        focus: "Squat dominant",
        items: [
          { exerciseName: "Bodyweight Squat", sets: 4, repRange: "12-15" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, repRange: "8-10 / side" },
          { exerciseName: "Plank", sets: 3, repRange: "45-60 sec" },
        ],
      },
      {
        day: "Upper 2",
        focus: "Horizontal push/pull + core",
        items: [
          { exerciseName: "Push-up", sets: 4, repRange: "10-15" },
          { exerciseName: "Inverted Row", sets: 4, repRange: "10-12" },
          { exerciseName: "Hanging Leg Raise", sets: 3, repRange: "8-12" },
        ],
      },
      {
        day: "Lower 2",
        focus: "Single-leg and posterior chain",
        items: [
          { exerciseName: "Bulgarian Split Squat", sets: 4, repRange: "8-12 / side" },
          { exerciseName: "Bodyweight Squat (tempo)", sets: 3, repRange: "10-12" },
          { exerciseName: "Hollow Body Hold", sets: 3, repRange: "20-40 sec" },
        ],
      },
    ],
  },
  {
    id: "advanced-strength-skill",
    title: "Advanced Strength + Skill",
    level: "Advanced",
    summary: "5 days per week. Combine strength work with skill practice.",
    weeklyStructure: "Push / Pull / Skill / Legs / Mixed",
    progressionRule:
      "Run 2 hard weeks + 1 easier week. Keep RPE mostly 8-9 on primary work.",
    days: [
      {
        day: "Push",
        focus: "High-intensity pressing",
        items: [
          { exerciseName: "Dip", sets: 5, repRange: "4-8" },
          { exerciseName: "Pike Push-up", sets: 4, repRange: "5-8" },
          { exerciseName: "Push-up", sets: 3, repRange: "AMRAP-2" },
        ],
      },
      {
        day: "Pull",
        focus: "Vertical pulling strength",
        items: [
          { exerciseName: "Pull-up", sets: 5, repRange: "4-8" },
          { exerciseName: "Inverted Row", sets: 4, repRange: "8-12" },
          { exerciseName: "Hanging Leg Raise", sets: 3, repRange: "10-15" },
        ],
      },
      {
        day: "Skill",
        focus: "Skill accumulation",
        items: [
          { exerciseName: "Handstand progression", sets: 6, repRange: "20-40 sec" },
          { exerciseName: "Hollow Body Hold", sets: 4, repRange: "20-45 sec" },
        ],
      },
      {
        day: "Legs",
        focus: "Lower body capacity",
        items: [
          { exerciseName: "Bulgarian Split Squat", sets: 5, repRange: "6-10 / side" },
          { exerciseName: "Bodyweight Squat", sets: 4, repRange: "12-20" },
        ],
      },
      {
        day: "Mixed",
        focus: "Volume and weak-point work",
        items: [
          { exerciseName: "Push-up", sets: 4, repRange: "10-20" },
          { exerciseName: "Inverted Row", sets: 4, repRange: "10-15" },
          { exerciseName: "Plank", sets: 4, repRange: "45-90 sec" },
        ],
      },
    ],
  },
];

export function getPlanById(id: string) {
  return plans.find((plan) => plan.id === id);
}
