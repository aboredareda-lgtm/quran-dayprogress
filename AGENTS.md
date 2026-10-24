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
- Mushaf reading and search results share the same ayah-text renderer, deriving sajdah annotations from the bundled text's existing marker so Quran content and locations stay unchanged.
