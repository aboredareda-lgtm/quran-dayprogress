<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Welcome media uses a CDN pointer with a bundled on-error fallback because Capacitor must display the cover offline.
- Welcome dates use device-local days and the Umm al-Qura calendar after hydration, refreshing while open so offline use and SSR remain reliable.
- Mushaf reading and search results share the same ayah-text renderer, deriving sajdah annotations from the bundled text's existing marker so Quran content and locations stay unchanged.
- Quran segmentation keeps source text intact for search/storage; reference-approved spelling adjustments are display-only in the shared renderer so reading, search and favorites remain consistent.
- Voice search uses the browser SpeechRecognition service with Arabic input and feeds the existing local Quran search; keep typed search available and stop microphone access when the search closes, without adding a server or uploading reading history.
- Contact email links use a browser-safe formatter to preserve sender input and append app attribution without introducing server-side sending.
- Adhkar content, period applicability, wording and reviewed repetition limits live in a browser-safe module with source links; morning and evening counters are separate except explicitly daily adhkar use one shared session counter to avoid duplicating daily targets; no reading data is sent or changed.
- The illustrated followup dashboard is presentation-only over the existing local reading hooks; preserve the legacy layout behind a reversible device preference, use existing prayer calculations only with a saved location, and link adhkar cards through validated period search parameters.
