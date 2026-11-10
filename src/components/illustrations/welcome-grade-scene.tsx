/** Welcome reference: two companions holding a tilted academic record. */
export function WelcomeGradeScene() {
  return <svg className="v2-welcome-scene" viewBox="0 0 520 500" aria-hidden="true" focusable="false">
    <g fill="currentColor" opacity=".08"><ellipse cx="104" cy="354" rx="56" ry="10"/><ellipse cx="337" cy="444" rx="76" ry="11"/><ellipse cx="449" cy="433" rx="52" ry="10"/></g>
    <g transform="rotate(12 281 239)" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M155 55Q276 48 391 61Q395 61 395 65V421Q395 425 391 425H155Q151 425 151 421V59Q151 55 155 55Z"/>
      <text x="174" y="96" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif" fontSize="14" letterSpacing="4">MY GRADES</text>
      <path d="M170 116h206M339 116v284M171 400h205" strokeWidth="1.5"/>
      {[142,186,230,274,318,362].map(y => <g key={y} strokeWidth="1.5">
        <circle cx="183" cy={y} r="8"/>
        <path d={`M205 ${y + 2}h${y === 230 || y === 318 ? 58 : 72}M352 ${y + 2}h17`}/>
        {y < 362 && <path d={`M171 ${y + 23}h205`}/>}
      </g>)}
    </g>
    <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M89 293q5 32-17 47l8 10M119 301l-6 42 15 4M148 244Q169 232 162 206M59 264Q34 278 42 304"/>
      <path d="M418 379l-21 39-14-4M442 384q0 25 18 43l-11 6M403 324q-29-8-30-37M469 352q21 15 20 39"/>
    </g>
    <g transform="rotate(-15 106 258)">
      <rect x="57" y="207" width="99" height="101" rx="20" fill="#3975F6"/>
      <g fill="#142044"><ellipse cx="94" cy="247" rx="3" ry="5"/><ellipse cx="116" cy="247" rx="3" ry="5"/></g>
      <path d="M96 263q10 12 21 0" fill="none" stroke="#142044" strokeWidth="3.5" strokeLinecap="round"/>
    </g>
    <circle cx="436" cy="338" r="53" fill="#FF8046"/>
    <g fill="#142044"><ellipse cx="424" cy="326" rx="3" ry="5"/><ellipse cx="446" cy="326" rx="3" ry="5"/></g>
    <path d="M425 342q10 13 21 0" fill="none" stroke="#142044" strokeWidth="3.5" strokeLinecap="round"/>
    <g fill="currentColor"><circle cx="162" cy="206" r="5"/><circle cx="42" cy="304" r="5"/><circle cx="373" cy="287" r="6"/><circle cx="489" cy="391" r="6"/></g>
    <g fill="none" strokeLinecap="round" strokeWidth="4"><path d="m102 181-9-12m30 3-4-16" stroke="var(--v2-orange)"/><path d="m362 35-4-22m19 27 12-24m0 36 23-10" stroke="currentColor"/></g>
    <path d="M103 470q36 6 62-35m-15 3 16-5-1 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
