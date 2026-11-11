import calculatorLight from '../../assets/mascot-references/calculator-light.svg';
import calculatorDark from '../../assets/mascot-references/calculator-dark.svg';
import simulatorLight from '../../assets/mascot-references/simulator-light.svg';
import simulatorDark from '../../assets/mascot-references/simulator-dark.svg';
import scholarshipLight from '../../assets/mascot-references/scholarship-light.svg';
import scholarshipDark from '../../assets/mascot-references/scholarship-dark.svg';
import handbookPoliciesLight from '../../assets/mascot-references/handbook-policies.svg';
import handbookPoliciesDark from '../../assets/mascot-references/handbook-policies-dark-ivory.webp';
import handbookGuideLight from '../../assets/mascot-references/handbook-guide.svg';
import handbookGuideDark from '../../assets/mascot-references/handbook-guide-dark-ivory.webp';
import handbookOverviewLight from '../../assets/mascot-references/handbook-overview-light.svg';
import handbookOverviewDark from '../../assets/mascot-references/handbook-overview-dark-ivory.webp';
import handbookAboutLight from '../../assets/mascot-references/handbook-about.svg';
import handbookAboutDark from '../../assets/mascot-references/handbook-about-dark-ivory.webp';
import resultsHighHonorsLight from '../../assets/mascot-references/results-high-honors.svg';
import resultsHighHonorsDark from '../../assets/mascot-references/results-high-honors-dark.svg';
import resultsSupportLight from '../../assets/mascot-references/results-support-light.svg';
import resultsSupportDark from '../../assets/mascot-references/results-support.svg';
import gabayBuLight from '../../assets/mascot-references/gabay-bu-light.svg';
import gabayBuDark from '../../assets/mascot-references/gabay-bu-dark.svg';

const SCENES = {
  calculator: [calculatorLight, calculatorDark],
  simulator: [simulatorLight, simulatorDark],
  scholarship: [scholarshipLight, scholarshipDark],
  'handbook-policies': [handbookPoliciesLight, handbookPoliciesDark],
  'handbook-guide': [handbookGuideLight, handbookGuideDark],
  'handbook-overview': [handbookOverviewLight, handbookOverviewDark],
  'handbook-about': [handbookAboutLight, handbookAboutDark],
  'results-high-honors': [resultsHighHonorsLight, resultsHighHonorsDark],
  'results-support': [resultsSupportLight, resultsSupportDark],
  'gabay-bu': [gabayBuLight, gabayBuDark],
} as const;

/** Decorative artwork for the active theme. */
export function MascotReference({ scene, className }: { scene: keyof typeof SCENES; className: string }) {
  const [light, dark] = SCENES[scene];
  return (
    <div className={`mascot-reference ${className}`} data-mascot-scene={scene} aria-hidden="true">
      <img src={light} alt="" width={960} height={600} data-mascot-theme="light" />
      <img src={dark} alt="" width={960} height={600} data-mascot-theme="dark" />
    </div>
  );
}
