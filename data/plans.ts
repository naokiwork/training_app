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
    id: "level-1-beginner-foundation",
    title: "LEVEL 1 - BEGINNER (Foundation Phase)",
    level: "Beginner",
    summary: "Goal: Build strength, control, joint stability. Frequency: 4 days/week.",
    weeklyStructure: "Mon / Tue / Thu / Sat",
    progressionRule:
      "When you can do the top reps cleanly for all sets, increase reps or move to a harder variation.",
    days: [
      {
        day: "Day 1 - Push Focus",
        focus: "Push strength and trunk stability",
        items: [
          { exerciseName: "Push-ups (knee or incline if needed)", sets: 3, repRange: "8-12 (Rest 60-90 sec)" },
          { exerciseName: "Pike Push-up (short inverted V)", sets: 3, repRange: "6-10" },
          { exerciseName: "Bench or Assisted Dips", sets: 3, repRange: "6-8" },
          { exerciseName: "Plank", sets: 3, repRange: "30-45 sec" },
        ],
      },
      {
        day: "Day 2 - Lower Body + Core",
        focus: "Lower body endurance and core control",
        items: [
          { exerciseName: "Bodyweight Squat", sets: 4, repRange: "10-15" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, repRange: "8 each leg" },
          { exerciseName: "Glute Bridge", sets: 3, repRange: "12-15" },
          { exerciseName: "Hollow Hold (bent knee if needed)", sets: 3, repRange: "20-30 sec" },
        ],
      },
      {
        day: "Day 3 - Pull Focus",
        focus: "Pulling strength and hanging control",
        items: [
          { exerciseName: "Inverted Rows", sets: 4, repRange: "8-12" },
          { exerciseName: "Negative Pull-ups", sets: 3, repRange: "3-5 (3-5 sec down)" },
          { exerciseName: "Dead Hang", sets: 3, repRange: "20-30 sec" },
          { exerciseName: "Plank or Side Plank", sets: 3, repRange: "30 sec" },
        ],
      },
      {
        day: "Day 4 - Full Body",
        focus: "Balanced full-body session",
        items: [
          { exerciseName: "Push-ups", sets: 3, repRange: "10" },
          { exerciseName: "Bodyweight Squats", sets: 3, repRange: "15" },
          { exerciseName: "Inverted Rows", sets: 3, repRange: "10" },
          { exerciseName: "Hollow Hold", sets: 3, repRange: "25 sec" },
        ],
      },
    ],
  },
  {
    id: "level-2-intermediate-strength",
    title: "LEVEL 2 - INTERMEDIATE (Strength Development)",
    level: "Intermediate",
    summary: "Goal: Build real pulling strength and controlled pushing. Frequency: 4-5 days/week.",
    weeklyStructure: "Day 1 Push / Day 2 Pull / Day 3 Legs / Day 4 Upper Volume / Optional Day 5 Skill+Core",
    progressionRule:
      "Add reps until upper range, then move to a harder variation (elevated, slower tempo, pause reps).",
    days: [
      {
        day: "Day 1 - Push Strength",
        focus: "Push power and shoulder control",
        items: [
          { exerciseName: "Standard Push-ups (feet elevated if strong)", sets: 4, repRange: "12-15" },
          { exerciseName: "Dips", sets: 4, repRange: "6-10" },
          { exerciseName: "Pike Push-ups (deeper range)", sets: 4, repRange: "8-12" },
          { exerciseName: "Hollow Hold", sets: 3, repRange: "30-45 sec" },
        ],
      },
      {
        day: "Day 2 - Pull Strength",
        focus: "Strict pull progress",
        items: [
          { exerciseName: "Pull-ups", sets: 4, repRange: "5-8" },
          { exerciseName: "Inverted Rows (feet elevated)", sets: 3, repRange: "8-12" },
          { exerciseName: "Hanging Knee Raises", sets: 3, repRange: "8-12" },
          { exerciseName: "Dead Hang", sets: 3, repRange: "30 sec" },
        ],
      },
      {
        day: "Day 3 - Legs Power",
        focus: "Lower body power and trunk endurance",
        items: [
          { exerciseName: "Bodyweight Squats (3 sec down)", sets: 4, repRange: "15" },
          { exerciseName: "Bulgarian Split Squats", sets: 4, repRange: "10 each leg" },
          { exerciseName: "Jump Squats", sets: 3, repRange: "8" },
          { exerciseName: "Plank", sets: 3, repRange: "45 sec" },
        ],
      },
      {
        day: "Day 4 - Upper Volume",
        focus: "Volume with clean form",
        items: [
          { exerciseName: "Push-ups", sets: 3, repRange: "max reps (leave 2 in reserve)" },
          { exerciseName: "Pull-ups", sets: 3, repRange: "max reps (clean form)" },
          { exerciseName: "Dips", sets: 3, repRange: "8-10" },
          { exerciseName: "Hanging Knee Raises", sets: 3, repRange: "12" },
        ],
      },
      {
        day: "Optional Day 5 - Skill + Core",
        focus: "Skill practice and stability",
        items: [
          { exerciseName: "Hollow Hold", sets: 4, repRange: "40 sec" },
          { exerciseName: "Scapular Pull-ups", sets: 3, repRange: "10" },
          { exerciseName: "Wall Handstand Practice", sets: 1, repRange: "10 minutes total" },
        ],
      },
    ],
  },
  {
    id: "level-3-advanced-pro",
    title: "LEVEL 3 - ADVANCED / PRO (High Performance Phase)",
    level: "Advanced",
    summary: "Goal: Strength, hypertrophy, skill mastery. Frequency: 5-6 days/week.",
    weeklyStructure: "Day 1 Heavy Pull / Day 2 Heavy Push / Day 3 Lower Body / Day 4 Volume Upper / Day 5 Skill+Core / Optional Day 6 Conditioning",
    progressionRule:
      "Add weight, use slower tempo (4 sec eccentric), add bottom pause, or reduce rest to 45 sec for conditioning.",
    days: [
      {
        day: "Day 1 - Heavy Pull",
        focus: "Heavy vertical pulling and anti-swing core",
        items: [
          { exerciseName: "Pull-ups (weighted if possible)", sets: 5, repRange: "5" },
          { exerciseName: "Chest-to-bar Pull-ups", sets: 4, repRange: "6" },
          { exerciseName: "Hanging Leg Raises (straight legs)", sets: 4, repRange: "10" },
          { exerciseName: "Front Lever Tuck Hold", sets: 4, repRange: "15-20 sec" },
        ],
      },
      {
        day: "Day 2 - Heavy Push",
        focus: "Heavy push and inversion skill",
        items: [
          { exerciseName: "Dips (weighted if possible)", sets: 5, repRange: "5" },
          { exerciseName: "Decline Push-ups", sets: 4, repRange: "15" },
          { exerciseName: "Pike Push-ups (feet elevated)", sets: 4, repRange: "10" },
          { exerciseName: "Handstand Hold", sets: 1, repRange: "10-15 min practice" },
        ],
      },
      {
        day: "Day 3 - Lower Body Strength",
        focus: "Single-leg strength and power",
        items: [
          { exerciseName: "Pistol Squat (assisted if needed)", sets: 4, repRange: "6 each leg" },
          { exerciseName: "Bulgarian Split Squat (3 sec down)", sets: 4, repRange: "8" },
          { exerciseName: "Jump Squats", sets: 4, repRange: "10" },
          { exerciseName: "Plank (weighted if possible)", sets: 3, repRange: "60 sec" },
        ],
      },
      {
        day: "Day 4 - Volume Upper",
        focus: "Upper volume and clean movement",
        items: [
          { exerciseName: "Pull-ups", sets: 4, repRange: "8-10" },
          { exerciseName: "Dips", sets: 4, repRange: "10-12" },
          { exerciseName: "Push-ups (slow tempo)", sets: 3, repRange: "20" },
          { exerciseName: "Hanging Leg Raises", sets: 3, repRange: "12" },
        ],
      },
      {
        day: "Day 5 - Skill + Core",
        focus: "Skill mastery and core density",
        items: [
          { exerciseName: "Front Lever Progression", sets: 4, repRange: "sets" },
          { exerciseName: "Handstand Practice", sets: 1, repRange: "15-20 min" },
          { exerciseName: "Hollow Hold", sets: 4, repRange: "45 sec" },
          { exerciseName: "Scapular Pull-ups", sets: 3, repRange: "12" },
        ],
      },
      {
        day: "Optional Day 6 - Conditioning",
        focus: "Circuit (4 rounds, minimal rest)",
        items: [
          { exerciseName: "Pull-ups", sets: 4, repRange: "8" },
          { exerciseName: "Push-ups", sets: 4, repRange: "20" },
          { exerciseName: "Jump Squats", sets: 4, repRange: "15" },
          { exerciseName: "Hanging Knee Raises", sets: 4, repRange: "12" },
        ],
      },
    ],
  },
];

export function getPlanById(id: string) {
  return plans.find((plan) => plan.id === id);
}
