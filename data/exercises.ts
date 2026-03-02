export type ExerciseData = {
  id: string;
  name: string;
  category: string | null;
  purpose: string | null;
  formCues: string | null;
  mistakes: string | null;
  safetyNotes: string | null;
  progression: string | null;
  regression: string | null;
};

export const exercises: ExerciseData[] = [
  {
    id: "push-up",
    name: "Push-up",
    category: "push",
    purpose: "Build chest, triceps, and core control.",
    formCues: "Keep body straight. Lower with control. Press without shrugging.",
    mistakes: "Sagging hips. Flaring elbows too wide. Partial range of motion.",
    safetyNotes: "Stop if shoulder pain appears. Keep wrists neutral.",
    progression: "Incline -> Standard -> Decline -> Diamond.",
    regression: "Wall push-up or incline push-up.",
  },
  {
    id: "pull-up",
    name: "Pull-up",
    category: "pull",
    purpose: "Build vertical pulling strength and grip.",
    formCues: "Depress scapula first. Pull chest up. Avoid excessive kipping.",
    mistakes: "Neck reaching. Swinging. Half reps.",
    safetyNotes: "Avoid elbow overload by controlling eccentric.",
    progression: "Band-assisted -> Strict pull-up -> Chest-to-bar.",
    regression: "Negative pull-up or band-assisted pull-up.",
  },
  {
    id: "dip",
    name: "Dip",
    category: "push",
    purpose: "Develop triceps and lower chest strength.",
    formCues: "Shoulders down. Slight forward lean. Control depth.",
    mistakes: "Shoulders rolling forward. Dropping too deep too soon.",
    safetyNotes: "Reduce depth if front shoulder discomfort occurs.",
    progression: "Bench dip -> Bar dip -> Ring dip.",
    regression: "Bench dips with bent knees.",
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    category: "legs",
    purpose: "Build lower-body endurance and movement quality.",
    formCues: "Knees track toes. Brace trunk. Full comfortable depth.",
    mistakes: "Knees collapsing inward. Heels lifting.",
    safetyNotes: "Use slower tempo to reduce knee stress.",
    progression: "Tempo squat -> Split squat -> Pistol progression.",
    regression: "Box squat to reduced depth.",
  },
  {
    id: "inverted-row",
    name: "Inverted Row",
    category: "pull",
    purpose: "Horizontal pulling for upper-back balance.",
    formCues: "Keep body rigid. Pull elbows back. Touch chest to bar.",
    mistakes: "Hips dropping. Shrugging. Short range.",
    safetyNotes: "Adjust bar height to control intensity safely.",
    progression: "Higher feet or rings for harder reps.",
    regression: "Higher bar angle.",
  },
  {
    id: "pike-push-up",
    name: "Pike Push-up",
    category: "push",
    purpose: "Build shoulder strength for vertical pressing.",
    formCues: "Hips high. Head moves forward-down. Press back strongly.",
    mistakes: "Elbows too wide. Collapsing at neck.",
    safetyNotes: "Start with higher hand elevation if needed.",
    progression: "Pike -> Elevated pike -> Handstand push-up progression.",
    regression: "Incline pike push-up.",
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    category: "legs",
    purpose: "Single-leg strength and stability.",
    formCues: "Front foot planted. Controlled descent. Upright torso.",
    mistakes: "Pushing from rear leg too much. Losing balance.",
    safetyNotes: "Use support if balance limits safe reps.",
    progression: "Slow tempo or added load.",
    regression: "Static split squat.",
  },
  {
    id: "plank",
    name: "Plank",
    category: "core",
    purpose: "Improve anti-extension trunk endurance.",
    formCues: "Ribs down. Glutes tight. Neutral neck.",
    mistakes: "Lower back sag. Holding breath.",
    safetyNotes: "Stop set when posture breaks.",
    progression: "Longer holds or harder lever.",
    regression: "Knee plank.",
  },
  {
    id: "hollow-body-hold",
    name: "Hollow Body Hold",
    category: "core",
    purpose: "Core tension foundation for skills.",
    formCues: "Lower back pressed down. Arms and legs long.",
    mistakes: "Lower back arching off floor.",
    safetyNotes: "Shorten lever if lumbar tension appears.",
    progression: "Longer holds, arms overhead, hollow rocks.",
    regression: "Tuck hollow hold.",
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    category: "core",
    purpose: "Strengthen hip flexion and trunk control.",
    formCues: "Posterior tilt. Lift with control. Avoid swing.",
    mistakes: "Using momentum. Incomplete range.",
    safetyNotes: "Protect shoulders with active hang position.",
    progression: "Knees to chest -> Straight-leg raise -> Toes to bar.",
    regression: "Hanging knee raise.",
  },
];
