# BU GWA Redesign Plan — Bueño Fieldnotes

Status:concept proposal for user review; no application implementation. Date:2026-11-01 Asia/Manila. Scope:framework/skill/MCP research, complete surface/state plan, and one generated visual concept. The user selected English with a warm student voice. This plan does not authorize dependency installation, app changes, deletion, deployment or a policy rewrite. Vault updates remain deferred.

## Product and creative thesis

Keep BU GWA's name and institutional navy/gold relationship. Give the product an original academic identity called Bueño Fieldnotes for this design exploration:a student's evolving academic folio, organized by semester and annotated with clear next steps. Personality should appear throughout the working application as well as welcome/help surfaces.

The visual world draws on book-cloth covers, indexed semester dividers, crisp academic worksheets, fine rules, generous folio margins and original illustrations of study materials. A strong navy region and sunflower-gold/cobalt accents establish ownership; warm white paper, mist blue and restrained mint support content. Semantic errors/warnings/success keep distinct labels/icons. Final color tokens require measured light/dark contrast, not approval by appearance alone.

Use bold, upright geometric display typography for welcome/page titles; a readable workhorse sans for forms/prose; tabular numerals for grades and units. Explore Sora plus a readable body face; existing faces remain an option until side-by-side evaluation. Handwritten-like annotations are occasional helper accents, never grade values, long policy prose or interactive labels. Keep original artwork separate from semantic UI text and controls.

Composition:an open folio with one dominant result, compact context, indexed semester pages and a clear task path. Welcome can use an asymmetric oversized headline and an authored folder/worksheet illustration. Working pages use familiar controls with distinctive composition, fine details and meaningful empty/result states. Mobile recomposes the folio into a simple vertical record with thumb-reachable actions; it does not shrink desktop decorations into a narrow screen.

Reference principle:DevTayo shows coherent student-centered authorship. Its artwork, sticker arrangement, font combination, pastel panels and headline composition are not specifications to reproduce. PostHog and Linear provided additional lessons about identity and product demonstration in the earlier creative study. Bueño Fieldnotes needs its own object language and hierarchy.

## Framework/component research and recommendation

The current app declares React19,Vite6,Tailwind4,Zustand5 alongside existing CSS, FontAwesome/Lucide assets, Lottie,PDF.js and Tesseract. Keep this base; changing the application framework is not necessary for the visual goal. Dependency compatibility must be checked against the actual lockfile before any future installation.

| Candidate | Contribution | Trade-off | Decision for this proposal |
|---|---|---|---|
| Existing React/Vite/Tailwind + bespoke CSS | Fits the current app; supports a fully authored token/component system | Existing CSS drift requires a planned consolidation | Retain; define one semantic visual contract rather than add overrides indefinitely |
| React Aria Components | Style-independent accessible behavior for overlays, tabs, menus, fields and progress | More custom visual assembly; still requires labels, contrast and integration testing | Preferred selective behavior foundation for this strongly custom identity |
| shadcn/ui with Base UI or Radix | Ownable component code, configurable styling, documented Vite path | Generated components require maintenance and can encourage default compositions | Strong alternative if faster component assembly is preferred; choose one primitive family |
| Base UI directly | Unstyled composable behaviors with keyboard/focus support | Team owns visual system and component recipes | Viable alternative to React Aria; do not layer both for identical controls |
| Mantine | Broad ready-made component/form ecosystem and Vite guide | Larger styling/convention shift relative to this project | Reserve for a broader application-platform decision, not this redesign's default |

Motion recommendation:CSS transitions for ordinary focus/press/tab/overlay changes; investigate Motion for React only for a small set of layout/entry interactions that actually benefit. No blanket GSAP,3D-engine,particle or animation-library migration is justified by this plan. Existing Lottie assets may be retained selectively if they fit the new world, load on demand and respect reduced motion. Do not create a timed calculation delay to showcase artwork.

Use native table/input semantics where they already solve the task; avoid a spreadsheet-grid dependency without demonstrated need. Preserve the current domain engine and provider boundaries while planning separate reliability repairs. Existing FontAwesome guidance remains binding; no additional icon library is proposed. Reconcile conflicting icon documentation before a future icon-system change.

Primary framework sources inspected:
- https://react-aria.adobe.com/ and https://react-aria.adobe.com/styling
- https://ui.shadcn.com/docs and official shadcn repository material retrieved through Context7
- https://base-ui.com/react/overview/about and https://base-ui.com/react/overview/accessibility
- https://mantine.dev/getting-started/
- https://tailwindcss.com/docs/theme
- https://motion.dev/docs/react

These sources establish capabilities, not a measured performance ranking. Selection of React Aria here is a project-specific design/maintenance judgment.

## Skill and MCP assignments

| Capability | Assignment | Boundary |
|---|---|---|
| Brainstorming | Compare coherent directions and make reviewable decisions | Planning only; no implementation |
| Impeccable shape/new-work/Operate/Read | Tie each surface to its job; define composition, task and states | No automatic scaffolding or unapproved redesign |
| Hallmark study/design principles | Own visual specificity, structural variety and authored art direction | User/brand constraints outrank generic theme rotation or font bans |
| UI UX Pro Max | Research forms, errors, navigation, responsive behavior and typography | Generated suggestions are advisory; motion-heavy/marketing defaults were rejected for working pages |
| Frontend Design | Sharpen distinctive composition, materials, scale and detail | Its implementation workflow is not invoked during this plan |
| Emil Design Engineering + Animation Vocabulary | Specify purposeful, interruptible feedback and motion | Transitions <=300ms; reduced-motion equivalents; immediate calculation |
| ECC accessibility + Web Design Guidelines | Labels, focus, semantic tables/status, keyboard and touch targets | Library choice does not certify compliance |
| Vercel React Best Practices + Ponytail | Optional loading, scoped state reads and minimal dependencies | No Next.js-specific migration or blanket memoization |
| Codebase Design | Shared presentation primitives with clear domain/data boundaries | No business-rule duplication inside visual components |
| Context7 MCP | Query version-aware official library documentation | React Aria and shadcn resolution/query succeeded for this plan |
| Mobbin skills/MCP | Potentially research specific entry, document-review and planning flows | Installed skill instructions are readable; search tools were not exposed here; no Mobbin results claimed |
| Browser/computer tools | Review current UI and references; future desktop/mobile/focus validation | Use supported APIs; preserve evidence and disclose limitations |
| Built-in image generation + imagegen skill | Generate an original UI concept board after this plan | Raster concept only; not runnable code or an adopted implementation asset |

Mobbin, when available later, should use narrow web-flow searches such as document-import review,student-progress overview,and first-record setup. Inspect images before citing them; extract interaction lessons rather than copy screens. Figma can serve as an approval canvas if connected, but this work does not require installing or connecting it. A design-reference MCP cannot replace actual rendering and accessibility verification.

## Navigation and information architecture

Retain the main product areas:Calculator,Simulator,Scholarship,Handbook. Welcome remains the first-use entry; returning students with records resume their workspace. Handbook currently contains Policies,How to Use,Overview/Disclaimer,and Developer/Feedback. Give each of these a designed surface while retaining the existing component ownership and compatibility aliases; About does not require a new router or forced extra top-level tab.

Add clear access to About and How to Use from appropriate header/footer/help entry points in a future approved design. The mobile version must keep main areas identifiable with text, avoid a growing cluster of floating controls, and leave grade inputs/focus unobscured. Final choice of top-navigation menu versus compact bottom navigation belongs in the responsive prototype; no unused legacy component is assumed active.

## Page-by-page and state-by-state design

| Surface | Creative composition | Primary task | States and behavior |
|---|---|---|---|
| Welcome / first visit | Navy book-cloth cover; oversized upright headline; original folder/worksheet illustration; a short margin-note promise | Start entering grades; secondary understand how it works | Fast,skippable; independent-tool statement; theme-aware; no feature-chip wall or forced tutorial |
| Returning entry | A concise resume strip and last-used semester context | Continue work | No repeated welcome barrier; missing/invalid restored data receives a recoverable explanation |
| Empty Calculator | An open folio with an illustrated blank grade sheet and three clear entry methods | Choose manual,COR course list,or grade image | Zero is not presented as a calculated result; show pending placeholders and explain each import type |
| Populated dashboard | One prominent GWA result on a crisp record surface; small completeness note; semester index and contextual tools | Understand current record,continue editing | Draft/computed scope explicit; unknown/incomplete evidence visible; decorations stay outside input hit areas |
| Semester / course editing | Indexed semester page; distinct title band; aligned table; a quiet footer for totals | Enter/correct actual grades | Blank defaults;inline validation;48px mobile actions;undo removal;stable focus;long names and many semesters supported |
| Import chooser | Compact document-tray panel with recognizable PDF/image/paste choices | Select correct source | Plain processing disclosure and file constraints; keyboard-operable upload; label COR as course-list import |
| COR review | Registration-sheet preview and staged course list | Verify subjects/units,then import | Explain blank grades;invalid PDF/no text layer/partial parsing have specific recovery;per-file outcome |
| Photo scan setup | A visual scan desk with semester groups and crop/quality guidance | Choose images and local/cloud processing | Bound file/pixel count;orientation help;privacy destination shown before send;no silent overflow truncation |
| OCR loading | Document tray with a restrained scan-line/detail; step list and per-image status | Understand genuine work and cancel if needed | Real stages only;no fake percentages;cancel/retry;retained partial work;announced status;static reduced-motion version |
| OCR review | A dedicated review workspace within Calculator:source image beside editable candidates;not every stage trapped in a small modal | Resolve uncertainty/conflicts and confirm | Original/candidate comparison;unknown fields remain unknown;row count/file coverage;targeted retry;no late commit after cancel |
| Calculation feedback | Small in-place acknowledgement or a short underlined-result reveal | See the result immediately | Calculation is not delayed by a loading animation;errors stay near fields;no celebratory block over editing |
| Term results | A well-composed academic summary sheet with large GPA,coverage and an explanation checklist | Understand the term and next action | Provisional versus evaluable result;criteria sources;qualified recognition;record corrections accessible |
| Cumulative / Latin trajectory | A chapter-summary composition and a program-aware timeline where supported | Understand long-term standing and evidence gaps | Numeric bracket versus full eligibility distinct;no universal140-unit completion claim;Registrar audit caveat clear |
| Achievements | A small collection of original academic-stamp-like badges with consistent geometry | Explore earned milestones | Badge text explains evidence;no locked-award clutter at first use;no inaccurate eligibility implied |
| Simulator | A planning spread:current baseline,next-term scenario,and connected outcome;controls close to consequences | Explore a hypothetical plan | Projections stay separate from actual grades;clear reset;invalid/impossible scenario explanation;keyboard sliders |
| Scholarship | A requirements worksheet with named preset/custom configuration and a legible checklist | Compare academic evidence with chosen requirements | Setup before judgment;period/source shown;unknown non-grade conditions qualified;pending data is not compliance |
| Handbook / Policies | An academic reference reader with section index and citation rail | Find and understand a rule | Search/anchors;edition/date/source;policy conflicts flagged;mobile index collapses cleanly;readable prose measure |
| How to Use | Illustrated short task walkthroughs using the actual product components | Complete the next task | Manual/import/scan/fix/export guides;contextual links open the right topic;no repeated long onboarding |
| About / Overview / Disclaimer | A distinct editorial story page with custom study artwork and concise product purpose | Understand ownership,limits and processing | Preserve factual creator/source credits;clear independent status;accurate local/cloud privacy;no invented endorsements |
| Developer / Feedback | Compact editorial profile and structured feedback route within Handbook | Know who maintains the tool and report a problem | Real credits only;avoid collecting student records by default;no new third-party submission integration assumed |
| Bueño assistant | A deliberate contextual-help panel in the Fieldnotes visual family | Ask for sourced explanations | Local/cloud mode accurate;focus-managed;persistent input label;announced replies;context transmission disclosed;no official-advisor claim |
| Export / print | A restrained monochrome-friendly academic summary with page headers and complete rows | Take a readable record away | Unofficial title;independent of collapsed UI;all grades and totals included;page breaks,empty fields and long histories tested |
| Preferences / saved-data tools | A quiet utility area using the same fields/controls | Choose theme and understand persistence | System/light/dark;reduced motion inherited;storage/error/backup proposals explicit;no claim of existing JSON backup capability |
| Confirmations and errors | Focused panels with a small authored symbol and precise text | Recover safely | Clear consequence;safe default focus;undo where useful;loading/error/success/disabled states;no raw provider errors |

## Shared visual and interaction system

Create a small family of future presentation primitives:app shell,folio/page header,semester index,result sheet,coverage annotation,record table/mobile row,review panel,status line,dialog,action menu,field/error pair,and contextual help. Preserve domain calculations in core and provider concerns outside presentation.

Proposed personality devices:chapter numbers,small index notches,one original paper/folio illustration style,fine rules and purposeful margin annotations. Avoid repeating identical card grids on every surface. Welcome uses a strong visual thesis;Calculator uses an authored worksheet composition;Scanner uses side-by-side evidence;Handbook/About use reading layouts. The same type,color,icon and spacing vocabulary ties them together.

Every component specifies default,hover,focus,pressed,disabled,loading,error and success where meaningful. Actions have labels;status uses text/icon plus color;focus is visible;mobile hit areas48px. Preserve the explicit40px mobile semester-title requirement and approved desktop table proportions. Compact desktop overlays remain580-660px;large document review can be a normal workspace rather than a fullscreen overlay.

Light theme:clear paper and navy ink with purposeful saturated chapter accents. Dark theme:ink/navy workspace with layered readable surfaces and controlled gold/mist accents. Dark mode needs its own contrast and semantic-color checks,not an automatic inverted bitmap. Native responsive layouts and semantic text stay code-native in any eventual build.

## Motion, loading and results

| Before | Proposed behavior | Reason |
|---|---|---|
| Fixed2.5-second compute ceremony | Immediate result with100-200ms acknowledgement | Arithmetic stays responsive |
| Generic spinner for every task | Actual OCR stages and per-file outcomes | Explains what is happening |
| Read-only extracted result | Editable review with source comparison and uncertainty marks | Verification becomes part of the design |
| Unqualified recognition/compliance | Clearly scoped result with completeness and requirements | Personality supports trust |
| Repeated animated decorations | One authored moment on welcome;subtle state transitions in workspaces | Keep working pages comfortable on repeated visits |

Microinteractions generally100-150ms;transitions200-250ms,never above the existing300ms project limit. Reduced motion removes spatial movement and decorative loops;feedback remains textual and immediate. No continuous marquee,confetti or attention-demanding mascot behavior is proposed for grade editing.

## Responsive and accessibility plan

Prototype320/375/414,768/769,1024/1440 widths. At desktop,semester index and secondary context can sit beside a wide worksheet. On mobile,the current semester and primary task come first;secondary result details progressively disclose;scanner image/review become clearly named steps. Long descriptions wrap,grade values align,keyboard focus remains visible and dialogs restore their trigger focus.

Review both themes,empty/typical/long histories,pending/INC/DRP/error states,zoom/reflow,screen readers,keyboard-only scanning,48px hit areas and printable output. Measure contrast against actual colors. Use asset loading/error fallbacks;keep heavy scanner/animation assets optional. A beautiful mockup is not evidence of accessible behavior or accurate OCR.

## Dependency on reliability work

The prior audit found wrong-row allocator writes,invented grades,partial recognition,destructive merges,chart weighting differences,print omissions and contradictory policy sources. Visual implementation must not certify these behaviors. Plan reliability repairs and presentation work as separately reviewable changes with shared evaluation/candidate contracts. Do not silently rewrite academic policy during a UI redesign.

## Proposed delivery sequence after approval

1. Approve the visual direction and the actual component/copy boundaries using concept images.
2. Produce a multi-screen prototype for welcome,empty/populated Calculator,scan review and term results in desktop/mobile.
3. Confirm primitives/dependencies and a file-level implementation manifest;prove one representative working worksheet before broad rollout.
4. Extend the approved visual family to simulator,scholarship,Handbook,About,assistant and utility/error states.
5. Verify behavior,accuracy boundaries,keyboard/theme/responsive/print/performance;run existing tests,lint and build;record the implemented system from actual code.

Approval of this plan would not automatically authorize deletion,heavy overwrites,provider integration changes or publication. Those operations retain their applicable scope/confirmation rules. No implementation is performed in this session.

## Concept image brief

Generate one original high-fidelity UI concept board showing the same BU GWA identity across a welcome surface,a populated desktop workspace,and a mobile scan-review view. Use the Fieldnotes composition above,English student-friendly copy,BU navy/sunflower accents and readable actual controls. Mark the board synthetic/proposed. Illustrations should be original academic folio objects;do not copy DevTayo's pinned notes,avatar arrangement,type pairing or source artwork. Exact image prompt is saved separately. The board is a design proposal,not an implemented screenshot or a university-approved brand guide.
