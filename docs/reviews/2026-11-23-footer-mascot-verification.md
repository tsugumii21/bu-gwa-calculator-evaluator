# Shared footer, mascot anatomy, and page alignment

## Design Council review
- Brief: friendly academic planning tool, React/TypeScript, preserve approved typography and graphite/orange themes.
- Taste: native geometric SVG duo, flat fills, monoline limbs, circular hands, short feet. No glow or oversized footwear.
- UX: preserve Outfit/Inter and existing routes. Use Calculator's 1280px frame with 32px desktop gutters.
- Standards: semantic footer navigation, decorative artwork hidden from assistive technology, visible focus and 48px targets.
- Motion: static artwork, reduced-motion-aware Back to top, no new animation library or layout animation.
- Engineering: one shared SiteFooter, existing theme-aware MascotReference mapping, reusable spacing/font tokens.
- Commands applied: /polish, /adapt, /verify. Existing approved typography takes precedence over generic font replacement advice.

## Implemented
- Shared desktop content width is 1216px across Calculator, Simulator, Scholarship, and Handbook.
- Footer includes distinct light/dark SVG artwork, Handbook, View source, Back to top, developer credit, and BU core values.
- Dark Calculator uses a new grade-review easel scene with thin ivory limbs and short feet. Light Calculator artwork is retained.
- Dark support result separates the slate bench/legs from its ground shadow and adds visible ivory mascot legs.
- Assets are transparent SVGs. Welcome hero and academic calculation logic are unchanged.

## Verification
- November 23: npm test passed 157 tests in 14 suites. npm run build passed.
- npm run lint: zero errors, one pre-existing unused import warning in ocr-engine.test.ts.
- Chrome at current viewport 1536x695: both themes, four workspace pages, matching 1216px content width, no document overflow or footer-tool overlap.
- Chrome 375x667: four workspace pages in both themes, no document overflow or footer-tool overlap. Footer controls are at least 48px in both dimensions.
- November 22: 390x844 also checked in both themes. Result modal checked at 375x667 and 390x844, close visible and body locked.
- Footer Handbook navigation, source attributes, and keyboard focus verified. User grades were not edited.
- No claim of a full WCAG audit or real-device animation profiling. No commit or push included.

## Files
- src/css/shell-v2.css: shared frame, responsive footer, spacing/font tokens and floating-tool clearance.
- src/components/layout/site-footer.tsx: shared identity, credits and navigation.
- src/components/illustrations/mascot-reference.tsx: theme-aware asset registration.
- src/assets/mascot-references/footer-light.svg, footer-dark.svg, calculator-review-night.svg: native artwork.
- src/assets/mascot-references/results-support.svg: dark bench and limb visibility.
