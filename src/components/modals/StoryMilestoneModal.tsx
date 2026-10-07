import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats, calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { evaluateTermHonor, evaluateHonorStanding } from '../../core/honor-rules';

interface StoryMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type StoryTheme =
  | 'bu-prestige'
  | 'cyber-bueno'
  | 'ivory-minimal'
  | 'mayon-sunset'
  | 'emerald-scholar'
  | 'aurora-albay'
  | 'velvet-crimson'
  | 'golden-horizon'
  | 'pastel-breeze';

export type StoryFont =
  | 'outfit-display'
  | 'inter-clean'
  | 'serif-academic'
  | 'varsity-bold'
  | 'luxury-editorial'
  | 'tech-mono'
  | 'soft-rounded'
  | 'condensed-dramatic';

export type StoryLayout =
  | 'wrapped-bento'
  | 'canva-luxury'
  | 'mayon-sunset'
  | 'cyber-bueno'
  | 'boarding-pass';

const THEME_OPTIONS: { id: StoryTheme; label: string; bg1: string; bg2: string; accent: string; text: string }[] = [
  { id: 'bu-prestige', label: 'BU Prestige', bg1: '#070d24', bg2: '#131e4e', accent: '#f59e0b', text: '#ffffff' },
  { id: 'cyber-bueno', label: 'Cyber Bueño', bg1: '#050811', bg2: '#0b1329', accent: '#38bdf8', text: '#ffffff' },
  { id: 'ivory-minimal', label: 'Ivory Minimal', bg1: '#f8fafc', bg2: '#f1f5f9', accent: '#1e3a8a', text: '#0f172a' },
  { id: 'mayon-sunset', label: 'Mayon Sunset', bg1: '#2e1065', bg2: '#701a75', accent: '#f59e0b', text: '#ffffff' },
  { id: 'emerald-scholar', label: 'Emerald Scholar', bg1: '#022c22', bg2: '#064e3b', accent: '#34d399', text: '#ffffff' },
  { id: 'aurora-albay', label: 'Aurora Albay', bg1: '#042f2e', bg2: '#0f172a', accent: '#2dd4bf', text: '#ffffff' },
  { id: 'velvet-crimson', label: 'Velvet Crimson', bg1: '#3b0716', bg2: '#1e1b4b', accent: '#f43f5e', text: '#ffffff' },
  { id: 'golden-horizon', label: 'Golden Horizon', bg1: '#1c1917', bg2: '#292524', accent: '#eab308', text: '#ffffff' },
  { id: 'pastel-breeze', label: 'Pastel Breeze', bg1: '#1e3a8a', bg2: '#6d28d9', accent: '#67e8f9', text: '#ffffff' },
];

const FONT_OPTIONS: { id: StoryFont; label: string; family: string }[] = [
  { id: 'outfit-display', label: 'Outfit Display', family: "'Outfit', sans-serif" },
  { id: 'inter-clean', label: 'Inter Clean', family: "'Inter', sans-serif" },
  { id: 'luxury-editorial', label: 'Canva Luxury', family: "'Playfair Display', Georgia, serif" },
  { id: 'tech-mono', label: 'Cyber Monospace', family: "'Space Mono', monospace" },
  { id: 'varsity-bold', label: 'Athletic Varsity', family: "Impact, 'Outfit', sans-serif" },
  { id: 'serif-academic', label: 'Classic Serif', family: "Georgia, 'Times New Roman', serif" },
  { id: 'soft-rounded', label: 'Soft Rounded', family: "'Trebuchet MS', 'Outfit', sans-serif" },
  { id: 'condensed-dramatic', label: 'Dramatic Condensed', family: "'Arial Narrow', 'Outfit', sans-serif" },
];

const LAYOUT_OPTIONS: { id: StoryLayout; label: string; icon: string }[] = [
  { id: 'wrapped-bento', label: 'Wrapped Bento', icon: 'fa-cubes' },
  { id: 'canva-luxury', label: 'Canva Luxury', icon: 'fa-certificate' },
  { id: 'mayon-sunset', label: 'Mayon Dusk', icon: 'fa-mountain' },
  { id: 'cyber-bueno', label: 'Cyber Tech', icon: 'fa-microchip' },
  { id: 'boarding-pass', label: 'Swiss Ticket', icon: 'fa-ticket' },
];

// Helper: Rounded Rectangle
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

// Helper: Hand-crafted Golden Laurel Wreath
function drawLaurelWreath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(cx - 24, cy, rx, 0.45 * Math.PI, 1.55 * Math.PI, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + 24, cy, rx, 1.45 * Math.PI, 0.55 * Math.PI, false);
  ctx.stroke();

  const numLeaves = 9;
  for (let i = 0; i < numLeaves; i++) {
    const t = i / (numLeaves - 1);
    const aL = 0.5 * Math.PI + t * Math.PI;
    const lx = cx - 24 + Math.cos(aL) * rx;
    const ly = cy + Math.sin(aL) * rx;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(aL + Math.PI / 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const aR = 0.5 * Math.PI - t * Math.PI;
    const rxP = cx + 24 + Math.cos(aR) * rx;
    const ryP = cy + Math.sin(aR) * rx;
    ctx.save();
    ctx.translate(rxP, ryP);
    ctx.rotate(aR - Math.PI / 4);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(cx, cy + rx - 5, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Helper: Realistic Parabolic Mayon Volcano
function drawMayonVolcano(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  peakY: number
) {
  ctx.save();
  const peakX = width / 2;
  const baseY = height;

  const mtnGrad = ctx.createLinearGradient(0, peakY, 0, baseY);
  mtnGrad.addColorStop(0, 'rgba(15, 23, 42, 0.96)');
  mtnGrad.addColorStop(0.5, 'rgba(10, 15, 30, 0.98)');
  mtnGrad.addColorStop(1, '#050710');

  ctx.fillStyle = mtnGrad;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(0, peakY + (baseY - peakY) * 0.72);
  ctx.quadraticCurveTo(peakX - 320, peakY + 180, peakX - 28, peakY + 16);
  ctx.lineTo(peakX + 28, peakY + 16);
  ctx.quadraticCurveTo(peakX + 320, peakY + 180, width, peakY + (baseY - peakY) * 0.72);
  ctx.lineTo(width, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(peakX - 180, peakY + 95);
  ctx.quadraticCurveTo(peakX - 60, peakY + 28, peakX - 28, peakY + 16);
  ctx.lineTo(peakX + 28, peakY + 16);
  ctx.quadraticCurveTo(peakX + 60, peakY + 28, peakX + 180, peakY + 95);
  ctx.stroke();

  const mist = ctx.createLinearGradient(0, baseY - 240, 0, baseY);
  mist.addColorStop(0, 'transparent');
  mist.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  ctx.fillStyle = mist;
  ctx.fillRect(0, baseY - 240, width, 240);
  ctx.restore();
}

// Helper: Procedural Barcode
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  code: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  let curX = x;
  for (let i = 0; i < code.length * 4; i++) {
    const val = (code.charCodeAt(i % code.length) * (i + 3)) % 11;
    const barW = (val % 3) + 2;
    const gap = (val % 2) + 2;
    if (curX + barW > x + w) break;
    ctx.fillRect(curX, y, barW, h);
    curX += barW + gap;
  }
  ctx.restore();
}

export const StoryMilestoneModal: React.FC<StoryMilestoneModalProps> = ({ isOpen, onClose }) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const stats = calculateCumulativeStats(semesters);

  const [studentName, setStudentName] = useState<string>('Bueño Student');
  const [collegeDept, setCollegeDept] = useState<string>('Bicol University');
  const [selectedSemIndex, setSelectedSemIndex] = useState<number>(-1); // -1 = Overall Cumulative
  const [theme, setTheme] = useState<StoryTheme>('bu-prestige');
  const [font, setFont] = useState<StoryFont>('outfit-display');
  const [layout, setLayout] = useState<StoryLayout>('wrapped-bento');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine current evaluation data
  const cardData = useMemo(() => {
    if (selectedSemIndex >= 0 && selectedSemIndex < semesters.length) {
      const sem = semesters[selectedSemIndex];
      const gpa = calculateSemesterGWA(sem);
      const units = calculateSemesterUnits(sem);
      const honor = evaluateTermHonor(gpa, sem.subjects, sem.underload);
      return {
        title: sem.title,
        gwa: gpa > 0 ? gpa.toFixed(4) : '1.0000',
        units: `${units} Units`,
        honorTitle: honor.level === 'president' ? "President's Lister" : honor.level === 'dean' ? "Dean's Lister" : 'Academic Achiever',
        honorSubtitle: honor.label,
        type: 'Semestral Performance',
      };
    }

    const latin = evaluateHonorStanding(stats);
    return {
      title: 'Overall Cumulative Standing',
      gwa: stats.cumulativeGWA > 0 ? stats.cumulativeGWA.toFixed(4) : '1.0000',
      units: `${stats.gradedUnits} Total Units`,
      honorTitle: latin.level === 'summa' ? 'Summa Cum Laude Pace' : latin.level === 'magna' ? 'Magna Cum Laude Pace' : latin.level === 'cum-laude' ? 'Cum Laude Pace' : 'Bueño Scholar Standing',
      honorSubtitle: latin.label,
      type: 'Cumulative GWA Record',
    };
  }, [selectedSemIndex, semesters, stats]);

  // Render to Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    const themeConfig = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
    const fontConfig = FONT_OPTIONS.find((f) => f.id === font) || FONT_OPTIONS[0];
    const ff = fontConfig.family;

    // Reset shadow & styles
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // ==========================================
    // LAYOUT 1: WRAPPED BENTO (Spotify Wrapped & Bento Pods)
    // ==========================================
    if (layout === 'wrapped-bento') {
      // 1. Base Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, themeConfig.bg1);
      bgGrad.addColorStop(1, themeConfig.bg2);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Glowing Ambient Orbs
      const glow1 = ctx.createRadialGradient(880, 360, 40, 880, 360, 640);
      glow1.addColorStop(0, `${themeConfig.accent}3d`);
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(180, 1460, 40, 180, 1460, 560);
      glow2.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // 2. Top Pill Badge
      drawRoundRect(ctx, width / 2 - 290, 120, 580, 56, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = themeConfig.text;
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('✦ BICOL UNIVERSITY • ACADEMIC WRAPPED ✦', width / 2, 155);

      // 3. Student Identity Glass Bar
      drawRoundRect(ctx, 80, 215, 920, 150, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Avatar circle
      ctx.beginPath();
      ctx.arc(165, 290, 46, 0, Math.PI * 2);
      ctx.fillStyle = `${themeConfig.accent}22`;
      ctx.fill();
      ctx.strokeStyle = themeConfig.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = themeConfig.accent;
      ctx.font = `bold 42px ${ff}`;
      ctx.fillText((studentName || 'B')[0].toUpperCase(), 165, 305);

      // Name & Dept
      ctx.textAlign = 'left';
      ctx.fillStyle = themeConfig.text;
      ctx.font = `bold 48px ${ff}`;
      ctx.fillText(studentName || 'Bueño Student', 240, 280);

      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `500 28px ${ff}`;
      ctx.fillText(collegeDept || 'Bicol University', 240, 322);

      // Scope Tag
      drawRoundRect(ctx, 720, 260, 245, 52, 14);
      ctx.fillStyle = `${themeConfig.accent}26`;
      ctx.fill();
      ctx.strokeStyle = themeConfig.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = themeConfig.accent;
      ctx.font = `700 22px ${ff}`;
      ctx.fillText(cardData.type === 'Semestral Performance' ? 'TERM GPA' : 'CUMULATIVE', 842, 293);

      // 4. Hero GWA Bento Pod
      drawRoundRect(ctx, 80, 400, 920, 600, 36);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.fill();
      ctx.strokeStyle = `${themeConfig.accent}55`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `600 26px ${ff}`;
      ctx.fillText('GENERAL WEIGHTED AVERAGE', width / 2, 475);

      // Giant GWA
      ctx.fillStyle = themeConfig.accent;
      ctx.shadowColor = `${themeConfig.accent}66`;
      ctx.shadowBlur = 28;
      ctx.font = `bold 174px ${ff}`;
      ctx.fillText(cardData.gwa, width / 2, 655);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Angled Sticker Ribbon
      ctx.save();
      ctx.translate(width / 2, 770);
      ctx.rotate(-0.035);
      drawRoundRect(ctx, -340, -42, 680, 84, 18);
      ctx.fillStyle = themeConfig.accent;
      ctx.fill();
      ctx.fillStyle = '#080d27';
      ctx.font = `800 36px ${ff}`;
      ctx.fillText(`★ ${cardData.honorTitle.toUpperCase()} ★`, 0, 13);
      ctx.restore();

      ctx.fillStyle = `${themeConfig.text}cc`;
      ctx.font = `500 28px ${ff}`;
      ctx.fillText(cardData.honorSubtitle, width / 2, 885);
      ctx.fillText(cardData.title, width / 2, 935);

      // 5. Two Side-by-Side Stat Pods
      // Left Pod: Units
      drawRoundRect(ctx, 80, 1030, 445, 240, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('ACADEMIC LOAD', 302, 1090);

      ctx.fillStyle = themeConfig.text;
      ctx.font = `bold 64px ${ff}`;
      ctx.fillText(cardData.units, 302, 1175);

      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `500 24px ${ff}`;
      ctx.fillText('Prescribed Regular Load', 302, 1225);

      // Right Pod: Deficiencies
      drawRoundRect(ctx, 555, 1030, 445, 240, 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('ACADEMIC DEFICIENCY', 777, 1090);

      ctx.fillStyle = stats.failingCount === 0 && !stats.hasInc ? '#10b981' : '#f59e0b';
      ctx.font = `bold 54px ${ff}`;
      ctx.fillText(stats.failingCount === 0 && !stats.hasInc ? 'Zero Deficiencies' : 'In Review', 777, 1175);

      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `500 24px ${ff}`;
      ctx.fillText('100% Clean Academic Record', 777, 1225);

      // 6. Mountain Silhouette Base
      drawMayonVolcano(ctx, width, height, themeConfig.accent, 1480);

      // 7. Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = `${themeConfig.text}bb`;
      ctx.font = `italic 26px ${ff}`;
      ctx.fillText('“Scholarship • Leadership • Service • Character”', width / 2, 1780);

      ctx.fillStyle = `${themeConfig.text}77`;
      ctx.font = `500 22px ${ff}`;
      ctx.fillText(`Verified via BU GWA Calculator & Academic Evaluator • ${new Date().toLocaleDateString()}`, width / 2, 1830);

    // ==========================================
    // LAYOUT 2: CANVA LUXURY (Ivy Gold Foil & Laurel Wreath)
    // ==========================================
    } else if (layout === 'canva-luxury') {
      // 1. Background
      ctx.fillStyle = themeConfig.bg1;
      ctx.fillRect(0, 0, width, height);

      // Fine Inner Framing
      ctx.strokeStyle = themeConfig.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(55, 55, width - 110, height - 110);

      ctx.strokeStyle = `${themeConfig.accent}88`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(75, 75, width - 150, height - 150);

      // Corner Flourish L-brackets
      const corners = [
        [55, 55, 30, 30],
        [width - 55, 55, -30, 30],
        [55, height - 55, 30, -30],
        [width - 55, height - 55, -30, -30],
      ];
      corners.forEach(([cx, cy, dx, dy]) => {
        ctx.strokeStyle = themeConfig.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx + dx * 2, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + dy * 2);
        ctx.stroke();
      });

      // 2. Top Header Insignia
      ctx.textAlign = 'center';
      ctx.fillStyle = themeConfig.accent;
      ctx.font = `bold 42px 'Playfair Display', Georgia, serif`;
      ctx.fillText('BICOL UNIVERSITY', width / 2, 200);

      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('OFFICIAL CERTIFICATE OF SCHOLASTIC MERIT', width / 2, 245);

      // Divider line
      ctx.strokeStyle = `${themeConfig.accent}66`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 200, 275);
      ctx.lineTo(width / 2 + 200, 275);
      ctx.stroke();

      // 3. Student Recipient
      ctx.fillStyle = `${themeConfig.text}99`;
      ctx.font = `italic 26px 'Playfair Display', Georgia, serif`;
      ctx.fillText('This officially honors and recognizes', width / 2, 360);

      ctx.fillStyle = themeConfig.text;
      ctx.font = `bold 68px 'Playfair Display', Georgia, serif`;
      ctx.fillText(studentName || 'Bueño Student', width / 2, 450);

      ctx.fillStyle = themeConfig.accent;
      ctx.font = `600 32px ${ff}`;
      ctx.fillText(collegeDept || 'Bicol University', width / 2, 510);

      // 4. Center Golden Laurel Wreath with GWA
      drawLaurelWreath(ctx, width / 2, 850, 250, themeConfig.accent);

      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `600 24px ${ff}`;
      ctx.fillText('GENERAL WEIGHTED AVERAGE', width / 2, 765);

      ctx.fillStyle = themeConfig.accent;
      ctx.shadowColor = `${themeConfig.accent}55`;
      ctx.shadowBlur = 24;
      ctx.font = `bold 164px 'Playfair Display', Georgia, serif`;
      ctx.fillText(cardData.gwa, width / 2, 920);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      ctx.fillStyle = themeConfig.text;
      ctx.font = `500 32px ${ff}`;
      ctx.fillText(`• ${cardData.units} Total Earned •`, width / 2, 990);

      // 5. Honors Ribbon Banner
      drawRoundRect(ctx, 140, 1190, 800, 92, 20);
      ctx.fillStyle = themeConfig.accent;
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold 40px 'Playfair Display', Georgia, serif`;
      ctx.fillText(`★ ${cardData.honorTitle.toUpperCase()} ★`, width / 2, 1250);

      ctx.fillStyle = `${themeConfig.text}dd`;
      ctx.font = `500 30px ${ff}`;
      ctx.fillText(cardData.honorSubtitle, width / 2, 1340);
      ctx.fillText(cardData.title, width / 2, 1390);

      // 6. Dual Official Seals at Bottom
      // Left Seal
      ctx.beginPath();
      ctx.arc(280, 1580, 75, 0, Math.PI * 2);
      ctx.strokeStyle = `${themeConfig.accent}88`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.font = `700 16px ${ff}`;
      ctx.fillStyle = themeConfig.accent;
      ctx.fillText('BICOL UNIVERSITY', 280, 1565);
      ctx.fillText('SEAL OF EXCELLENCE', 280, 1595);

      // Right Seal
      ctx.beginPath();
      ctx.arc(800, 1580, 75, 0, Math.PI * 2);
      ctx.strokeStyle = `${themeConfig.accent}88`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillText('OFFICIAL EVALUATOR', 800, 1565);
      ctx.fillText('ZERO DEFICIENCIES', 800, 1595);

      // Footer
      ctx.fillStyle = `${themeConfig.text}99`;
      ctx.font = `italic 24px 'Playfair Display', Georgia, serif`;
      ctx.fillText('“Scholarship • Leadership • Service • Character”', width / 2, 1750);
      ctx.font = `400 20px ${ff}`;
      ctx.fillText(`Recorded & Verified on ${new Date().toLocaleDateString()}`, width / 2, 1795);

    // ==========================================
    // LAYOUT 3: MAYON SUNSET DUSK (Albay Golden Hour Horizon)
    // ==========================================
    } else if (layout === 'mayon-sunset') {
      // 1. Vibrant Sunset Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.35, '#701a75');
      skyGrad.addColorStop(0.65, '#c2410c');
      skyGrad.addColorStop(0.88, '#f59e0b');
      skyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Dappled Evening Stars in upper sky
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const stars = [[140, 180], [320, 240], [820, 160], [940, 280], [480, 140], [700, 310]];
      stars.forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Realistic Parabolic Mount Mayon
      drawMayonVolcano(ctx, width, height, '#fef08a', 1140);

      // 3. Floating Frosted Sunset Glass Card
      drawRoundRect(ctx, 80, 320, 920, 740, 36);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Card Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('13.1448° N, 123.7438° E • ALBAY, PHILIPPINES', width / 2, 380);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 38px ${ff}`;
      ctx.fillText('BICOL UNIVERSITY', width / 2, 435);

      // Student Name & Dept
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 58px ${ff}`;
      ctx.fillText(studentName || 'Bueño Student', width / 2, 540);

      ctx.fillStyle = '#fde047';
      ctx.font = `500 28px ${ff}`;
      ctx.fillText(collegeDept || 'Bicol University', width / 2, 590);

      // GWA Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = `600 24px ${ff}`;
      ctx.fillText('GENERAL WEIGHTED AVERAGE', width / 2, 675);

      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 24;
      ctx.font = `bold 164px ${ff}`;
      ctx.fillText(cardData.gwa, width / 2, 830);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Sunset Tag
      drawRoundRect(ctx, 160, 890, 760, 76, 20);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 34px ${ff}`;
      ctx.fillText(`PADABA BU • ${cardData.honorTitle.toUpperCase()}`, width / 2, 940);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = `500 26px ${ff}`;
      ctx.fillText(`• ${cardData.units} Total Earned • ${cardData.title} •`, width / 2, 1020);

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = `italic 24px ${ff}`;
      ctx.fillText('“Scholarship • Leadership • Service • Character”', width / 2, 1800);

    // ==========================================
    // LAYOUT 4: CYBER BUEÑO (Tech Innovator & HUD Telemetry)
    // ==========================================
    } else if (layout === 'cyber-bueno') {
      // 1. Cyber Dark Canvas
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Subtle Tech Grid Dots
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      for (let x = 80; x < width; x += 60) {
        for (let y = 80; y < height; y += 60) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // HUD Corner Brackets
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      const bracketSize = 40;
      const bCoords = [[60, 60, 1, 1], [width - 60, 60, -1, 1], [60, height - 60, 1, -1], [width - 60, height - 60, -1, -1]];
      bCoords.forEach(([bx, by, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(bx + dx * bracketSize, by);
        ctx.lineTo(bx, by);
        ctx.lineTo(bx, by + dy * bracketSize);
        ctx.stroke();
      });

      // Top Status Bar
      ctx.font = `600 22px 'Space Mono', monospace`;
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('SYS // BU_ACADEMIC_TELEMETRY', 90, 130);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#10b981';
      ctx.fillText('STATUS: VERIFIED ●', width - 90, 130);

      // Terminal Header Box
      drawRoundRect(ctx, 80, 180, 920, 140, 16);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = `600 26px 'Space Mono', monospace`;
      ctx.fillText(`<Bueño.AcademicRecord student="${studentName}" />`, 120, 240);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = `400 24px 'Space Mono', monospace`;
      ctx.fillText(`DEPT: ${collegeDept || 'BICOL UNIVERSITY'}`, 120, 285);

      // Hero Telemetry Pod
      drawRoundRect(ctx, 80, 360, 920, 680, 24);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.font = `700 24px 'Space Mono', monospace`;
      ctx.fillText('METRIC_ID: GWA_CUMULATIVE_SCORE', width / 2, 440);

      // Giant Neon GWA
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 32;
      ctx.font = `bold 174px 'Space Mono', monospace`;
      ctx.fillText(cardData.gwa, width / 2, 630);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Telemetry Data Bar (3 chips)
      const chips = [
        { label: 'LOAD', val: cardData.units },
        { label: 'HONOR', val: cardData.honorTitle.split(' ')[0] },
        { label: 'DEFIC.', val: '0_NONE' },
      ];
      chips.forEach((c, idx) => {
        const cx = 130 + idx * 280;
        drawRoundRect(ctx, cx, 720, 260, 80, 12);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = `700 18px 'Space Mono', monospace`;
        ctx.fillText(`[${c.label}]`, cx + 130, 750);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 22px 'Space Mono', monospace`;
        ctx.fillText(c.val, cx + 130, 782);
      });

      // Terminal Output Box
      drawRoundRect(ctx, 120, 840, 840, 140, 14);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#10b981';
      ctx.font = `600 22px 'Space Mono', monospace`;
      ctx.fillText(`> EVALUATION_RESULT: ${cardData.honorTitle.toUpperCase()}`, 150, 890);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(`> STANDING: ${cardData.honorSubtitle}`, 150, 930);

      // Barcode Verification Block
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.font = `600 20px 'Space Mono', monospace`;
      ctx.fillText('CRYPTOGRAPHIC EVALUATION STAMP', width / 2, 1140);
      drawBarcode(ctx, 140, 1170, 800, 60, `BU-CYBER-${cardData.gwa}-${studentName}`, '#38bdf8');

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = `400 18px 'Space Mono', monospace`;
      ctx.fillText(`HASH: 0x8F9C2B${cardData.gwa.replace('.', '')}E491A2 • BICOL UNIVERSITY`, width / 2, 1270);

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = `italic 22px ${ff}`;
      ctx.fillText('“Scholarship • Leadership • Service • Character”', width / 2, 1800);

    // ==========================================
    // LAYOUT 5: BOARDING PASS (Swiss Ticket & Tear-off Stub)
    // ==========================================
    } else if (layout === 'boarding-pass') {
      // 1. Clean Background with subtle stripe
      ctx.fillStyle = themeConfig.bg1;
      ctx.fillRect(0, 0, width, height);

      // Background Watermark Outline Text
      ctx.textAlign = 'center';
      ctx.font = `900 180px ${ff}`;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 3;
      ctx.strokeText('EXCELLENCE', width / 2, 950);

      // 2. Main Ticket Card
      const tx = 70;
      const ty = 140;
      const tw = 940;
      const th = 1600;
      const notchY = 1240;
      const notchR = 36;

      // Draw ticket shape with left and right semicircular notches
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx + 30, ty);
      ctx.lineTo(tx + tw - 30, ty);
      ctx.quadraticCurveTo(tx + tw, ty, tx + tw, ty + 30);
      // Right edge down to notch
      ctx.lineTo(tx + tw, notchY - notchR);
      ctx.arc(tx + tw, notchY, notchR, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineTo(tx + tw, ty + th - 30);
      ctx.quadraticCurveTo(tx + tw, ty + th, tx + tw - 30, ty + th);
      // Bottom edge
      ctx.lineTo(tx + 30, ty + th);
      ctx.quadraticCurveTo(tx, ty + th, tx, ty + th - 30);
      // Left edge up to notch
      ctx.lineTo(tx, notchY + notchR);
      ctx.arc(tx, notchY, notchR, Math.PI / 2, -Math.PI / 2, true);
      ctx.lineTo(tx, ty + 30);
      ctx.quadraticCurveTo(tx, ty, tx + 30, ty);
      ctx.closePath();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = themeConfig.accent;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Perforated Tear Line connecting notches
      ctx.save();
      ctx.strokeStyle = `${themeConfig.accent}88`;
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 16]);
      ctx.beginPath();
      ctx.moveTo(tx + notchR + 10, notchY);
      ctx.lineTo(tx + tw - notchR - 10, notchY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Ticket Header
      drawRoundRect(ctx, tx + 4, ty + 4, tw - 8, 120, 26);
      ctx.fillStyle = themeConfig.accent;
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold 32px ${ff}`;
      ctx.fillText('BICOL UNIVERSITY AIRWAYS', tx + 40, ty + 60);

      ctx.textAlign = 'right';
      ctx.font = `700 24px ${ff}`;
      ctx.fillText('FLIGHT BU-2026', tx + tw - 40, ty + 60);

      ctx.textAlign = 'left';
      ctx.font = `600 20px ${ff}`;
      ctx.fillText('PRIORITY BOARDING: FIRST CLASS HONORS', tx + 40, ty + 95);

      // Passenger Details
      ctx.textAlign = 'left';
      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('PASSENGER NAME', tx + 50, ty + 200);

      ctx.fillStyle = themeConfig.text;
      ctx.font = `bold 54px ${ff}`;
      ctx.fillText(studentName || 'Bueño Student', tx + 50, ty + 265);

      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `600 22px ${ff}`;
      ctx.fillText('DESTINATION / COLLEGE', tx + 50, ty + 335);

      ctx.fillStyle = themeConfig.accent;
      ctx.font = `600 32px ${ff}`;
      ctx.fillText(collegeDept || 'Bicol University', tx + 50, ty + 380);

      // Hero GWA Box
      drawRoundRect(ctx, tx + 40, ty + 430, tw - 80, 480, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `600 26px ${ff}`;
      ctx.fillText('OFFICIAL GENERAL WEIGHTED AVERAGE', width / 2, ty + 500);

      ctx.fillStyle = themeConfig.accent;
      ctx.font = `bold 160px ${ff}`;
      ctx.fillText(cardData.gwa, width / 2, ty + 670);

      ctx.fillStyle = themeConfig.text;
      ctx.font = `bold 38px ${ff}`;
      ctx.fillText(`★ ${cardData.honorTitle.toUpperCase()} ★`, width / 2, ty + 760);

      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `500 26px ${ff}`;
      ctx.fillText(cardData.honorSubtitle, width / 2, ty + 820);

      // Boarding Gate Data Strip
      const flightInfo = [
        { label: 'GATE', val: '1.000' },
        { label: 'LOAD', val: cardData.units },
        { label: 'SEAT', val: 'TOP 1%' },
        { label: 'CLASS', val: 'HONORS' },
      ];
      flightInfo.forEach((item, idx) => {
        const ix = tx + 60 + idx * 210;
        ctx.textAlign = 'left';
        ctx.fillStyle = `${themeConfig.text}88`;
        ctx.font = `600 20px ${ff}`;
        ctx.fillText(item.label, ix, ty + 990);
        ctx.fillStyle = themeConfig.accent;
        ctx.font = `bold 32px ${ff}`;
        ctx.fillText(item.val, ix, ty + 1035);
      });

      // Tear Stub Section
      ctx.textAlign = 'center';
      ctx.fillStyle = `${themeConfig.text}aa`;
      ctx.font = `700 22px ${ff}`;
      ctx.fillText('PASSENGER DETACHABLE STUB — OFFICIAL BU EVALUATOR', width / 2, notchY + 80);

      // Barcode in Stub
      drawBarcode(ctx, tx + 70, notchY + 120, tw - 140, 80, `BU-${cardData.gwa}-${studentName}-2026`, themeConfig.accent);

      ctx.fillStyle = `${themeConfig.text}88`;
      ctx.font = `500 22px 'Space Mono', monospace`;
      ctx.fillText(`BU-TICKET-SERIAL-${cardData.gwa.replace('.', '')}-PASS-2026`, width / 2, notchY + 250);

      ctx.font = `italic 22px ${ff}`;
      ctx.fillText('“Scholarship • Leadership • Service • Character”', width / 2, notchY + 310);
    }

  }, [isOpen, theme, font, layout, studentName, collegeDept, cardData]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `BU-Milestone-${studentName.replace(/\s+/g, '_')}-${cardData.gwa}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex' }}>
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '92%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
              }}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>9:16 Story Milestone Studio</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Customize and export your academic milestone graphic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Studio 2-Column Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(210px, 250px) 1fr',
            flex: '1 1 auto',
            overflow: 'hidden',
          }}
          className="story-studio-body"
        >
          {/* Left Column: Live Canvas Preview */}
          <div
            style={{
              background: 'var(--color-bg-secondary)',
              borderRight: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px',
            }}
          >
            <div
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                border: '2px solid var(--color-border)',
                lineHeight: 0,
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: '190px',
                  height: '338px',
                  display: 'block',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '12px',
                fontSize: '0.72rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
              }}
            >
              1080 × 1920 • 9:16 Story
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div
            style={{
              padding: '18px 20px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 140px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Student & Department Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Student Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Bueño Student"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  College / Course
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={collegeDept}
                  onChange={(e) => setCollegeDept(e.target.value)}
                  placeholder="Bicol University"
                />
              </div>
            </div>

            {/* Scope Selector */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Academic Scope
              </label>
              <select
                className="form-control form-control-sm"
                value={selectedSemIndex}
                onChange={(e) => setSelectedSemIndex(parseInt(e.target.value))}
              >
                <option value={-1}>Overall Cumulative GWA ({stats.cumulativeGWA.toFixed(4)})</option>
                {semesters.map((s, idx) => (
                  <option key={s.id} value={idx}>
                    {s.title} ({s.subjects.length} subjects)
                  </option>
                ))}
              </select>
            </div>

            {/* Themes Tray */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Theme ({THEME_OPTIONS.length})
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: theme === t.id ? t.accent : 'var(--color-bg-secondary)',
                      color: theme === t.id ? '#000000' : 'var(--color-text)',
                      border: `1px solid ${theme === t.id ? t.accent : 'var(--color-border)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Tray */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Typography ({FONT_OPTIONS.length})
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFont(f.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: font === f.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                      color: font === f.id ? '#ffffff' : 'var(--color-text)',
                      border: `1px solid ${font === f.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Layout Tray */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Visual Layout ({LAYOUT_OPTIONS.length})
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {LAYOUT_OPTIONS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLayout(l.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: layout === l.id ? 'var(--color-gold)' : 'var(--color-bg-secondary)',
                      color: layout === l.id ? '#000000' : 'var(--color-text)',
                      border: `1px solid ${layout === l.id ? 'var(--color-gold)' : 'var(--color-border)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <i className={`fa-solid ${l.icon}`} style={{ marginRight: '4px' }}></i>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: 'var(--color-surface)',
          }}
        >
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-gold btn-sm" onClick={handleDownload}>
            <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>
            Download 9:16 Story (PNG)
          </button>
        </div>
      </div>
    </div>
  );
};
