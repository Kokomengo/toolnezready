# ToolNez

36 free browser tools for images, video, PDF, text, calculations and developer tasks.
Every tool includes instructions, a worked example and limitations. Four original guides explain workflows.
Live: https://toolnez.vercel.app

## Build and verify

Requires Node.js 20 or newer. No external build dependencies.

```sh
npm run build
npm test
```

The build writes `public/`: 56 complete HTML content pages, a noindex 404, shared assets,
sitemap.xml and llms.txt. Vercel uses clean URLs, the build command in vercel.json and public as output.
Local source index.html is a template with a readable fallback; serve the generated public folder for preview.

## Main files

- core.js: shared rendering, normal URL routing, search, favorites and tool registry.
- tools-*.js and lib.js: tool implementations and local file writers.
- editorial.js: help matched to each of the 36 tools.
- guides.js: four workflow articles.
- site-pages.js: publisher, editorial policy, privacy, terms, contact and changelog.
- adsense.js: disabled advertising, eligible-guide gate and CMP integration hooks.
- build-seo.js: static page generation with per-page title, description and canonical.
- tests/site.test.js: content routes, assets, links, ad gate and numerical examples.

Existing fragment links such as /#/t/percentage redirect to /tools/percentage.
There is no ToolNez file-upload API. PDF readers fetch pdf.js on demand; Markdown drafts use localStorage.

## Advertising

The publisher ID and ads.txt remain configured. Ad serving is **disabled during review**.
Verification uses the google-adsense-account meta tag.
Auto ads must also be disabled in the AdSense dashboard: the local autoAds flag cannot change a Google setting.
After approval, only separate editorial guides may receive one manual unit, after required consent.
See ADSENSE.md for setup and resubmission steps. Approval remains Google's decision.

## Dependencies and source

Plain HTML, CSS and JavaScript. PDF decoding uses pdf.js under Apache 2.0.
The code and history are available at https://github.com/Kokomengo/toolnez.

