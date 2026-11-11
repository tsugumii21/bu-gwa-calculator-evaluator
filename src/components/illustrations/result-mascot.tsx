type Point = readonly [number, number];
type Pose = {
  id: string; blue: string; coral: string; legs: string; arms: string;
  hands: readonly Point[]; expression: 'joy' | 'proud' | 'calm';
};

const POSES: readonly Pose[] = [
  { id: 'pl-high-five', blue: 'translate(62 76) rotate(-8 39 42)', coral: 'translate(223 78) rotate(8 43 42)',
    legs: 'M83 159l-7 42-14 3m44-45 14 35 13-4m116-30-12 39-13 3m50-42 13 39 14 2',
    arms: 'M63 119q-22 4-24 27m102-26q25-2 39-52m44 53q-29-5-44-53m139 58q15 4 19 24', hands: [[39,146],[180,68],[338,150]], expression: 'joy' },
  { id: 'pl-trophy-lift', blue: 'translate(58 101) rotate(-5 39 42)', coral: 'translate(225 100) rotate(5 43 42)',
    legs: 'M78 184l-7 26-14 2m43-28 12 26 13 1m131-28-9 27-13 2m50-29 10 27 13 1',
    arms: 'M59 142q-20-8-20-26m99 26q22-21 22-52m66 52q-26-17-26-52m116 54q20-4 21-28', hands: [[39,116],[160,90],[200,90],[337,116]], expression: 'joy' },
  { id: 'pl-star-celebration', blue: 'translate(49 90) rotate(-6 39 42)', coral: 'translate(233 89) rotate(6 43 42)',
    legs: 'M70 173l-8 35-13 3m44-38 13 34 14 3m140-37-9 35-13 3m50-39 13 35 14 1',
    arms: 'M50 132q-18-3-23-24m101 25q16 2 29-13m74 12q-17 1-27-12m115 16q14-2 19-25', hands: [[27,108],[157,120],[204,120],[338,111]], expression: 'joy' },
  { id: 'pl-victory-flag', blue: 'translate(61 88) rotate(-5 39 42)', coral: 'translate(228 94) rotate(5 43 42)',
    legs: 'M83 171l-8 34-15 3m43-37 13 35 14 1m137-29-11 29-13 2m49-31 12 29 14 1',
    arms: 'M62 129q-22-8-25-32m102 33q20 2 34-1m52 9q-25 19-35 20m124-23q19 2 23 22', hands: [[37,97],[173,129],[190,158],[337,157]], expression: 'joy' },
  { id: 'pl-joyful-jump', blue: 'translate(65 57) rotate(-12 39 42)', coral: 'translate(223 53) rotate(12 43 42)',
    legs: 'M82 141q-18 17-34 15l-4 10m61-23 7 25 20 7m119-39-12 29-17 5m48-36q23 19 39 13l6 10',
    arms: 'M67 96q-27-8-30-35m106 43q16-12 24-29m57 22q-23-5-30-24m119 26q22-16 25-43', hands: [[37,61],[167,75],[194,73],[338,56]], expression: 'joy' },
  { id: 'dl-medal', blue: 'translate(54 89) rotate(-4 39 42)', coral: 'translate(231 89) rotate(4 43 42)',
    legs: 'M76 172l-7 35-14 3m44-38 12 35 14 2m135-36-9 34-14 3m51-37 12 34 14 2',
    arms: 'M55 130q-20 8-18 29m97-27q18 8 15 27m82-29q-15 6-17 25m104-23q17 6 17 28', hands: [[37,159],[149,159],[214,155],[335,160]], expression: 'proud' },
  { id: 'dl-proud-grade-sheet', blue: 'translate(52 98) rotate(-6 39 42)', coral: 'translate(233 94) rotate(6 43 42)',
    legs: 'M73 181l-7 27-14 3m43-30 13 28 13 1m141-32-10 29-14 3m51-32 12 29 14 2',
    arms: 'M53 140q-17 1-20 23m98-23q10 3 20-3m82 0q-10 6-19 0m105 1q18 0 18 24', hands: [[33,163],[151,137],[214,137],[337,162]], expression: 'proud' },
  { id: 'dl-shared-star', blue: 'translate(61 76) rotate(4 39 42)', coral: 'translate(224 75) rotate(-4 43 42)',
    legs: 'M82 160l-7 45-14 3m44-48 13 44 13 3m122-46-10 44-14 3m51-47 12 44 14 2',
    arms: 'M62 117q-20 12-19 32m96-31q9 25 27 37m59-38q-7 30-24 38m111-38q20 11 20 31', hands: [[43,149],[166,155],[201,155],[332,148]], expression: 'joy' },
  { id: 'dl-milestone-step', blue: 'translate(53 95) rotate(-5 39 42)', coral: 'translate(233 63) rotate(-5 43 42)',
    legs: 'M74 178l-7 33-14 2m44-35q16 7 26 4l1 13m139-48-7 30-13 3m48-33 10 30 13 2',
    arms: 'M54 137q-16 6-21 27m99-29q17-15 27-16m74-14q-21-12-28 3m111-4q16-2 22-19', hands: [[33,164],[159,119],[205,108],[338,85]], expression: 'proud' },
  { id: 'dl-fist-bump', blue: 'translate(60 86) rotate(4 39 42)', coral: 'translate(224 85) rotate(-4 43 42)',
    legs: 'M81 169l-8 37-14 3m44-40 13 37 14 2m123-37-10 35-14 3m51-38 12 35 14 2',
    arms: 'M61 128q-19 8-18 31m96-31q18-9 35 5m50-6q-17-8-38 6m125-4q20 7 20 30', hands: [[43,159],[174,133],[186,133],[331,159]], expression: 'joy' },
  { id: 'support-study-partners', blue: 'translate(51 91) rotate(5 39 42)', coral: 'translate(233 93) rotate(-5 43 42)',
    legs: 'M74 175l-7 34-14 2m44-36 13 33 14 2m139-32-10 29-14 3m51-32 12 30 13 1',
    arms: 'M52 133q-17 4-17 25m98-25q12 20 14 30m85-30q-13 17-17 30m104-30q15 8 14 27', hands: [[35,158],[147,163],[215,163],[333,160]], expression: 'calm' },
  { id: 'support-shoulder', blue: 'translate(70 87) rotate(-3 39 42)', coral: 'translate(193 101) rotate(3 43 42)',
    legs: 'M91 170l-7 37-14 3m44-40 13 37 14 2m83-23-9 22-13 3m50-24 13 22 13 2',
    arms: 'M71 129q-18 8-18 32m96-32q9-42 47-5m-2 20q-20 12-23 26m112-28q16 8 17 28', hands: [[53,161],[196,124],[171,170],[300,170]], expression: 'calm' },
  { id: 'support-calendar-plan', blue: 'translate(51 91) rotate(-5 39 42)', coral: 'translate(233 92) rotate(5 43 42)',
    legs: 'M72 174l-7 35-14 3m44-38 13 36 14 1m141-34-10 31-14 3m51-34 12 32 13 1',
    arms: 'M52 132q-19-1-22 20m99-20q10 3 16 9m88-8q-7 6-15 8m102-6q17 5 17 25', hands: [[30,152],[145,141],[218,141],[337,160]], expression: 'proud' },
  { id: 'support-building-progress', blue: 'translate(52 92) rotate(5 39 42)', coral: 'translate(232 84) rotate(-6 43 42)',
    legs: 'M73 177l-7 33-14 2m44-35 13 32 13 2m140-40-9 37-14 3m50-40 12 37 13 2',
    arms: 'M53 134q-18 7-18 27m98-27q16 14 26 24m73-33q-13 1-27-2m113 4q18-1 20-22', hands: [[35,161],[159,158],[205,123],[338,105]], expression: 'proud' },
  { id: 'support-hopeful-sunrise', blue: 'translate(53 96) rotate(-5 39 42)', coral: 'translate(231 95) rotate(5 43 42)',
    legs: 'M74 179l-7 29-14 3m44-32 13 29 13 2m138-30-9 28-14 3m50-31 12 29 13 1',
    arms: 'M54 137q-22-1-26-22m104 21q17 11 27 7m73-6q-16 12-28 6m114-5q16 1 21-21', hands: [[28,115],[159,143],[204,143],[339,117]], expression: 'calm' },
];

/** Fifteen native companion scenes in the same visual language as the website artwork. */
export function ResultMascot({ moment, className = 'result-mascot' }: { moment: number; className?: string }) {
  const index = Number.isInteger(moment) && moment >= 0 && moment < POSES.length ? moment : 10;
  const pose = POSES[index];
  return <svg className={className} viewBox="0 0 360 240" aria-hidden="true" focusable="false" data-result-pose={pose.id}>
    <g strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="181" cy="218" rx="145" ry="7" fill="currentColor" opacity=".07" />
      <BackgroundObjects index={index} />
      <path d={pose.legs} stroke="currentColor" strokeWidth="3.5" fill="none" />
      <g transform={pose.blue}><Companion expression={pose.expression} /></g>
      <g transform={pose.coral}><Companion isRound expression={pose.expression} /></g>
      <ForegroundObjects index={index} />
      <path d={pose.arms} stroke="currentColor" strokeWidth="3.5" fill="none" />
      <g fill="currentColor" data-round-hands="true">{pose.hands.map(([cx, cy], hand) => <circle key={hand} cx={cx} cy={cy} r="4.5" />)}</g>
    </g>
  </svg>;
}

function Companion({ isRound = false, expression }: { isRound?: boolean; expression: Pose['expression'] }) {
  return <g>
    {isRound ? <circle cx="43" cy="42" r="46" fill="var(--result-art-coral, #ff8e70)" />
      : <rect width="78" height="84" rx="18" fill="var(--result-art-blue, #3975f6)" />}
    <g transform={isRound ? 'translate(4 0)' : undefined} stroke="var(--result-art-face, #142044)" strokeWidth="3.5">
      {expression === 'joy' ? <g fill="none"><path d="M22 32q5-10 10 0m15 0q5-10 10 0" /><path d="M29 47q10 18 21 0Z" fill="var(--result-art-face, #142044)" strokeWidth="2" /></g>
        : <g><g fill="var(--result-art-face, #142044)" stroke="none"><ellipse cx="27" cy="32" rx="2.8" ry="4.5" /><ellipse cx="52" cy="32" rx="2.8" ry="4.5" /></g><path d={expression === 'proud' ? 'M28 48q12 14 23 0' : 'M30 49q10 9 20 0'} fill="none" /></g>}
    </g>
  </g>;
}

function Rays({ x = 180, y = 50 }: { x?: number; y?: number }) {
  return <path d={`M${x} ${y}v-12m-13 17-7-10m33 10 7-10`} fill="none" stroke="var(--result-art-gold, #ffcf65)" strokeWidth="4" />;
}

function Star({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="m0-27 8 17 19 3-14 14 3 19-16-9-17 9 4-19-14-14 19-3Z" fill="var(--result-art-gold, #ffcf65)" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2.5" />;
}

function BackgroundObjects({ index }: { index: number }) {
  if (index === 8) return <g fill="var(--result-art-blue, #3975f6)" opacity=".16"><path d="M144 216v-19h76v-19h94v38Z" /></g>;
  if (index === 14) return <g>
    <path d="M145 85a37 37 0 0 1 74 0Z" fill="var(--result-art-gold, #ffcf65)" />
    <path d="M132 85h100m-50-48V25m-27 19-8-9m63 9 8-9" stroke="var(--result-art-gold, #ffcf65)" strokeWidth="3" fill="none" />
  </g>;
  return index < 5 || index === 7 || index === 9 ? <Rays y={index === 4 ? 33 : index === 1 ? 32 : 48} /> : null;
}

function ForegroundObjects({ index }: { index: number }) {
  switch (index) {
    case 1: return <Trophy />;
    case 2: return <Star x={181} y={105} />;
    case 3: return <g stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2.5"><path d="M173 56v131" /><path d="m174 58 56 7-14 16 10 14-52-6Z" fill="var(--result-art-coral, #ff8e70)" /></g>;
    case 4: return <g fill="var(--result-art-gold, #ffcf65)"><path d="m53 195 4-9 4 9 9 4-9 4-4 9-4-9-9-4Z" /><path d="m304 186 3-6 3 6 6 3-6 3-3 6-3-6-6-3Z" /></g>;
    case 5: return <Medals />;
    case 6: return <GradeSheet />;
    case 7: return <Star x={184} y={157} scale={.8} />;
    case 8: return <path d="m172 78 5 6 10-13" fill="none" stroke="var(--result-art-gold, #ffcf65)" strokeWidth="4" />;
    case 9: return <path d="m180 112 0-9m-5 14-7-6m17 6 7-6" fill="none" stroke="var(--result-art-gold, #ffcf65)" strokeWidth="3" />;
    case 10: return <OpenBook />;
    case 11: return <path d="M159 69q-5-10-12-4-7 9 12 20 19-11 12-20-7-6-12 4Z" fill="var(--result-art-coral, #ff8e70)" />;
    case 12: return <Calendar />;
    case 13: return <ProgressBlocks />;
    default: return null;
  }
}

function Trophy() {
  return <g stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2.5">
    <path d="M160 59h-13v16q0 15 18 13m35-29h13v16q0 15-18 13" fill="none" />
    <path d="M157 52h46v22q0 24-23 24t-23-24Z" fill="var(--result-art-gold, #ffcf65)" />
    <path d="M180 98v18m-14 0h28l3 8h-34Z" fill="var(--result-art-gold, #ffcf65)" />
    <path d="m174 73 5 5 9-11" fill="none" />
  </g>;
}

function Medals() {
  return <g>
    <path d="m79 150 14 18 15-18m149 0 16 18 15-18" stroke="var(--result-art-paper, #fff)" strokeWidth="5" fill="none" />
    <g fill="var(--result-art-gold, #ffcf65)" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="1.5"><circle cx="93" cy="170" r="9" /><circle cx="273" cy="170" r="9" /></g>
    <path d="m89 169 3 3 5-6m172 3 3 3 5-6" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="1.5" fill="none" />
  </g>;
}

function GradeSheet() {
  return <g transform="rotate(4 183 128)">
    <rect x="151" y="76" width="65" height="100" rx="7" fill="var(--result-art-paper, #fff)" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2" />
    <path d="M165 98h36m-36 27h36m-36 17h25m-25 17h31" fill="none" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2" />
    <circle cx="183" cy="110" r="7" fill="var(--result-art-blue, #3975f6)" />
    <path d="m180 110 2 2 4-5" fill="none" stroke="var(--result-art-paper, #fff)" strokeWidth="1.5" />
  </g>;
}

function OpenBook() {
  return <g>
    <path d="m139 151 41 9 42-9v39l-42 9-41-9Z" fill="var(--result-art-paper, #fff)" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2" />
    <path d="M180 161v37m-30-35 21 5m-21 5 21 5m18-10 23-5m-23 15 23-5" fill="none" stroke="var(--result-art-ink, #4b4e55)" strokeWidth="1.7" />
    <path d="m140 189 40 10 42-10v7l-42 10-40-10Z" fill="var(--result-art-blue, #3975f6)" />
  </g>;
}

function Calendar() {
  return <g stroke="var(--result-art-ink, #4b4e55)" strokeWidth="2">
    <rect x="145" y="97" width="73" height="91" rx="7" fill="var(--result-art-paper, #fff)" />
    <path d="M146 117h71m-55-26v13m39-13v13" fill="none" strokeWidth="3" />
    <path d="M160 132h42m-42 17h42m-42 17h42m-30-34v37m15-37v37" opacity=".35" fill="none" />
    <rect x="178" y="143" width="15" height="16" rx="3" stroke="none" fill="var(--result-art-coral, #ff8e70)" />
    <path d="m181 150 3 3 6-7" fill="none" strokeWidth="1.5" />
  </g>;
}

function ProgressBlocks() {
  return <g stroke="var(--result-art-ink, #4b4e55)" strokeWidth="1.5">
    <rect x="144" y="174" width="29" height="32" rx="4" fill="var(--result-art-blue, #3975f6)" />
    <rect x="174" y="151" width="29" height="55" rx="4" fill="var(--result-art-coral, #ff8e70)" />
    <rect x="204" y="130" width="29" height="76" rx="4" fill="var(--result-art-gold, #ffcf65)" />
    <rect x="197" y="102" width="22" height="22" rx="4" fill="var(--result-art-blue, #3975f6)" />
    <path d="m169 72 11-13 11 13m-11-13v30" stroke="var(--result-art-gold, #ffcf65)" strokeWidth="3" fill="none" />
  </g>;
}
