# Photo import workbench: semester drops and compact review

Status: approved and implemented, 2026-11-26; responsive/keyboard Chrome checks complete, populated upload/OCR verification blocked by extension file access. See ../../reviews/2026-11-26-photo-import-workbench-verification.md.

## Brief and inspection
- Surface: a friendly academic work tool for students organizing screenshots by semester, scanning locally, correcting observations, and explicitly importing courses.
- Evidence: the five supplied screenshots and current PhotoScanModal.tsx, ScanReviewRows, scan-results, image-preparation, ScanSession and scoped CSS. No fresh Chrome/OCR run was performed for this planning task.
- The current backdrop calls handleCloseModal, which stops the session, clears selected files/results and revokes previews. This explains accidental image loss.
- The upload surface has no actual drag/drop handlers. Multiple large file cards and repeated Remove semester/Delete image buttons dominate the hierarchy.
- Review renders every semester and every course fieldset expanded. Per-image outcomes, a completed progress panel and footer feedback compete for space. Description is the current course-name label.
- Preserve existing Outfit/Inter, cream/white light and graphite dark surfaces, orange primary action, local OCR, file limits, source evidence, retry, explicit import and existing validation. No new artwork or dependency.

## Design Council
| Group | Perspective and concrete vote | Selected commands |
|---|---|---|
| A — Taste | Academic import workspace: quiet semester groups and aligned editable rows. Remove repeated nested card borders and oversized diagnostic blocks; filenames remain secondary to semester/course names. | /critique, /distill |
| B — UX | Three clear states: Add images, Scan, Review. Every semester is a file drop target. Review opens with compact collapsed semester summaries; one semester expands at a time. | /layout, /clarify |
| C — Standards | Backdrop cannot discard work. Explicit exit requests protect selected files. Dragging has a click/tap alternative; collapsed errors remain discoverable. | /harden, /clarify |
| D — Motion | Instant drop feedback, restrained150ms panel entry and brief opacity/transform feedback. No animated accordion height, row stagger or fake scanning delays. | /choreograph, /adapt |
| E — Engineering | Reuse local ScanSession, selection validation, source identities and accessible-dialog hook. Move images through one tested bucket operation; never mix stale source rows into a different semester. | /ponytail, /polish, /verify |

## Unified direction
- Register: friendly work tool. Existing fonts and palette remain: light #F7F5EF/#FFFFFF/#202124, dark #202124/#2B2C2E/#F7F5EF, accent #F48242. Use existing semantic tokens for implementation.
- One dominant action per state: Scan images, Stop scan while running, then Import courses. Secondary actions remain visually quieter.
- Desktop modal stays compact at660px maximum; mobile fits viewport gutters and <=min(85vh,85svh), including borders. One body scrollbar; visible header, feedback and footer.
- User confirmed every review semester starts collapsed after scanning. Initial focus moves to the review summary, without expanding or scrolling through course rows automatically.

## 1. Add images by semester
- Header: Import grade images, short instruction and quiet current count/limit. Keep local-processing disclosure once, below the semester groups.
- Semester header: aligned folder icon, editable title, image count and a48px Remove semester icon with an accessible name/tooltip. Keep removal discoverable; confirm before removing a populated semester.
- Each entire semester group accepts external PNG/JPG/WebP files, including when already populated. The drop cue names the target semester: Drop3images into Year1–2nd Semester.
- Keep a normal Choose images/Add images button for file selection. Every route uses the existing shared validation:20images,10MiB each,100MiB total, with rejected-file reasons and accepted-file counts.
- Compact image rows: small fixed thumbnail, truncated visible filename with full accessible name, a Move to semester action and48px Remove image icon. Use Image1/Image2 labels within each semester to match review provenance.
- Support moving an already selected image between semester groups by dragging its handle; Move to semester offers the same operation using click, keyboard or touch. No dragging from text inputs or destructive whole-row click areas.
- Movement happens only in Add/Edit images, not while scanning. Moving preserves file/previews, total image count and other semesters. Invalidate old extracted rows/outcomes for both affected groups before rescanning; do not silently move reviewed academic rows.
- Existing bucket/index source IDs may remain for this pass, provided every membership/order mutation invalidates affected indexed results. Do not change OCR extraction/math as part of the redesign.
- Dropping a file on the backdrop never closes the dialog or navigates the browser to the image. Show a small Drop onto a semester message. Unsupported types and oversized files do not remove previously selected images.

## 2. Protect unfinished work
- Clicking/tapping outside the dialog does nothing: no exit, cancellation or state clearing.
- X, Cancel and Escape request an explicit close. An empty untouched session closes immediately; selected images or edited review results show Keep working / Discard and close confirmation inside the existing dialog, without stacking another large modal.
- Keep working restores the previous upload/review state and focus. Discard and close explicitly stops jobs, invalidates late callbacks, revokes previews and clears temporary data. Nothing is written to academic records.
- While scanning, Stop scan ends recognition but preserves selected images and completed results for review/retry. It does not mean Discard.
- Preserve previews until actual discard/import/unmount cleanup. File moves do not revoke the moved preview URL, and appending images does not recreate all existing previews unnecessarily.
- No new browser-storage persistence or promise to survive a page reload. This plan protects the current in-memory session.

## 3. Review by semester — collapsed initially
- Top summary: e.g.6semesters ·42courses ·3need corrections. Successful image outcomes become a compact Scanned images disclosure; unfinished/failed files and Retry remain easy to find.
- Each collapsed semester row shows its title, extracted course count, image count and correction count, plus an Expand button. Do not present correction counts through color alone.
- Expand one semester to see its compact course editor. Other semesters stay collapsed; edits are retained when switching. Source images remain a separate collapsed disclosure inside that semester.
- Initial scan completion collapses all groups. Retrying an image preserves the user's current open semester where possible and announces updated counts without scrolling unexpectedly.
- An explicit Review corrections action expands the first blocked semester and focuses its first invalid/conflicting field. Pressing Import performs the same reveal/focus when blocked; hidden DOM fields must not prevent navigation to the error.
- Keep existing final-action confirmation; do not restore a per-course acknowledgement checkbox or manual load-confirmation gate. Blank grades remain pending and zero-credit courses remain valid under current rules.

## 4. Compact extracted-course fields
- Rename Description to Course name throughout this photo-review flow, including accessible labels, conflict prompts and import-error copy. Do not rename the underlying Subject.name field or unrelated Calculator/PDF/paste labels.
- Desktop: one visible column header and aligned rows for Course code, Course name, Grade, Units and Remove. Inputs remain48px high; course-name space gets priority. Source label and row issues sit on a quiet second line when needed.
- Mobile: code/name fields across the row where appropriate, Grade and Units side by side, and a clearly separated48px Remove action. No horizontally scrolling editable table or nested per-semester scrollbar.
- Use typed grade/units fields with decimal keyboards and existing validation. Never replace an unknown value with an invented grade or guessed units.
- Show conflicts and invalid values adjacent to the relevant field. A suspicious numeric-only course name such as2.0 gets a source-check warning; never automatically move it into Grade. OCR accuracy fixes require their own evidence.
- Add missing course remains available within the expanded semester. Use unique labels containing semester/course identity so fields are unambiguous to screen readers.

## 5. Progress and motion
- Keep real phase/count progress while scanning. Show per-image queued/running/finished/failed states, with only the active/failed details emphasized.
- After completion, replace the large progress panel with a single compact status line. Do not reserve a tall empty feedback block or duplicate Completed messages in three places.
- Existing150ms modal entrance remains. Drop target highlights immediately; a dragged image uses a native drag preview with reduced opacity at the original position. Brief150ms opacity/transform feedback may acknowledge a completed move.
- Accordion expansion changes layout immediately; no height/width/top/left transitions. Chevron rotation may use150ms transform. No staggered image/course arrivals and no OCR delay added for animation.
- Reduced-motion removes transitions/spinners while preserving text progress and feedback. Controls remain48px, helpers>=13px, mobile fields16px, body contrast>=4.5:1.

## Layout sketch
```
Import grade images                              Close
Add screenshots by semester             6/20 images

Year1–1st Semester                     2images  Remove
 [thumb] Image1 · filename.png           Move   Remove
 [thumb] Image2 · screenshot.jpg         Move   Remove
 Drop images here / Choose images

Add semester
Images are processed on this device.
Cancel                                  Scan6images
```
```
Review scanned courses                           Close
6semesters ·42courses ·3need corrections
Review corrections                 Scanned images

> Year1–1st Semester       7courses ·1needs correction
> Year1–2nd Semester       8courses
> Year2–1st Semester       7courses ·2need corrections

Edit images                            Import courses
```
Illustrative counts only; no user record copied into this plan.

## File manifest and dependency order
Paths are relative to R:/Code/BU-GWA Calculator. No app edits are authorized by this document alone; implementation follows user approval.
| Step | File | Single responsibility |
|---|---|---|
|1/4|src/components/scanner/scan-buckets.ts (new)|Pure add/move/remove bucket operations that preserve file/preview pairing and identify affected scan results.|
|1/4|src/components/scanner/__tests__/scan-buckets.test.ts (new)|Check cross-semester moves, limits, no-op moves and stale-result invalidation.|
|1/4|src/core/scan-results.ts|Use Course name in shared photo-review validation copy and expose suspicious-name warnings without inventing values.|
|1/4|src/core/__tests__/scan-results.test.ts|Keep grade/unit/conflict/pending rules intact and verify the renamed review guidance.|
|2/4|src/components/scanner/PhotoScanModal.tsx|Orchestrate protected dismissal, drop/move actions, scan states, collapsed semester review and blocked-field navigation.|
|2/4|src/components/scanner/photo-semester-bucket.tsx (new)|Present one compact semester upload group with thumbnail rows, drop feedback and accessible move/remove controls.|
|3/4|src/components/scanner/scan-review-rows.tsx|Present compact responsive course rows with Course name labels, source provenance and inline issues.|
|3/4|src/css/record-tools-v2.css|Own scoped photo-import spacing, hierarchy, responsive rows and composite-only feedback.|
|4/4|docs/redesign/v2/07-photo-scan.md|Record the implemented checkpoint only after verification.|
|4/4|docs/reviews/2026-11-26-photo-import-workbench-verification.md (new)|Record actual checks, screenshots and OCR limitations after implementation.|

Dependencies: bucket operations/validation first; modal state and session guards next; controlled upload/review views and scoped CSS next; automated/browser verification last. Reuse useAccessibleDialog and ScanSession without introducing another modal or drag library. PhotoScanModal and the compact review markup require substantial restructuring after approval; no files are deleted.

## Risks and acceptance checks
- Close/backdrop/Escape in empty, populated, scanning and edited-review states; Keep working must retain files/results/edits. Confirmed discard must stop workers, release previews and ignore late callbacks.
- External drop into empty/populated semesters, internal move, Move to fallback, same-target no-op, removed target, multiple files, invalid files,20image/100MiB bounds and no double addition from event bubbling.
- No image belongs to two semesters after a move; global limits/counts remain correct; index-based source IDs never link old OCR rows to a new image. Only affected staged results are invalidated.
- Scan completion starts every review semester collapsed as confirmed by the user. Accordion switching retains edits. Retry preserves completed results. Import/review-corrections opens and focuses blocked rows inside collapsed groups.
- Test1/6semesters with1/3/20images, long filenames, seven/many extracted courses, missing fields, conflicts, zero units and pending grades. Numeric-only names get warnings without guessed corrections.
- Both themes at375/390mobile,768tablet and1280/1536desktop; <=85vh mobile dialog, one body scroll, stable footer, no horizontal overflow, keyboard/focus return and reduced-motion behavior.
- Run npm test, npm run build and npm run lint. Current229-test success belongs to the earlier Simulator change, not this proposal. UI checks do not certify OCR recognition accuracy.
- Use synthetic fixtures for commit/import testing. No user academic records, new cloud service, secrets, dependency, Git commit or push in this planning task.

## Primary references
- W3C dragging guidance requires an alternative simple-pointer action for custom dragging: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html. This informs Move to and file-picker alternatives.
- W3C modal guidance informs inert background, trapped focus, explicit closing and focus restoration: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/. Protected-discard confirmation is this app's design choice.
- MDN file-drop guidance distinguishes incoming files from internal moves and keeps file selection available: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop.
