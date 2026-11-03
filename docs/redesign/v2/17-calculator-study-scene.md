# Calculator study companions

User-directed revision, 2026-11-03. Supersedes the calculator artwork in the previous sky reference; layout and calculation scope remain unchanged.

## Direction and visual reference
- 2026-11-03 correction after live-browser review: enlarge the orange body to balance the square, lower desk/props below both faces, and remove stools/book stacks and intersecting furniture lines. Use white paper with dark writing in both themes. Retain the study setting rather than introducing another unrelated pose.
- Keep the blue square and orange circle identities, tiny oval eyes and simple smiles.
- Light: companions at a shared desk, checking a standing grade clipboard; a small window and plant create a daytime study setting. No floating smiling sun.
- Dark: companions leaning toward a shared low desk with grade cards, an angled reading lamp and a small moonlit window. Avoid paper in front of faces and overlapping seat/leg outlines.
- Hands are solid round endpoints on simple curved arms. No fingers, forked ends, disconnected limbs or ambiguous shared hands.
- Props describe recording and reviewing grades; do not draw example grades, award claims or extra controls.
- Keep the illustration beside the greeting, within the current responsive bounds. Reuse neutral theme tokens; blue/orange identify characters, warm yellow accents the lamp/window.
- Decorative, hidden from assistive technology and print; no interaction, animation or remote imagery.

## File manifest and dependencies
1. `src/components/illustrations/calculator-study-scene.tsx`: original SVG compositions, presentation only.
2. `src/components/dashboard/CalculatorView.tsx`: mount the new scene in the existing illustration slot.
3. `src/css/calculator-v2.css`: named art colors and light/dark visibility, reusing current dimensions.
4. `docs/redesign/v2/16-calculator-sky-reference.md`: link this superseding artwork contract.
5. `docs/redesign/v2/progress.md`: actual verification and screenshot references.
- Dependency order: theme tokens and SVG component, then CalculatorView. No store/domain changes; old CalculatorSky remains intact as legacy art.

## Verification and limits
- Check 320/375/414/768/1024/1440 in both themes, correct scene visibility, no overflow/overlap, and decorative accessibility.
- Toggle the live theme; open an import dialog and switch computation mode without changing records.
- Inspect cropped artwork screenshots for hand attachment and leg/prop overlap. Run production build.
- Some isolated checks may block external fonts/CDNs; disclose that limitation. No academic-policy, persistence or dependency changes.
