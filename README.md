# Fullstack Fieldnotes

A free, chapter-based Java full-stack learning and interview-preparation hub. The site is a static-exportable Next.js application; content, theme preference, bookmarks, and study progress stay in the browser.

## Run locally

Requirements: Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open the development URL printed by Next.js. `npm run typecheck` checks TypeScript and `npm run validate:curriculum` checks curriculum structure, chapter order, prerequisite references, lesson content, path references, and the required Core Java, Spring Boot, and Docker chapter counts.

## Production and static hosting

Set the canonical site origin when building for deployment, then build the static export:

```sh
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build
```

The static site is written to `out/`. A [`firebase.json`](firebase.json) is included; after installing and authenticating the Firebase CLI, deploy with `firebase deploy --only hosting`. The same `out/` directory works with Cloudflare Pages, Netlify, or another static host. The sitemap and robots routes use `NEXT_PUBLIC_SITE_URL`; the local default is `http://localhost:3000`. No backend or account is required for learners.

## Content authoring

Curricula live in [`content/curriculum.ts`](content/curriculum.ts). Each technology has a stable ID, category, short description, accent, and an ordered chapter array. A chapter has a number, kebab-case stable ID, description, reading estimate, difficulty, prerequisites, learning objectives, and focused lessons. Eight hand-authored guides live in [`content/chapter-guides.ts`](content/chapter-guides.ts). The remaining chapter guides are composed by [`content/derive-chapter-guide.ts`](content/derive-chapter-guide.ts) from that chapter's actual lesson outcomes and a technology-specific mechanism, trade-off, and production profile. Both sources use the same structured Learn, examples/scenarios, comparisons, pitfalls, Q&A, summary, and Quick Revision model and are joined by stable `technology-id/chapter-id` keys. Chapter pages expose Learn, Quick Revision, and Interview Questions modes; progress and lesson bookmarks remain attached to their stable lesson IDs.

`npm run validate:curriculum` checks all 114 composed guides for Learn depth, examples or scenarios, revision-sheet sections, answered interview questions, unresolved lesson/prerequisite references, placeholder text, invalid comparison tables, and duplicated instructional units. Use `npm run validate:curriculum -- --inventory` to print per-chapter gaps while authoring a batch. The validator's structural gates complement technical review; generated explanations should still be refined when a chapter needs technology- or version-specific detail.

To add a technology, add its chapters to `CURRICULA`, include its ID in the relevant `LEARNING_PATHS` and `ROADMAP_PHASES`, and run the curriculum validator and production build. Keep chapter numbers sequential and prerequisite labels aligned with existing chapter titles. The Angular/React choice is stored in local storage and substitutes one framework for the other in the active learning path.

## Learner data

Progress, bookmarks, personal lesson notes, recently opened chapters, selected learning path, and frontend choice use the `fieldnotes-study-v1` local-storage key. Theme preference uses `fieldnotes-theme`; the initial theme follows the operating system. Data is device-local and can be reset from the Progress page. Browser storage failures do not prevent reading.

## Routes

- `/` roadmap and learning-path selection
- `/curriculum/[technology]` ordered chapter list
- `/curriculum/[technology]/[chapter]` chapter study page
- `/bookmarks`, `/progress`, and `/revision` learner views
- `/sitemap.xml` and `/robots.txt` deployment metadata