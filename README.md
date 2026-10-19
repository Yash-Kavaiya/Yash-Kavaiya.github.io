# yash-kavaiya.github.io

Personal site of **Yash Kavaiya** — Senior Conversational AI Engineer (Google ADK · CX Agent Studio · Dialogflow CX · Gemini).

Live: https://yash-kavaiya.github.io/

## Structure

```
index.html          Page markup (about, experience, talks, skills, education, contact)
assets/js/data.js   Projects and posts — edit this to add new work
assets/js/main.js   Filtering, search, theme toggle, contact form
assets/css/style.css
404.html, robots.txt, sitemap.xml
```

## Adding content

- **Project:** add an object to `projects` in `assets/js/data.js`
  (`name`, `desc`, `tags`, `category`, and any of `demo`, `video`, `repo`, `slides`; set `featured: true` to pin it to the top).
- **Post (Medium / LinkedIn / X):** add an object to `posts` with `type` of `article`, `linkedin` or `x`.
- **Talk:** copy an `<article class="talk">` block in the Talks section of `index.html`.

No build step — it's plain HTML/CSS/JS served by GitHub Pages. Preview locally with `python3 -m http.server`.
