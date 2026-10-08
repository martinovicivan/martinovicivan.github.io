# Notebook-style academic website

A personal research site that looks like a Jupyter notebook. As you scroll, each
cell types its Python code, the kernel goes busy, and the section appears as the
cell's output. Plain HTML/CSS/JS, no build step, no dependencies.

| file         | what it is                                         |
|--------------|----------------------------------------------------|
| `content.js` | **all your content** — the only file you need to edit |
| `index.html` | page shell (window chrome, toolbar, status bar)    |
| `app.js`     | highlighter, typing/execution engine, cell renderers |
| `style.css`  | dark + light themes, mobile layout                 |

## Edit
Open `content.js` and replace the placeholders: bio, links, news, publications,
teaching. Text fields accept HTML. Notes:
- `photo: "assets/profile.jpg"` — put the image in `assets/`; empty → initials avatar.
- Publications: `selected: true` puts a paper in the default view; BibTeX is
  generated automatically unless you supply `bibtex`. Your name (and
  `nameAliases`) is highlighted in author lists.
- Empty `news` / `publications` / `teaching` arrays hide that cell.
- `cv` (education, experience, awards) feeds the second tab, `cv.ipynb`; the
  `cv` button opens it via `#cv`. Point `links.cv` at a PDF later to get a `cv.pdf` tab.

## Preview
Just open `index.html` in a browser, or `python3 -m http.server` and visit
http://localhost:8000.

## Deploy (GitHub Pages)
Create a repo named `<username>.github.io`, push these files, and enable Pages
(Settings → Pages → deploy from branch `main`, root). Any static host works.

## Add a section
Push another object onto `defs` in `app.js` (see the `teaching` cell): give it an
`id`, `file`, `ext`, a `code()` function returning the Python shown, and a
`render()` function returning the output HTML. Set `result: true` to get an
`Out[n]:` prompt.
Cells of the CV tab live in `cvDefs`. Cell ids must be unique across notebooks,
and every `#id` link switches to whichever notebook contains that id.

## Little extras
- ▶ / Shift+Enter run the current cell and move on; ▶▶ runs everything; ↻ restarts the kernel (replays the animation).
- J / K jump between cells; double-click the title cell to see its raw markdown.
- Theme toggle (top right) is remembered; `prefers-reduced-motion` skips the animations.
