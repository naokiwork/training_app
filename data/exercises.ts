export type ExerciseData = {
  id: string;
  name: string;
  category: string | null;
  purpose: string | null;
  instruction: string | null;
  advice: string | null;
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
    instruction:
      "1. Place your hands shoulder-width apart or slightly wider. Fingers slightly turned outward.\n2. Keep your body in a straight line from head to heels (do not let hips sag or rise too high).\n3. Keep elbows at about 30-60 degrees from your body, not flared straight out.\n4. Lower until your chest (or sternum) approaches the floor.\n5. Press the floor away to return to the top without shrugging your shoulders.",
    advice:
      "- Keep your gaze on the floor to avoid neck strain.\n- Think \"bring your chest to the floor,\" not just bending the arms.\n- If too difficult: do knee push-ups or incline push-ups (hands on a bench).",
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
    instruction:
      "1. Grip the bar shoulder-width or slightly wider, thumb wrapped around.\n2. Hang without shrugging; depress your shoulder blades slightly (light chest up).\n3. Pull by driving your elbows down toward your ribs.\n4. Bring your chin close to or above the bar and pause briefly.\n5. Lower yourself under control. Avoid dropping suddenly.",
    advice:
      "- Learn to initiate by pulling your shoulder blades down first (scapular pull).\n- Prioritize strict reps before using momentum.\n- If too hard: do negatives (jump to the top, lower slowly) or use resistance bands.",
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
    instruction:
      "1. Support yourself on the bars with arms extended.\n2. Keep shoulders depressed (do not shrug).\n3. Lean slightly forward to emphasize chest, or stay more upright for triceps.\n4. Bend elbows back and lower under control (avoid painful depth).\n5. Press the bars down to return up.",
    advice:
      "- Shoulder discomfort often comes from going too deep or letting shoulders roll forward.\n- Keep elbows from flaring excessively.\n- If difficult: reduce depth or use foot assistance.",
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
    instruction:
      "1. Stand with feet shoulder-width apart, toes slightly turned outward.\n2. Keep chest up and spine neutral (do not round your back).\n3. Push hips back and bend knees, tracking knees over toes.\n4. Descend as deep as possible while keeping heels down.\n5. Drive through your heels to stand up.",
    advice:
      "- Keep weight evenly distributed on the tripod of the foot (big toe, little toe, heel).\n- Prevent knees from collapsing inward by actively pushing them out.\n- If mobility is limited, elevate heels slightly to improve depth.",
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
    instruction:
      "1. Set a bar at waist to chest height. Lie underneath it.\n2. Keep your body straight and core tight.\n3. Pull your chest toward the bar by squeezing your shoulder blades.\n4. Pause briefly at the top.\n5. Lower slowly under control.",
    advice:
      "- Think \"pull chest to bar,\" not just bending arms.\n- The more horizontal your body, the harder it becomes.\n- Add a one-second pause at the top for better activation.",
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
    instruction:
      "1. Place hands shoulder-width apart and lift hips into an inverted V shape.\n2. Look between your hands.\n3. Bend elbows and lower your head toward the floor.\n4. Press straight back up without shrugging shoulders.\n5. Keep core engaged throughout.",
    advice:
      "- Move straight down, not forward, to target shoulders properly.\n- To regress: shorten the inverted V or elevate hands.\n- To progress: elevate feet on a bench.",
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
    instruction:
      "1. Place rear foot on a bench behind you.\n2. Keep torso slightly leaned forward and hips square.\n3. Lower by bending the front knee and hip.\n4. Drive through the front heel to stand.\n5. Prevent the front knee from collapsing inward.",
    advice:
      "- Adjust front foot distance for balance and knee comfort.\n- Keep hips stable at the bottom.\n- Reduce depth or use a lower surface if too challenging.",
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
    instruction:
      "1. Place elbows under shoulders, forearms on the floor.\n2. Extend legs and keep body straight.\n3. Brace abs and pull ribs down to avoid lower back arching.\n4. Squeeze glutes to stabilize pelvis.\n5. Breathe normally.",
    advice:
      "- Focus on maintaining position, not just holding time.\n- If lower back arches, shorten the duration.\n- To progress: narrow stance or lift one leg.",
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
    instruction:
      "1. Lie on your back and press your lower back firmly into the floor.\n2. Brace your core and keep ribs down.\n3. Lift shoulders slightly off the floor, arms overhead.\n4. Extend legs and lift them slightly (only as high as you can maintain back contact).\n5. Hold position without losing lower back contact.",
    advice:
      "- The moment your lower back lifts, tension is lost.\n- To regress: bend knees or bring arms forward.\n- Short perfect holds are better than long poor ones.",
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
    instruction:
      "1. Hang from a bar with shoulders depressed.\n2. Eliminate swinging before starting.\n3. Posteriorly tilt pelvis (slight abdominal curl) as you raise legs.\n4. Lift legs as high as possible without arching your back.\n5. Lower slowly without swinging.",
    advice:
      "- Avoid arching your lower back and simply lifting legs with hip flexors.\n- Progression: knee raises -> straight leg raises -> toes-to-bar.\n- If swinging, reduce reps and focus on control.",
    formCues: "Posterior tilt. Lift with control. Avoid swing.",
    mistakes: "Using momentum. Incomplete range.",
    safetyNotes: "Protect shoulders with active hang position.",
    progression: "Knees to chest -> Straight-leg raise -> Toes to bar.",
    regression: "Hanging knee raise.",
  },
];
