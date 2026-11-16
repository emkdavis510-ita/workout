// All plan content lives here. Edit this file to change exercises, sessions or the ladder.

const LADDER = [
  // Each rung: repeat (run minutes, walk minutes) `reps` times, after a 5-min warm-up walk, before a 5-min cool-down walk.
  { run: 1, walk: 2, reps: 6 },
  { run: 2, walk: 2, reps: 6 },
  { run: 3, walk: 2, reps: 5 },
  { run: 5, walk: 1.5, reps: 4 },
  { run: 8, walk: 1, reps: 3 },
  { run: 12, walk: 1, reps: 2 },
  { run: 25, walk: 0, reps: 1 },
];
const WARMUP_MIN = 5;
const COOLDOWN_MIN = 5;

const MORNING = {
  yoga: {
    title: 'Morning yoga',
    mins: 15,
    detail: 'Cat–cow, low lunge with twist, lizard, half pigeon, down dog, chair pose hold, forward fold.',
  },
  pilates: {
    title: 'Morning Pilates',
    mins: 15,
    detail: 'The hundred, single-leg stretch, side-lying leg series, bridge with march, swimming, side plank.',
  },
  mobility: {
    title: 'Gentle mobility',
    mins: 10,
    detail: 'Hip circles, ankle rocks, thoracic rotations, slow cat–cow. Nothing that makes you sore.',
  },
};

const EVENING = {
  power: {
    title: 'Power yoga',
    mins: 30,
    detail: 'Sun salutation B ×5, warrior flow, chair with twist, crescent lunge, long holds in hip openers.',
  },
  pilates: {
    title: 'Evening Pilates',
    mins: 30,
    detail: 'Mat class with a focus on deep core, glutes and inner thighs. Controlled, no rushing.',
  },
  restorative: {
    title: 'Restorative yoga',
    mins: 30,
    detail: 'Supported child’s pose, reclined bound angle, legs up the wall, supported twist. Keep your legs fresh.',
  },
};

const LIFTS = {
  liftA: {
    name: 'Lift A',
    focus: 'Single-leg strength',
    mins: 45,
    warmup: '5 min easy cardio, leg swings, 10 bodyweight squats, 5 lateral lunges each side.',
    supersets: [
      { key: 'A', sets: 3, ex: [
        { id: 'A1', name: 'Rear-foot elevated split squat', reps: '8 / leg', load: true },
        { id: 'A2', name: 'Ski-stance wall sit', reps: '30–45 s', load: false },
      ] },
      { key: 'B', sets: 3, ex: [
        { id: 'B1', name: 'Single-leg Romanian deadlift', reps: '8 / leg', load: true },
        { id: 'B2', name: 'Lateral lunge', reps: '8 / side', load: true },
      ] },
      { key: 'C', sets: 2, ex: [
        { id: 'C1', name: 'Slow step-down (4 s lowering)', reps: '8 / leg', load: false },
        { id: 'C2', name: 'Side plank', reps: '30 s / side', load: false },
      ] },
    ],
  },
  liftB: {
    name: 'Lift B',
    focus: 'Single-leg power and landing',
    mins: 45,
    warmup: '5 min easy cardio, leg swings, 10 pogo hops, 5 lateral lunges each side.',
    supersets: [
      { key: 'A', sets: 3, ex: [
        { id: 'A1', name: 'Step-up (knee-height box)', reps: '8 / leg', load: true },
        { id: 'A2', name: 'Skater hop, stick each landing', reps: '6 / side', load: false },
      ] },
      { key: 'B', sets: 3, ex: [
        { id: 'B1', name: 'Single-leg hip thrust', reps: '10 / leg', load: true },
        { id: 'B2', name: 'Lateral line hop', reps: '8 / side', load: false },
      ] },
      { key: 'C', sets: 2, ex: [
        { id: 'C1', name: 'Cossack squat', reps: '6 / side', load: true },
        { id: 'C2', name: 'Copenhagen plank (short lever)', reps: '20 s / side', load: false },
      ] },
    ],
  },
};

// The 14 days. main: liftA | liftB | run | tennis | rest
const DAYS = [
  { morning: 'yoga',     main: 'liftA' },
  { morning: 'pilates',  main: 'run' },
  { morning: 'yoga',     main: 'rest',   evening: 'power' },
  { morning: 'pilates',  main: 'liftB' },
  { morning: 'yoga',     main: 'rest',   evening: 'pilates' },
  { morning: 'pilates',  main: 'tennis' },
  { morning: 'yoga',     main: 'run' },
  { morning: 'pilates',  main: 'liftA' },
  { morning: 'yoga',     main: 'run' },
  { morning: 'pilates',  main: 'rest',   evening: 'power' },
  { morning: 'yoga',     main: 'liftB',  taper: true,
    note: 'Taper: about 80% of your week 1 weight. This is your last hard leg work.' },
  { morning: 'pilates',  main: 'rest',   evening: 'pilates' },
  { morning: 'yoga',     main: 'tennis', easy: true,
    note: 'Taper: easy rallying, skip the competitive sets.' },
  { morning: 'mobility', main: 'run',    easy: true, evening: 'restorative',
    note: 'Repeat your current rung. Don’t move up before the trip.' },
];

const TENNIS = {
  title: 'Tennis',
  detail: 'Play as normal. Warm up with 5 min of side shuffles and split steps.',
  easyDetail: 'Easy rallying only. Keep moving, stay loose.',
};

const FORM_CUES = [
  'Knees track over the 2nd–3rd toe and never cave in.',
  'Land quietly.',
  'Brace before every rep.',
  'Hold isometrics in a real ski stance: shins forward, hips back.',
];

const GUIDE = [
  { h: 'Weekly rhythm', p: 'Mon lift A · Tue run · Wed rest + evening session · Thu lift B · Fri rest + evening session · Sat tennis · Sun run. If your week runs differently, move days around but keep the spacing below.' },
  { h: 'Spacing', p: 'Never two lift days in a row. Runs go on the day after a lift or rest day, never the day after the jump work in Lift B. Mornings can go anywhere.' },
  { h: 'Supersets', p: 'Do A1, then A2 straight after, rest 60–90 s, and repeat for all the sets. Then move on to B. Pick a weight where the last 2 reps are hard but your form stays clean.' },
  { h: 'Walk–run ladder', p: 'Move up a rung only if the last run felt easy, nothing hurt during it, and nothing ached the next morning. Otherwise repeat the rung. Repeating is normal, not a setback.' },
  { h: 'Evening sessions', p: 'Only on rest days, which are Wednesdays and Fridays. Power yoga and Pilates alternate between them. On Day 14 the evening session is restorative yoga, so your legs stay fresh.' },
  { h: 'Taper', p: 'Lift B in week 2 is at about 80% of your usual weight. Your last hard leg work is Day 11. Days 12–14 keep you moving without making you sore.' },
];
