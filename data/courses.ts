// Course types (Phase 1 - static data only)

export type CourseLevel =
  | "Beginner"
  | "EarlyIntermediate"
  | "Intermediate"
  | "Advanced"
  | "Elite";

export type WeeklyStructureType =
  | "LinearSplit"
  | "UpperLower"
  | "FullBody"
  | "BodyPartSplit"
  | "StrengthConditioning"
  | "SkillBased"
  | "TimeConstrained";

export type DayTemplateLayer =
  | "activation"
  | "primary"
  | "secondary"
  | "isolation"
  | "skill"
  | "conditioning"
  | "recovery";

export type CourseExerciseBlock = {
  exerciseId: string;
  exerciseName: string;
  layer?: DayTemplateLayer;
  sets: number;
  repRange: string;
  restSeconds?: number;
  tempo?: string;
};

export type CourseDayTemplate = {
  day: string;
  focus: string;
  layers?: DayTemplateLayer[];
  items: CourseExerciseBlock[];
};

export type Course = {
  id: string;
  title: string;
  level: CourseLevel;
  summary: string;
  weeklyStructure: string;
  weeklyStructureType?: WeeklyStructureType;
  progressionRule: string;
  daysPerWeek: number;
  equipment?: string[];
  days: CourseDayTemplate[];
};

export const courses: Course[] = [
  // 1. Foundation Strength (based on existing plans - Beginner)
  {
    id: "foundation-strength",
    title: "Foundation Strength Course",
    level: "Beginner",
    summary: "Goal: Build strength, control, joint stability. Frequency: 4 days/week.",
    weeklyStructure: "Mon / Tue / Thu / Sat",
    weeklyStructureType: "FullBody",
    progressionRule:
      "When you can do the top reps cleanly for all sets, increase reps or move to a harder variation.",
    daysPerWeek: 4,
    days: [
      {
        day: "Day 1 - Push Focus",
        focus: "Push strength and trunk stability",
        items: [
          { exerciseId: "push-up", exerciseName: "Push-ups (knee or incline if needed)", sets: 3, repRange: "8-12" },
          { exerciseId: "pike-push-up", exerciseName: "Pike Push-up (short inverted V)", sets: 3, repRange: "6-10" },
          { exerciseId: "dip", exerciseName: "Bench or Assisted Dips", sets: 3, repRange: "6-8" },
          { exerciseId: "plank", exerciseName: "Plank", sets: 3, repRange: "30-45 sec" },
        ],
      },
      {
        day: "Day 2 - Lower Body + Core",
        focus: "Lower body endurance and core control",
        items: [
          { exerciseId: "bodyweight-squat", exerciseName: "Bodyweight Squat", sets: 4, repRange: "10-15" },
          { exerciseId: "bulgarian-split-squat", exerciseName: "Bulgarian Split Squat", sets: 3, repRange: "8 each leg" },
          { exerciseId: "", exerciseName: "Glute Bridge", sets: 3, repRange: "12-15" },
          { exerciseId: "hollow-body-hold", exerciseName: "Hollow Hold (bent knee if needed)", sets: 3, repRange: "20-30 sec" },
        ],
      },
      {
        day: "Day 3 - Pull Focus",
        focus: "Pulling strength and hanging control",
        items: [
          { exerciseId: "inverted-row", exerciseName: "Inverted Rows", sets: 4, repRange: "8-12" },
          { exerciseId: "pull-up", exerciseName: "Negative Pull-ups", sets: 3, repRange: "3-5 (3-5 sec down)" },
          { exerciseId: "", exerciseName: "Dead Hang", sets: 3, repRange: "20-30 sec" },
          { exerciseId: "plank", exerciseName: "Plank or Side Plank", sets: 3, repRange: "30 sec" },
        ],
      },
      {
        day: "Day 4 - Full Body",
        focus: "Balanced full-body session",
        items: [
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 3, repRange: "10" },
          { exerciseId: "bodyweight-squat", exerciseName: "Bodyweight Squats", sets: 3, repRange: "15" },
          { exerciseId: "inverted-row", exerciseName: "Inverted Rows", sets: 3, repRange: "10" },
          { exerciseId: "hollow-body-hold", exerciseName: "Hollow Hold", sets: 3, repRange: "25 sec" },
        ],
      },
    ],
  },
  // 2. V-Shape Sculpt
  {
    id: "v-shape-sculpt",
    title: "V-Shape Sculpt Course",
    level: "Intermediate",
    summary: "Focus on back width, thickness, shoulders, and arms. Upper/Lower or Body Part Split.",
    weeklyStructure: "Day 1 Back / Day 2 Shoulders / Day 3 Arms / Day 4 Upper Volume",
    weeklyStructureType: "BodyPartSplit",
    progressionRule: "Add load or reps until upper range, then progress to harder variation.",
    daysPerWeek: 4,
    days: [
      {
        day: "Day 1 - Back Width & Thickness",
        focus: "Lat development and rowing strength",
        items: [
          { exerciseId: "pull-up", exerciseName: "Pull-ups (wide or neutral)", sets: 4, repRange: "6-10" },
          { exerciseId: "inverted-row", exerciseName: "Barbell Row", sets: 4, repRange: "8-12" },
          { exerciseId: "", exerciseName: "Lat Pulldown", sets: 3, repRange: "10-12" },
          { exerciseId: "", exerciseName: "Face Pull", sets: 3, repRange: "15-20" },
        ],
      },
      {
        day: "Day 2 - Shoulders",
        focus: "Delt development",
        items: [
          { exerciseId: "pike-push-up", exerciseName: "Overhead Press", sets: 4, repRange: "6-10" },
          { exerciseId: "", exerciseName: "Lateral Raise", sets: 4, repRange: "12-15" },
          { exerciseId: "", exerciseName: "Rear Delt Fly", sets: 3, repRange: "12-15" },
          { exerciseId: "", exerciseName: "Face Pull", sets: 3, repRange: "15-20" },
        ],
      },
      {
        day: "Day 3 - Arms",
        focus: "Biceps and triceps",
        items: [
          { exerciseId: "", exerciseName: "Barbell Curl", sets: 4, repRange: "8-12" },
          { exerciseId: "dip", exerciseName: "Skull Crusher / Tricep Extension", sets: 4, repRange: "8-12" },
          { exerciseId: "", exerciseName: "Hammer Curl", sets: 3, repRange: "10-12" },
          { exerciseId: "", exerciseName: "Rope Pushdown", sets: 3, repRange: "12-15" },
        ],
      },
      {
        day: "Day 4 - Upper Volume",
        focus: "Volume with clean form",
        items: [
          { exerciseId: "pull-up", exerciseName: "Pull-ups", sets: 4, repRange: "8-10" },
          { exerciseId: "inverted-row", exerciseName: "Cable Row", sets: 4, repRange: "10-12" },
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 3, repRange: "15-20" },
          { exerciseId: "dip", exerciseName: "Dips", sets: 3, repRange: "10-12" },
        ],
      },
    ],
  },
  // 3. Hybrid Athlete
  {
    id: "hybrid-athlete",
    title: "Hybrid Athlete Course",
    level: "Advanced",
    summary: "Strength + Conditioning. Combines resistance work with power and metabolic conditioning.",
    weeklyStructure: "Day 1 Strength / Day 2 Power / Day 3 Conditioning / Day 4 Upper / Day 5 Lower",
    weeklyStructureType: "StrengthConditioning",
    progressionRule: "Progress load in strength blocks; improve density and time in conditioning.",
    daysPerWeek: 5,
    days: [
      {
        day: "Day 1 - Strength Upper",
        focus: "Heavy upper body",
        items: [
          { exerciseId: "pull-up", exerciseName: "Pull-ups", sets: 5, repRange: "5" },
          { exerciseId: "push-up", exerciseName: "Push-ups (weighted if possible)", sets: 4, repRange: "8-10" },
          { exerciseId: "inverted-row", exerciseName: "Barbell Row", sets: 4, repRange: "6-8" },
          { exerciseId: "dip", exerciseName: "Dips", sets: 4, repRange: "6-10" },
        ],
      },
      {
        day: "Day 2 - Power & Explosive",
        focus: "Power movements",
        items: [
          { exerciseId: "", exerciseName: "Kettlebell Swing", sets: 4, repRange: "12-15" },
          { exerciseId: "bodyweight-squat", exerciseName: "Jump Squat", sets: 4, repRange: "8" },
          { exerciseId: "", exerciseName: "Box Jump", sets: 4, repRange: "6" },
          { exerciseId: "plank", exerciseName: "Plank", sets: 3, repRange: "45 sec" },
        ],
      },
      {
        day: "Day 3 - Conditioning",
        focus: "Metabolic work",
        items: [
          { exerciseId: "", exerciseName: "Burpees", sets: 4, repRange: "10" },
          { exerciseId: "", exerciseName: "Row Erg", sets: 4, repRange: "500m" },
          { exerciseId: "", exerciseName: "Farmer Carry", sets: 3, repRange: "45 sec" },
          { exerciseId: "", exerciseName: "Battle Rope", sets: 3, repRange: "30 sec" },
        ],
      },
      {
        day: "Day 4 - Upper Volume",
        focus: "Volume upper",
        items: [
          { exerciseId: "pull-up", exerciseName: "Pull-ups", sets: 4, repRange: "8" },
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 4, repRange: "15" },
          { exerciseId: "dip", exerciseName: "Dips", sets: 3, repRange: "10" },
          { exerciseId: "hanging-leg-raise", exerciseName: "Hanging Knee Raises", sets: 3, repRange: "12" },
        ],
      },
      {
        day: "Day 5 - Lower Body",
        focus: "Lower strength",
        items: [
          { exerciseId: "bodyweight-squat", exerciseName: "Bodyweight Squat", sets: 4, repRange: "15" },
          { exerciseId: "bulgarian-split-squat", exerciseName: "Bulgarian Split Squat", sets: 4, repRange: "8 each" },
          { exerciseId: "", exerciseName: "Hip Thrust", sets: 4, repRange: "10-12" },
          { exerciseId: "hollow-body-hold", exerciseName: "Hollow Hold", sets: 3, repRange: "40 sec" },
        ],
      },
    ],
  },
  // 4. Bodyweight Mastery
  {
    id: "bodyweight-mastery",
    title: "Bodyweight Mastery Course",
    level: "Intermediate",
    summary: "Progression ladder for bodyweight skills. Push, pull, and skill mastery.",
    weeklyStructure: "Day 1 Push / Day 2 Pull / Day 3 Skill / Day 4 Full",
    weeklyStructureType: "SkillBased",
    progressionRule: "Master each step before advancing. Use regressions when needed.",
    daysPerWeek: 4,
    days: [
      {
        day: "Day 1 - Push Progression",
        focus: "Push ladder",
        items: [
          { exerciseId: "push-up", exerciseName: "Knee Push-up", sets: 3, repRange: "12-15" },
          { exerciseId: "push-up", exerciseName: "Standard Push-up", sets: 4, repRange: "10-12" },
          { exerciseId: "push-up", exerciseName: "Decline Push-up", sets: 3, repRange: "8-10" },
          { exerciseId: "pike-push-up", exerciseName: "Pike Push-up", sets: 3, repRange: "8" },
        ],
      },
      {
        day: "Day 2 - Pull Progression",
        focus: "Pull ladder",
        items: [
          { exerciseId: "pull-up", exerciseName: "Scapular Pull-up", sets: 3, repRange: "10" },
          { exerciseId: "pull-up", exerciseName: "Assisted Pull-up", sets: 4, repRange: "6-8" },
          { exerciseId: "pull-up", exerciseName: "Pull-up", sets: 4, repRange: "5-8" },
          { exerciseId: "inverted-row", exerciseName: "Inverted Row", sets: 3, repRange: "10-12" },
        ],
      },
      {
        day: "Day 3 - Skill",
        focus: "Skill practice",
        items: [
          { exerciseId: "", exerciseName: "Wall Handstand", sets: 1, repRange: "5-10 min" },
          { exerciseId: "hollow-body-hold", exerciseName: "L-sit Tuck", sets: 4, repRange: "15-20 sec" },
          { exerciseId: "plank", exerciseName: "Plank", sets: 4, repRange: "45 sec" },
          { exerciseId: "hanging-leg-raise", exerciseName: "Hanging Leg Raise", sets: 3, repRange: "10" },
        ],
      },
      {
        day: "Day 4 - Full Body",
        focus: "Balanced session",
        items: [
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 4, repRange: "12" },
          { exerciseId: "pull-up", exerciseName: "Pull-ups", sets: 4, repRange: "6" },
          { exerciseId: "bodyweight-squat", exerciseName: "Bodyweight Squats", sets: 4, repRange: "15" },
          { exerciseId: "hollow-body-hold", exerciseName: "Hollow Hold", sets: 4, repRange: "30 sec" },
        ],
      },
    ],
  },
  // 5. Strategic Fat-Loss
  {
    id: "strategic-fat-loss",
    title: "Strategic Fat-Loss Course",
    level: "Intermediate",
    summary: "Metabolic tools: EMOM, AMRAP, Circuit. Time-Constrained (30-min optimized).",
    weeklyStructure: "Day 1 Circuit / Day 2 EMOM / Day 3 AMRAP / Day 4 Tabata",
    weeklyStructureType: "TimeConstrained",
    progressionRule: "Increase reps or reduce rest as fitness improves.",
    daysPerWeek: 4,
    days: [
      {
        day: "Day 1 - Circuit",
        focus: "Density circuit",
        items: [
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 4, repRange: "15" },
          { exerciseId: "bodyweight-squat", exerciseName: "Squats", sets: 4, repRange: "20" },
          { exerciseId: "pull-up", exerciseName: "Pull-ups", sets: 4, repRange: "8" },
          { exerciseId: "", exerciseName: "Burpees", sets: 4, repRange: "10" },
        ],
      },
      {
        day: "Day 2 - EMOM",
        focus: "Every minute on the minute",
        items: [
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 10, repRange: "EMOM 10 min" },
          { exerciseId: "bodyweight-squat", exerciseName: "Squats", sets: 10, repRange: "EMOM 10 min" },
          { exerciseId: "", exerciseName: "Burpees", sets: 5, repRange: "EMOM 5 min" },
        ],
      },
      {
        day: "Day 3 - AMRAP",
        focus: "As many rounds as possible",
        items: [
          { exerciseId: "push-up", exerciseName: "Push-ups x 10", sets: 1, repRange: "AMRAP 15 min" },
          { exerciseId: "bodyweight-squat", exerciseName: "Squats x 15", sets: 1, repRange: "" },
          { exerciseId: "inverted-row", exerciseName: "Rows x 10", sets: 1, repRange: "" },
        ],
      },
      {
        day: "Day 4 - Tabata",
        focus: "20s work / 10s rest",
        items: [
          { exerciseId: "", exerciseName: "Burpees", sets: 8, repRange: "Tabata" },
          { exerciseId: "bodyweight-squat", exerciseName: "Squats", sets: 8, repRange: "Tabata" },
          { exerciseId: "push-up", exerciseName: "Push-ups", sets: 8, repRange: "Tabata" },
          { exerciseId: "plank", exerciseName: "Plank", sets: 8, repRange: "Tabata" },
        ],
      },
    ],
  },
];

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}
