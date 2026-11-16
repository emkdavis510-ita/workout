// All plan content lives here. Edit this file to change sessions, exercises, or the ladder.
// Session exercise rows: [name, dose, cue]. Lift rows: [label, name, dose, cue, logsWeight].

/* ---------- Exercise library: what each one targets and why it matters on skis ---------- */
const EX = {
  // Morning flow
  'Sun Salutation A': { m: 'Hamstrings, calves, shoulders, spinal mobility', ski: 'Warms the whole chain and frees up the hamstrings and hips you fold through in an athletic ski stance.' },
  'Sun Salutation B': { m: 'Quads, glutes, shoulders, full body', ski: 'Chair and warrior I hold you in a bent-knee stance, building the leg endurance a long run asks for.' },
  'Pelvic curl': { m: 'Glutes, hamstrings, deep core', ski: 'Teaches pelvis control, which keeps your hips stacked over your feet instead of sinking into the back seat.' },
  'Single-leg pelvic curl': { m: 'Glutes, hamstrings, pelvic stability', ski: 'Keeps the pelvis level while one leg carries the load, the way the outside ski does in every turn.' },
  'Imprint toe taps': { m: 'Deep abdominals (transverse abdominis), hip flexors', ski: 'Trains a quiet trunk while the legs move. That is your core’s job as the legs soak up bumps.' },
  'Clamshell': { m: 'Glute medius, deep hip rotators', ski: 'Stops the knee caving inward on the downhill ski, a classic cause of knee strain.' },
  'Side-lying leg lift': { m: 'Glute medius, outer hip', ski: 'Builds the side-hip strength that holds your edge angle steady through the turn.' },
  'Side-lying leg circles': { m: 'Glute medius, hip rotators, hip flexors', ski: 'Hip control in every direction, so you steer the ski from the hip instead of twisting the knee.' },
  'Bridge march': { m: 'Glutes, hamstrings, anti-rotation core', ski: 'Single-leg hip stability, like shifting weight ski to ski without the hips dropping.' },
  'The Hundred': { m: 'Deep abdominals, hip flexors', ski: 'Core endurance, so your trunk stays solid at the end of a long run instead of folding.' },
  'Swimming': { m: 'Back extensors, glutes, rear shoulders', ski: 'Back strength to stay tall and resist getting thrown backwards when the snow grabs your skis.' },

  // Lift A
  'Bulgarian split squat': { m: 'Quads, glutes, adductors', ski: 'Single-leg strength for the outside ski, which carries most of your weight through a turn.' },
  'Single-arm dumbbell row': { m: 'Lats, mid-back, rear shoulder; obliques resist rotation', ski: 'Upper-back strength for pole plants, carrying skis, and pushing yourself up after a fall.' },
  'Single-leg RDL, opposite hand': { m: 'Hamstrings, glutes, foot and ankle stabilisers', ski: 'Strong hamstrings protect the ACL and help you recover when a ski runs away from you.' },
  'Single-leg RDL': { m: 'Hamstrings, glutes, foot and ankle stabilisers', ski: 'Strong hamstrings protect the ACL and help you recover when a ski runs away from you.' },
  'Half-kneeling overhead press': { m: 'Shoulders, triceps, core, glute of the down leg', ski: 'Shoulder strength for poling and getting up off the snow, with a braced trunk.' },
  'Hip thrust': { m: 'Glutes (gluteus maximus), hamstrings', ski: 'Hip drive keeps you forward and centred, and powers the extend-and-absorb movement through terrain.' },
  'Pallof press': { m: 'Obliques, deep core (anti-rotation)', ski: 'Keeps the upper body quiet and facing downhill while the legs turn underneath it.' },
  'Pallof press with a step out': { m: 'Obliques, deep core, hip stabilisers', ski: 'Adds moving feet under a stable trunk, closer to what happens mid-turn.' },
  'Lateral step-up': { m: 'Quads, glute medius, inner quad (VMO)', ski: 'Controls the knee over the toes as you push sideways, like the edge change between turns.' },
  'Lateral bound to stick': { m: 'Glutes, adductors, ankle stabilisers (power + landing)', ski: 'Quick, stable one-leg landings, like recovering after catching an edge.' },
  'Face pull': { m: 'Rear delts, rotator cuff, mid traps', ski: 'Posture and shoulder health under a backpack and through hundreds of pole plants.' },
  'Wall sit into ski tuck': { m: 'Quads (isometric), glutes', ski: 'Leg endurance. Burning thighs halfway down a run is exactly what this delays.' },

  // Lift B
  'Step-up, high box': { m: 'Glutes, quads', ski: 'Strength from a deep knee bend, for powder, moguls, and standing up from low positions.' },
  'Lat pulldown': { m: 'Lats, biceps, mid-back', ski: 'Pulling strength for poling across flats and hauling yourself up after a fall.' },
  'Cossack squat': { m: 'Adductors, quads, glutes, hip mobility', ski: 'Strength and range in a wide side position, for wide stances and saving a splayed ski.' },
  'Skater bound, stick it': { m: 'Glutes, adductors, quads, ankle stabilisers (power + landing)', ski: 'Edge-to-edge power and absorbing force on one leg, like a quick turn transition.' },
  'B-stance hip thrust': { m: 'Glutes (front leg), hamstrings', ski: 'Single-leg hip strength with a little support, matching the uneven load between your two skis.' },
  'Copenhagen plank, short lever': { m: 'Adductors (inner thigh), obliques', ski: 'Inner thighs keep the skis together and protect the knee from twisting outward.' },
  'Copenhagen plank': { m: 'Adductors (inner thigh), obliques', ski: 'Inner thighs keep the skis together and protect the knee from twisting outward.' },
  'Single-leg stand + cable chop': { m: 'Ankle and hip stabilisers, obliques', ski: 'One-leg balance while the upper body rotates, as when you plant a pole mid-turn.' },
  'Lateral raise': { m: 'Side delts', ski: 'Shoulder endurance for poling, and resilience if you put a hand down in a fall.' },
  'Ski tuck with weight shifts': { m: 'Quads, glutes, adductors (isometric)', ski: 'Rehearses shifting pressure from edge to edge while staying low and stable.' },

  // After the run, mobility
  'Knee-to-wall ankle rocks': { m: 'Ankle dorsiflexion: calves, Achilles', ski: 'Ski boots push your shins forward. Without this ankle bend you end up sitting back.' },
  'Slow calf raise': { m: 'Calves, Achilles tendon', ski: 'Tendon resilience for running, and better control of shin pressure against the boot.' },
  'Couch stretch': { m: 'Hip flexors, quads (stretch)', ski: 'Running and skiing tighten the hip flexors, which pull you into a seated stance. This undoes that.' },
  '90/90 hip switches': { m: 'Hip internal and external rotation', ski: 'Hip rotation is what steers the skis. More of it means less twisting at the knee.' },
  'Open-book thoracic rotation': { m: 'Mid-back (thoracic) mobility', ski: 'Lets your upper body face downhill while the legs turn underneath.' },
  'Figure-4 stretch': { m: 'Glutes, piriformis (stretch)', ski: 'Releases the hips after lots of single-leg work, so they move freely.' },
  'Figure-4 on your back': { m: 'Glutes, piriformis (stretch)', ski: 'Releases the hips after lots of single-leg work, so they move freely.' },

  // Evening power yoga
  'Chair pose holds': { m: 'Quads, glutes, core', ski: 'Essentially a ski stance. Builds endurance in that exact bent-knee position.' },
  'Warrior II, reverse warrior, extended side angle': { m: 'Quads, adductors, glutes, shoulders', ski: 'Wide-stance strength and side-to-side stability.' },
  'Crescent lunge with twist': { m: 'Hip flexors, quads, obliques', ski: 'Leg strength plus upper-body rotation, like a pole plant through a turn.' },
  'Warrior III': { m: 'Standing-leg glute, hamstring and ankle; back', ski: 'One-leg balance with the body hinged forward, close to a forward-pressured stance.' },
  'Half moon': { m: 'Glute medius, ankle stabilisers, obliques', ski: 'Side balance on one leg, the feeling of holding an edge.' },
  'Boat pose': { m: 'Deep abdominals, hip flexors', ski: 'Core strength to keep the trunk stable over the skis.' },
  'Pigeon': { m: 'Glutes, hip rotators (stretch)', ski: 'Restores hip rotation after lifting and running.' },
  'Savasana': { m: 'Nervous system (recovery)', ski: 'Recovery matters: tired muscles react more slowly on the hill.' },

  // Evening Pilates
  'Roll-up': { m: 'Abdominals, spinal articulation', ski: 'Spinal control, so the trunk can flex and absorb terrain without collapsing.' },
  'Single-leg stretch + criss-cross': { m: 'Abdominals, obliques', ski: 'Rotational core strength for a quiet, downhill-facing upper body.' },
  'Teaser prep': { m: 'Deep core, hip flexors', ski: 'Balancing from your centre, the same skill as staying centred over your skis.' },
  'Side-lying series': { m: 'Glute medius, outer hip, adductors', ski: 'Side-hip strength to hold edge angles turn after turn.' },
  'Leg pull front': { m: 'Shoulders, core, glutes', ski: 'Whole-body bracing, plus strength to push up off the snow.' },
  'Side plank star': { m: 'Obliques, glute medius, shoulder', ski: 'Side core and hip working together, like holding a carved turn.' },
  'Shoulder bridge, single leg': { m: 'Glutes, hamstrings', ski: 'Single-leg hip stability with control on the way down.' },

  // Restorative
  "Child's pose": { m: 'Lower back, hips (release)', ski: 'Releases the lower back, which works hard holding a forward stance.' },
  'Supine twist': { m: 'Spine, glutes (release)', ski: 'Restores spinal rotation so the upper and lower body can move separately.' },
  'Reclined bound angle': { m: 'Adductors, hips (release)', ski: 'Opens the inner thighs after Copenhagen planks and tennis.' },
  'Legs up the wall': { m: 'Legs (recovery)', ski: 'Helps your legs feel fresh the night before skiing.' },

  // Runs, tennis
  'Brisk walk warm-up': { m: 'Heart, calves, hips', ski: 'Eases the joints in, so the running starts on warm tissue.' },
  'Intervals': { m: 'Heart and lungs; calves, quads, hip stabilisers', ski: 'An aerobic base means faster recovery between runs, and it helps at altitude.' },
  'Walk cool-down': { m: 'Heart rate, calves', ski: 'Brings everything down gently so tomorrow’s legs feel better.' },
  'Tennis': { m: 'Legs, hips, core, reaction speed', ski: 'Split steps and quick direction changes train the reactions you use when terrain changes under you.' },
};

/* ---------- Lift swaps ---------- */
// Alternatives for each lift exercise: [name, why you might pick it]. Each keeps the slot's sets and reps.
const SWAPS = {
  'Bulgarian split squat': [['Reverse lunge', 'Easier balance'], ['Split squat, back foot on floor', 'Knee-friendly'], ['Goblet squat', 'Both legs']],
  'Single-arm dumbbell row': [['Chest-supported dumbbell row', 'Back-friendly'], ['Band row', 'No weights'], ['Inverted row', 'Bodyweight']],
  'Single-leg RDL, opposite hand': [['Kickstand RDL', 'Easier balance'], ['Romanian deadlift', 'Both legs'], ['Single-leg hip hinge, hand on wall', 'No weights']],
  'Single-leg RDL': [['Kickstand RDL', 'Easier balance'], ['Romanian deadlift', 'Both legs'], ['Single-leg hip hinge, hand on wall', 'No weights']],
  'Half-kneeling overhead press': [['Landmine press', 'Shoulder-friendly'], ['Seated dumbbell press', 'More stable'], ['Pike push-up', 'Bodyweight']],
  'Hip thrust': [['Glute bridge', 'No bench'], ['Single-leg glute bridge', 'Bodyweight'], ['Cable pull-through', 'Back-friendly']],
  'Pallof press': [['Band Pallof press', 'No cable'], ['Dead bug', 'No equipment'], ['Bird dog', 'Gentler']],
  'Pallof press with a step out': [['Band Pallof press', 'No cable'], ['Dead bug', 'No equipment'], ['Bird dog', 'Gentler']],
  'Lateral step-up': [['Lateral lunge', 'No box'], ['Curtsy lunge', 'More glute'], ['Banded lateral walk', 'Knee-friendly']],
  'Lateral bound to stick': [['Lateral line hop', 'Lower impact'], ['Skater step', 'No jumping'], ['Banded lateral walk', 'Knee-friendly']],
  'Face pull': [['Band pull-apart', 'No cable'], ['Reverse dumbbell fly', 'Dumbbells'], ['Prone Y-T raise', 'No equipment']],
  'Wall sit into ski tuck': [['Ski-stance squat hold', 'No wall'], ['Spanish squat', 'Knee-friendly'], ['Split squat hold', 'Single leg']],
  'Step-up, high box': [['Low box step-up', 'Knee-friendly'], ['Reverse lunge', 'No box'], ['Bulgarian split squat', 'Harder']],
  'Lat pulldown': [['Band lat pulldown', 'No machine'], ['Assisted pull-up', 'Harder'], ['Single-arm dumbbell row', 'Dumbbells']],
  'Cossack squat': [['Lateral lunge', 'Less range'], ['Sumo squat', 'Both legs'], ['Side-to-side squat shift', 'Bodyweight']],
  'Skater bound, stick it': [['Skater step', 'No jumping'], ['Lateral line hop', 'Lower impact'], ['Banded lateral walk', 'Knee-friendly']],
  'B-stance hip thrust': [['Single-leg glute bridge', 'No bench'], ['Hip thrust', 'Both legs'], ['Single-leg hip thrust', 'Harder']],
  'Copenhagen plank, short lever': [['Side-lying adductor lift', 'Gentler'], ['Adductor ball squeeze', 'Easiest'], ['Side plank', 'Knee-friendly']],
  'Copenhagen plank': [['Side-lying adductor lift', 'Gentler'], ['Adductor ball squeeze', 'Easiest'], ['Side plank', 'Knee-friendly']],
  'Single-leg stand + cable chop': [['Single-leg stand + band chop', 'No cable'], ['Single-leg stand + med ball rotation', 'Med ball'], ['Single-leg balance, eyes closed', 'No equipment']],
  'Lateral raise': [['Band lateral raise', 'No dumbbells'], ['Cable lateral raise', 'Smoother'], ['Leaning lateral raise', 'More range']],
  'Ski tuck with weight shifts': [['Ski-stance squat hold', 'Simpler'], ['Skater step', 'Moving'], ['Wall sit into ski tuck', 'Supported']],
};

// Extra exercises used as swaps. cue = how to do it; load = shows a weight box.
Object.assign(EX, {
  'Reverse lunge': { m: 'Quads, glutes', ski: 'Single-leg strength with an easier balance demand than split squats.', cue: 'Step back, lower the back knee softly, drive up through the front heel.', load: true },
  'Split squat, back foot on floor': { m: 'Quads, glutes, adductors', ski: 'Same outside-ski strength with less load on the front knee.', cue: 'Stay tall, lower straight down, front knee tracks over the toes.', load: true },
  'Goblet squat': { m: 'Quads, glutes, core', ski: 'Leg strength in a ski-like bent-knee position, with both legs sharing the load.', cue: 'Hold the weight at your chest, sit between your heels, chest up.', load: true },
  'Chest-supported dumbbell row': { m: 'Lats, mid-back, rear shoulder', ski: 'Upper-back strength for poling and posture, without loading the lower back.', cue: 'Lie chest-down on an incline bench and row both dumbbells to the hips.', load: true },
  'Band row': { m: 'Lats, mid-back', ski: 'Upper-back strength for poling and getting up after a fall.', cue: 'Anchor the band at chest height, squeeze shoulder blades together.', load: false },
  'Inverted row': { m: 'Lats, mid-back, biceps, core', ski: 'Pulling strength plus whole-body bracing.', cue: 'Under a bar or table, body straight as a plank, pull chest to the bar.', load: false },
  'Kickstand RDL': { m: 'Hamstrings, glutes', ski: 'Hamstring strength that protects the ACL, with the back toe helping you balance.', cue: 'Most weight in the front leg, back toe lightly on the floor, hinge at the hips.', load: true },
  'Romanian deadlift': { m: 'Hamstrings, glutes, lower back', ski: 'Strong hamstrings and glutes for a balanced, centred stance.', cue: 'Soft knees, push the hips back, weights close to the legs.', load: true },
  'Single-leg hip hinge, hand on wall': { m: 'Hamstrings, glutes, foot stabilisers', ski: 'Single-leg balance and hip hinge, supported so you can focus on form.', cue: 'One hand on the wall, hinge forward on one leg, hips level.', load: false },
  'Landmine press': { m: 'Shoulders, upper chest, core', ski: 'Pressing strength for pushing up off the snow, easy on the shoulders.', cue: 'Press the bar end up and forward from the shoulder, ribs down.', load: true },
  'Seated dumbbell press': { m: 'Shoulders, triceps', ski: 'Shoulder strength for poling and getting up after a fall.', cue: 'Back against the bench, press up without arching.', load: true },
  'Pike push-up': { m: 'Shoulders, triceps, core', ski: 'Overhead pushing strength with no equipment.', cue: 'Hips high in an upside-down V, lower your head toward the floor.', load: false },
  'Glute bridge': { m: 'Glutes, hamstrings', ski: 'Hip drive to stay forward and centred over your skis.', cue: 'Back on the floor, weight on the hips, squeeze and pause at the top.', load: true },
  'Single-leg glute bridge': { m: 'Glutes, hamstrings, pelvic stability', ski: 'Single-leg hip strength, matching how the outside ski carries the load.', cue: 'One foot down, other knee to chest, keep the hips level.', load: false },
  'Cable pull-through': { m: 'Glutes, hamstrings', ski: 'Hip-hinge power with very little load on the back.', cue: 'Face away from a low cable, hinge back, then drive the hips through.', load: true },
  'Band Pallof press': { m: 'Obliques, deep core (anti-rotation)', ski: 'Keeps the upper body quiet and facing downhill while the legs turn.', cue: 'Band anchored at chest height, press straight out and resist the pull.', load: false },
  'Dead bug': { m: 'Deep abdominals, hip flexors', ski: 'A stable trunk while arms and legs move, like absorbing bumps.', cue: 'Low back pressed down, lower opposite arm and leg slowly.', load: false },
  'Bird dog': { m: 'Deep core, glutes, back extensors', ski: 'Anti-rotation control and a stable spine, gently.', cue: 'On all fours, reach opposite arm and leg long, no hip rotation.', load: false },
  'Lateral lunge': { m: 'Adductors, quads, glutes', ski: 'Strength in a wide side position, for edge changes and wide stances.', cue: 'Step wide, sit back into one hip, other leg straight.', load: true },
  'Curtsy lunge': { m: 'Glute medius, quads, adductors', ski: 'Hip stability across the body, like loading the inside edge.', cue: 'Step back and across, front knee stays over the toes.', load: true },
  'Banded lateral walk': { m: 'Glute medius, hip abductors', ski: 'Keeps the knees from caving in, with no impact.', cue: 'Band around the knees or ankles, quarter squat, small steps sideways.', load: false },
  'Lateral line hop': { m: 'Calves, glutes, ankle stabilisers', ski: 'Quick feet and stable landings, with less force than bounds.', cue: 'Hop side to side over a line on one leg, land quietly.', load: false },
  'Skater step': { m: 'Glutes, adductors, quads', ski: 'Rehearses the side-to-side weight shift of a turn without jumping.', cue: 'Big step sideways onto one leg, sink, hold 1 s, switch.', load: false },
  'Band pull-apart': { m: 'Rear delts, mid traps', ski: 'Posture and shoulder health for poling and wearing a backpack.', cue: 'Arms straight, pull the band apart to your chest.', load: false },
  'Reverse dumbbell fly': { m: 'Rear delts, mid-back', ski: 'Upper-back strength for posture on long days.', cue: 'Hinge forward, open the arms wide with a slight elbow bend.', load: true },
  'Prone Y-T raise': { m: 'Lower traps, rear delts', ski: 'Shoulder blade control for a strong, upright upper body.', cue: 'Lie face down, lift arms into a Y, then a T, thumbs up.', load: false },
  'Ski-stance squat hold': { m: 'Quads, glutes (isometric)', ski: 'Leg endurance in your exact ski position.', cue: 'Feet hip-width, shins forward, hips back, hands forward like holding poles.', load: false },
  'Spanish squat': { m: 'Quads (isometric)', ski: 'Strong quads with very little strain on the knee joint.', cue: 'Band behind the knees anchored in front, sit back with upright shins.', load: false },
  'Split squat hold': { m: 'Quads, glutes (isometric)', ski: 'Single-leg endurance, like a long turn on the outside ski.', cue: 'Hold the bottom of a split squat, front knee over the toes.', load: false },
  'Low box step-up': { m: 'Glutes, quads', ski: 'Single-leg strength with less knee bend.', cue: 'Box around mid-shin height, drive through the heel.', load: true },
  'Band lat pulldown': { m: 'Lats, mid-back', ski: 'Pulling strength for poling across flats.', cue: 'Band anchored high, pull elbows down to your sides.', load: false },
  'Assisted pull-up': { m: 'Lats, biceps, mid-back', ski: 'Strength to haul yourself up after a fall.', cue: 'Use a band or machine for help, chest to the bar.', load: true },
  'Sumo squat': { m: 'Adductors, glutes, quads', ski: 'Inner-thigh and hip strength in a wide stance.', cue: 'Wide stance, toes out, knees track over the toes.', load: true },
  'Side-to-side squat shift': { m: 'Adductors, quads, hip mobility', ski: 'Moves weight from leg to leg in a low position, like linked turns.', cue: 'Wide stance, shift your weight from one bent knee to the other.', load: false },
  'Single-leg hip thrust': { m: 'Glutes, hamstrings', ski: 'Full single-leg hip strength for the outside ski.', cue: 'Shoulders on the bench, one foot down, keep the hips level.', load: true },
  'Side-lying adductor lift': { m: 'Adductors (inner thigh)', ski: 'Inner-thigh strength to keep the skis together, gently.', cue: 'Lie on your side, top foot in front, lift the bottom leg.', load: false },
  'Adductor ball squeeze': { m: 'Adductors (inner thigh)', ski: 'Inner-thigh strength that protects the knee, with no strain.', cue: 'On your back, knees bent, squeeze a ball or pillow for 10 s.', load: false },
  'Side plank': { m: 'Obliques, glute medius, shoulder', ski: 'Side core and hip strength to hold an edge.', cue: 'Elbow under shoulder, straight line from head to feet.', load: false },
  'Single-leg stand + band chop': { m: 'Ankle and hip stabilisers, obliques', ski: 'One-leg balance while the upper body rotates, like a pole plant.', cue: 'Band anchored high, chop down across the body, standing on one leg.', load: false },
  'Single-leg stand + med ball rotation': { m: 'Ankle and hip stabilisers, obliques', ski: 'Balance against a rotating upper body.', cue: 'Stand on one leg, rotate a ball from hip to opposite shoulder.', load: true },
  'Single-leg balance, eyes closed': { m: 'Ankle stabilisers, foot muscles', ski: 'Balance without relying on your eyes, useful in flat light.', cue: 'Stand on one leg, soft knee, close your eyes for 20–30 s.', load: false },
  'Band lateral raise': { m: 'Side delts', ski: 'Shoulder endurance for poling.', cue: 'Stand on the band, raise arms to shoulder height, slowly down.', load: false },
  'Cable lateral raise': { m: 'Side delts', ski: 'Shoulder endurance for poling, with steady tension.', cue: 'Low cable across the body, raise to shoulder height.', load: true },
  'Leaning lateral raise': { m: 'Side delts', ski: 'Shoulder strength through a bigger range.', cue: 'Hold a post and lean away, raise the free arm.', load: true },
});
// Originals that also appear as swaps need a cue and a weight setting.
Object.assign(EX['Bulgarian split squat'], { cue: '3 seconds down. Front shin fairly upright to bias the glute.', load: true });
Object.assign(EX['Single-arm dumbbell row'], { cue: 'Brace on a bench and pull to the hip.', load: true });
Object.assign(EX['Hip thrust'], { cue: 'Pause 2 s at the top with your chin tucked.', load: true });
Object.assign(EX['Wall sit into ski tuck'], { cue: 'Half the time on the wall, then step off and hold a ski tuck.', load: false });

/* ---------- Sessions (from the original plan) ---------- */
const SESS = {
  M1: { t: 'Morning flow', d: '12 min',
    fmt: 'Flow through the sun salutations slowly, then go straight into the floor work. On lift days this is your warm-up.',
    ex: [
      ['Sun Salutation A', '× 4', 'Inhale up, exhale fold, step back, chaturanga on the knees, cobra, down dog for 3 breaths.'],
      ['Pelvic curl', '× 10', 'Peel up one vertebra at a time and squeeze the glutes at the top.'],
      ['Imprint toe taps', '2 × 8 / side', 'Tabletop legs, keep the low back heavy on the mat.'],
      ['Clamshell', '15 / side', 'Heels together, rotate from the hip and keep the pelvis still.'],
      ['Side-lying leg lift', '15 / side', 'Toe slightly down, lead with the heel.'],
      ['Bridge march', '20 steps', 'Hips stay level as you lift each foot.'],
    ] },
  M2: { t: 'Morning flow, week 2', d: '14 min',
    fmt: 'A little more challenge. Same rhythm.',
    ex: [
      ['Sun Salutation A', '× 3', ''],
      ['Sun Salutation B', '× 2', 'Adds chair pose and warrior I. Sit low in the chair, like a ski stance.'],
      ['Single-leg pelvic curl', '8 / side', 'Keep the hips level.'],
      ['The Hundred', '× 50 pumps', 'Legs in tabletop, or extended if your back stays down.'],
      ['Side-lying leg circles', '10 each way / side', 'Small, controlled circles.'],
      ['Swimming', '3 × 20 s', 'Prone, with long opposite arm and leg flutters.'],
    ] },

  LA: { t: 'Lift A · Single leg + back & shoulders', d: '50 min', lift: true,
    fmt: 'Supersets. A1 then A2, rest 60–90 s, repeat for every set. Single-leg work comes first while you’re fresh.',
    ex: [
      ['A1', 'Bulgarian split squat', '4 × 8 / side', '3 seconds down. Front shin fairly upright to bias the glute.', true],
      ['A2', 'Single-arm dumbbell row', '4 × 10 / side', 'Brace on a bench and pull to the hip.', true],
      ['B1', 'Single-leg RDL, opposite hand', '3 × 10 / side', 'Hips square, long spine, feel the hamstring and glute.', true],
      ['B2', 'Half-kneeling overhead press', '3 × 10 / side', 'Squeeze the down-knee glute. Ribs stay down.', true],
      ['C1', 'Hip thrust', '3 × 12', 'Pause 2 s at the top with your chin tucked.', true],
      ['C2', 'Pallof press', '3 × 10 / side', 'Cable or band. Resist the rotation.', true],
      ['D1', 'Lateral step-up', '3 × 10 / side', 'The working knee tracks over the toes. Lower slowly.', true],
      ['D2', 'Face pull', '3 × 15', 'Pull to the eyes, thumbs back. Good for posture under a backpack.', true],
      ['Fin', 'Wall sit into ski tuck', '2 × 60 s', '30 s on the wall, then step off and hold a ski tuck for 30 s.', false],
    ] },
  LB: { t: 'Lift B · Glutes + agility & stability', d: '50 min', lift: true,
    fmt: 'Supersets again. B2 is the agility piece: quality landings, not volume.',
    ex: [
      ['A1', 'Step-up, high box', '4 × 8 / side', 'Drive through the heel, no push from the back foot.', true],
      ['A2', 'Lat pulldown', '4 × 10', 'Lead with the elbows.', true],
      ['B1', 'Cossack squat', '3 × 6 / side', 'Hold a light plate as a counterweight if needed.', true],
      ['B2', 'Skater bound, stick it', '3 × 5 / side', 'Leap sideways, land on one leg, freeze for 2 s.', false],
      ['C1', 'B-stance hip thrust', '3 × 10 / side', 'Most of the load goes through the front leg.', true],
      ['C2', 'Copenhagen plank, short lever', '3 × 20 s / side', 'Inner-thigh strength protects the knees on skis.', false],
      ['D1', 'Single-leg stand + cable chop', '3 × 8 / side', 'Stand on a pad if you have one. High-to-low chop.', true],
      ['D2', 'Lateral raise', '3 × 12', 'Slow down, no swinging.', true],
      ['Fin', 'Ski tuck with weight shifts', '2 × 45 s', 'Shift edge to edge, like linking turns.', false],
    ] },
  LA2: { t: 'Lift A · Week 2', d: '50 min', lift: true,
    fmt: 'Same supersets as week 1. Add a little weight to A1 and C1 if last week felt solid. D1 changes to lateral bounds.',
    ex: [
      ['A1', 'Bulgarian split squat', '4 × 8 / side', 'Same tempo, slightly heavier.', true],
      ['A2', 'Single-arm dumbbell row', '4 × 10 / side', '', true],
      ['B1', 'Single-leg RDL', '3 × 10 / side', '', true],
      ['B2', 'Half-kneeling overhead press', '3 × 10 / side', '', true],
      ['C1', 'Hip thrust', '3 × 10', 'Heavier, still with a 2 s pause.', true],
      ['C2', 'Pallof press with a step out', '3 × 8 / side', 'Press, then step sideways while holding.', true],
      ['D1', 'Lateral bound to stick', '3 × 5 / side', 'Replaces step-ups this week.', false],
      ['D2', 'Face pull', '3 × 15', '', true],
      ['Fin', 'Wall sit into ski tuck', '2 × 75 s', '45 s on the wall, 30 s in the tuck.', false],
    ] },
  LB2: { t: 'Lift B · Week 2, taper', d: '40 min', lift: true, taper: true,
    fmt: 'About 80% of your usual weights, one set fewer. Stay sharp, don’t get sore. This is your last hard leg session.',
    ex: [
      ['A1', 'Step-up, high box', '3 × 8 / side', 'Lighter.', true],
      ['A2', 'Lat pulldown', '3 × 10', '', true],
      ['B1', 'Cossack squat', '2 × 6 / side', '', true],
      ['B2', 'Skater bound, stick it', '3 × 4 / side', 'Crisp and quick off the floor.', false],
      ['C1', 'B-stance hip thrust', '2 × 10 / side', '', true],
      ['C2', 'Copenhagen plank', '2 × 20 s / side', '', false],
      ['D1', 'Single-leg stand + cable chop', '2 × 8 / side', '', true],
      ['D2', 'Lateral raise', '2 × 12', '', true],
    ] },

  CA: { t: 'After the run · Ankles & calves', d: '6 min',
    ex: [
      ['Knee-to-wall ankle rocks', '2 × 10 / side', 'Ski boots need this ankle bend.'],
      ['Slow calf raise', '2 × 12', '3 seconds down. Helps runners’ shins and Achilles.'],
      ['Couch stretch', '45 s / side', ''],
    ] },
  MOB: { t: 'Mobility', d: '10 min',
    ex: [
      ['Knee-to-wall ankle rocks', '2 × 10 / side', ''],
      ['90/90 hip switches', '2 × 8', ''],
      ['Open-book thoracic rotation', '8 / side', ''],
      ['Figure-4 stretch', '45 s / side', ''],
    ] },

  EY: { t: 'Evening · Power yoga', d: '35 min', open: true,
    fmt: 'A strong flow with balance work. Hold each pose for 5 breaths unless noted.',
    ex: [
      ['Sun Salutation B', '× 4', 'Build heat.'],
      ['Chair pose holds', '3 × 30 s', 'Twist on the last hold.'],
      ['Warrior II, reverse warrior, extended side angle', 'flow × 3 / side', 'Front thigh low.'],
      ['Crescent lunge with twist', '5 breaths / side', ''],
      ['Warrior III', '3 × 20 s / side', 'Standing-leg balance for skiing.'],
      ['Half moon', '20 s / side', 'Use a block or wall if needed.'],
      ['Boat pose', '3 × 30 s', ''],
      ['Pigeon', '90 s / side', ''],
      ['Savasana', '3 min', ''],
    ] },
  EP: { t: 'Evening · Pilates, intense', d: '30 min', open: true,
    fmt: 'Continuous mat work. Move slowly with the breath and keep a deep core connection throughout.',
    ex: [
      ['The Hundred', '× 100', ''],
      ['Roll-up', '× 8', 'Bend the knees if your feet lift.'],
      ['Single-leg stretch + criss-cross', '× 10 / side each', ''],
      ['Teaser prep', '3 × 5', ''],
      ['Side-lying series', '10 each / side', 'Front and back kicks, lifts, circles.'],
      ['Swimming', '3 × 30 s', ''],
      ['Leg pull front', '3 × 6 / side', 'Plank with a leg lift.'],
      ['Side plank star', '3 × 15 s / side', 'Top leg lifted.'],
      ['Shoulder bridge, single leg', '8 / side', 'Kick the leg up and lower it with control.'],
    ] },
  ER: { t: 'Evening · Restorative yoga', d: '20 min', open: true,
    fmt: 'No effort, just hold each shape and breathe.',
    ex: [
      ["Child's pose", '2 min', ''],
      ['Supine twist', '90 s / side', ''],
      ['Figure-4 on your back', '90 s / side', ''],
      ['Reclined bound angle', '3 min', ''],
      ['Legs up the wall', '5 min', 'A good way to wind down the night before skiing.'],
    ] },
};

/* ---------- Walk–run ladder ---------- */
// [run minutes, walk minutes, repeats]. Rungs 1–3 are the ladder; Run 4 is the Day 14 shake-out.
const LADDER = [[1, 1.5, 8], [1.5, 1, 8], [2, 1, 7]];
const SHAKEOUT = [1.5, 1, 6];
const WARMUP_MIN = 5;
const COOLDOWN_MIN = 5;

/* ---------- The 14 days ---------- */
// main: session keys; { run: n } is a run on planned rung n (0-based); { tennis: true } is a tennis block.
const DAYS = [
  { t: 'Lift A', w: 'Single-leg strength with back and shoulders. The morning flow is your warm-up.', am: 'M1', main: ['LA'] },
  { t: 'Run 1', w: 'The first walk–run. It’s meant to feel too easy.', am: 'M1', main: [{ run: 0 }, 'CA'] },
  { t: 'Rest + power yoga', w: 'No training in the day. In the evening, a strong yoga flow with balance work.', am: 'M1', main: [], pm: 'EY' },
  { t: 'Lift B', w: 'Glutes, agility and stability. Land the bounds carefully.', am: 'M1', main: ['LB'] },
  { t: 'Rest + Pilates', w: 'No training in the day. In the evening, a full Pilates mat session.', am: 'M1', main: [], pm: 'EP' },
  { t: 'Tennis', w: 'Tennis is your lateral agility work. Open your hips afterwards.', am: 'M1', main: [{ tennis: 'Tennis', n: 'Play as normal.' }, 'MOB'] },
  { t: 'Run 2', w: 'Longer run intervals, shorter walk breaks. Repeat Run 1 if your shins or knees talked back.', am: 'M1', main: [{ run: 1 }, 'CA'] },
  { t: 'Lift A, week 2', w: 'A little heavier, and lateral bounds come in.', am: 'M2', main: ['LA2'] },
  { t: 'Run 3', w: 'Two-minute run intervals, the biggest run of the plan. Stay conversational.', am: 'M2', main: [{ run: 2 }, 'CA'] },
  { t: 'Rest + Pilates', w: 'No training in the day. In the evening, a full Pilates mat session.', am: 'M2', main: [], pm: 'EP' },
  { t: 'Lift B, taper', w: 'Lighter, crisp, and your last hard leg session.', am: 'M2', main: ['LB2'] },
  { t: 'Rest + power yoga', w: 'No training in the day. In the evening, a yoga flow. Ease off the chair holds if your legs feel heavy.', am: 'M2', main: [], pm: 'EY' },
  { t: 'Easy tennis', w: 'Optional. Rally rather than compete.', am: 'M2', main: [{ tennis: 'Easy tennis (optional)', n: 'Keep it light, legs are tapering.' }, 'MOB'] },
  { t: 'Shake-out + restore', w: 'A short, easy run, then wind down. Pack your boots and sleep early.', am: 'M2', main: [{ run: 'shakeout' }], pm: 'ER' },
];
const DAY15 = 'Day 15 is your first ski day. Do the morning flow, ease into your first two runs, then go.';

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
