# Record tools and import dialog polish

User-directed UI correction, 2026-11-03. Reviewed live PDF/photo/paste and Clear All dialogs, including staged paste and adding a photo semester, before editing.

## Design and safeguards
- Use one consistent outline-icon family, aligned labels, 48px controls and restrained warm focus/hover states. Clear All remains after Bulk Paste and visibly destructive.
- Keep two columns on narrow screens and avoid overlapping the illustration at tablet sizes.
- Share modal heading rhythm: small workflow label, concise title and round Close. Warm paper/light surfaces and graphite/dark surfaces retain semantic text contrast.
- Import notes become quiet contextual blocks; upload targets use clear boundaries and concise labels. Paste examples remain available in a disclosure rather than crowding the input.
- Fixed header/footer, internally scrolling body and bounded widths keep actions reachable. Cancel remains initial focus for destructive confirmation; Escape/focus return remain intact.
- Preserve append-only staged imports, editable rows, provider disclosures, validation and saved records. Do not send files to OCR or activate Clear All while reviewing the UI.

## Ordered file manifest
1. `components/toolbar/ActionToolbar.tsx`: consistent toolbar icons, dialog semantics and specific affected-term copy.
2. `components/modals/record-dialog-header.tsx`: shared presentational heading/close control.
3. `components/modals/BulkPasteModal.tsx`, `components/scanner/CorScanModal.tsx`, `components/scanner/PhotoScanModal.tsx`: adopt header, clarify input presentation and keep existing handlers.
4. `components/modals/ConfirmModal.tsx`: adopt heading and accessible warning description; keep Cancel focus.
5. `css/record-tools-v2.css`, `index.css`: scoped theme/toolbar/dialog styles; no unrelated page restyling.
6. `docs/redesign/v2/{06-import,07-photo-scan,progress}.md`: updated contract and actual evidence.
- Dependencies: existing Lucide package/theme/dialog hook, then shared header and scoped CSS, then owners. No new runtime package, domain or store changes.

## Verification
- Both themes at 320/375/414/768/1024/1440: toolbar order, 48px targets, no overflow, all four dialogs, visible actions and focus/Escape/return.
- Exercise paste sample/review/edit/cancel, photo add/remove empty semester groups and disclosure controls without importing or running OCR.
- Check selected-semester DOM inputs remain unchanged after every cancel, confirm disabled states, and run build plus focused lint.
- Record real limitations; real-file OCR/PDF extraction quality is outside this presentation check.
