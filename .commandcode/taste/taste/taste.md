# Taste
- Maintains a portfolio site that is fully bilingual (Indonesian `id` and English `en`) via an i18n system in `language-controls.js`; content changes should be added to both language blocks and use the existing `data-i18n-key` convention so nothing is left untranslated. Confidence: 0.7
- Communicates in casual mixed Indonesian–English; respond in the same light, informal register rather than stiff formal English (e.g., colloquial spellings like "pake"). Confidence: 0.9
- Values performance optimization and actively opts into concrete wins: deferring non-critical scripts, preconnect/resource hints, lazy-loading heavy libraries (e.g., the ~900 KB Excel parser loaded on demand), and gating heavy features like the mascot script to only the pages that need it. Confidence: 0.7
- Wants a written implementation plan before multi-step changes are executed. Confidence: 0.6
- Prefers minimal loading indicators — a plain pulsing square with no image or text, hidden once the page finishes loading. Confidence: 0.6
- Wants to visually review site changes in the browser — asks for a local server to be started with URLs to open, rather than relying only on programmatic verification; expects the server to be stopped when they're done. Confidence: 0.5
