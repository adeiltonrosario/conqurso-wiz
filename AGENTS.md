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

- Laws live in a central catalog (edital.catalogoLeis) and are linked to subjects by key (file name, else URL), so one law can serve any banca/cargo without duplication.
- Spreadsheet edital import (src/lib/edital-planilha.ts) creates banca+cargo together and only replaces subjects of that same banca+cargo, so other contests never mix.
