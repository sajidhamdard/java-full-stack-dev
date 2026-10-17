"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight, ArrowLeft, ArrowRight, Bookmark, BookOpen, Check, CheckCircle2, Copy,
  ChevronDown, CircleHelp, Clock3, Code2, Compass, ExternalLink, Flame, Laptop,
  ListChecks, Menu, Moon, Printer, RotateCcw, Search, Sun, X,
} from "lucide-react";
import {
  CURRICULA, LEARNING_PATHS, ROADMAP_PHASES, TECHNOLOGY_BY_ID,
  type Chapter, type LearningPath, type Lesson, type Technology,
} from "@/content/curriculum";

type HubProps = { initialTechnologyId?: string; initialChapterId?: string; initialView?: "bookmarks" | "progress" | "revision" };
type SavedState = { completed: string[]; bookmarks: string[]; recent: string[]; notes: Record<string, string>; path: LearningPath["id"]; frontend: "react" | "angular" };
const STORAGE_KEY = "fieldnotes-study-v1";
const emptyState: SavedState = { completed: [], bookmarks: [], recent: [], notes: {}, path: "beginner", frontend: "react" };
const routeFor = (technology: Technology, chapter?: Chapter) =>
  `/curriculum/${technology.id}${chapter ? `/${chapter.id}` : ""}`;
const lessonKey = (technology: Technology, lesson: Lesson) => `${technology.id}/${lesson.id}`;
const chapterKey = (technology: Technology, chapter: Chapter) => `${technology.id}/${chapter.id}`;
function findChapterByTitle(title: string) {
  const expected = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  return CURRICULA.flatMap((technology) => technology.chapters.map((chapter) => ({ technology, chapter })))
    .find(({ chapter }) => {
      const candidate = chapter.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      return candidate === expected || candidate.includes(expected) || expected.includes(candidate);
    });
}
const levelClass = (level: string) => `level level-${level.toLowerCase()}`;
function unresolvedPrerequisites(chapter: Chapter, completed: string[]) {
  return chapter.prerequisites.filter((prerequisite) => {
    const expected = prerequisite.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matches = CURRICULA.flatMap((technology) => technology.chapters
      .filter((candidate) => {
        const title = candidate.title.toLowerCase().replace(/[^a-z0-9]/g, "");
        return title === expected || title.includes(expected) || expected.includes(title);
      })
      .map((candidate) => ({ technology, chapter: candidate })));
    return matches.length === 0 || !matches.some(({ technology, chapter: candidate }) => candidate.lessons.every((lesson) => completed.includes(lessonKey(technology, lesson))));
  });
}

function ProgressBar({ value, quiet = false }: { value: number; quiet?: boolean }) {
  return <div className={`progress-track${quiet ? " progress-quiet" : ""}`} role="progressbar" aria-label="Completion" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }} /></div>;
}

export default function Hub({ initialTechnologyId, initialChapterId, initialView }: HubProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchInput = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState<SavedState>(emptyState);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pathMenuOpen, setPathMenuOpen] = useState(false);

  useEffect(() => {
    let state = emptyState;
    let storedTheme: string | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const candidate = JSON.parse(raw) as Partial<SavedState>;
        state = {
          completed: Array.isArray(candidate.completed) ? candidate.completed.filter((item): item is string => typeof item === "string") : [],
          bookmarks: Array.isArray(candidate.bookmarks) ? candidate.bookmarks.filter((item): item is string => typeof item === "string") : [],
          recent: Array.isArray(candidate.recent) ? candidate.recent.filter((item): item is string => typeof item === "string") : [],
          notes: candidate.notes && typeof candidate.notes === "object" && !Array.isArray(candidate.notes)
            ? Object.fromEntries(Object.entries(candidate.notes).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
            : {},
          path: LEARNING_PATHS.some((path) => path.id === candidate.path) ? candidate.path as SavedState["path"] : "beginner",
          frontend: candidate.frontend === "angular" ? "angular" : "react",
        };
      }
      storedTheme = window.localStorage.getItem("fieldnotes-theme");
    } catch { /* Storage may be disabled or contain invalid data. */ }
    setSaved(state);
    setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setReady(true);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      window.localStorage.setItem("fieldnotes-theme", theme);
    } catch { /* The curriculum remains usable when storage is unavailable. */ }
  }, [saved, theme, ready]);

  useEffect(() => {
    if (!ready) return;
    const technology = initialTechnologyId ? TECHNOLOGY_BY_ID.get(initialTechnologyId) : undefined;
    const chapter = technology?.chapters.find((item) => item.id === initialChapterId);
    if (!technology || !chapter) return;
    const key = chapterKey(technology, chapter);
    setSaved((previous) => ({ ...previous, recent: [key, ...previous.recent.filter((item) => item !== key)].slice(0, 8) }));
    if (window.location.hash) {
      window.setTimeout(() => document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
    }
  }, [initialTechnologyId, initialChapterId, ready]);

  const currentPath = LEARNING_PATHS.find((path) => path.id === saved.path) ?? LEARNING_PATHS[0];
  const activePath: LearningPath = { ...currentPath, sequence: currentPath.sequence.map((id) => id === "react" ? saved.frontend : id) };
  const currentTechnology = initialTechnologyId ? TECHNOLOGY_BY_ID.get(initialTechnologyId) : undefined;
  const currentChapter = currentTechnology?.chapters.find((chapter) => chapter.id === initialChapterId);
  const flatLessons = useMemo(() => CURRICULA.flatMap((technology) => technology.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ technology, chapter, lesson })))), []);
  const searchResults = query.trim().length < 2 ? [] : flatLessons.filter(({ technology, chapter, lesson }) =>
    `${lesson.title} ${lesson.outcome} ${chapter.title} ${technology.title} ${technology.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).slice(0, 7);
  const searchGroups = [...new Set(searchResults.map(({ technology }) => technology.category))].map((category) => ({
    category,
    results: searchResults.filter(({ technology }) => technology.category === category),
  }));
  const totalLessons = flatLessons.length;
  const pathTechs = activePath.sequence.map((id) => TECHNOLOGY_BY_ID.get(id)).filter((item): item is Technology => !!item);
  const pathLessons = pathTechs.flatMap((technology) => technology.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ technology, lesson }))));
  const completedPathLessons = pathLessons.filter(({ technology, lesson }) => saved.completed.includes(lessonKey(technology, lesson))).length;
  const overallProgress = pathLessons.length ? Math.round(completedPathLessons / pathLessons.length * 100) : 0;
  const activePathIndex = activePath.sequence.indexOf(currentTechnology?.id ?? "");

  function lessonsDone(technology: Technology, chapter: Chapter) {
    return chapter.lessons.filter((lesson) => saved.completed.includes(lessonKey(technology, lesson))).length;
  }
  function chapterPercent(technology: Technology, chapter: Chapter) {
    return Math.round(lessonsDone(technology, chapter) / chapter.lessons.length * 100);
  }
  function technologyPercent(technology: Technology, onlyChapter?: Chapter) {
    const all = (onlyChapter ? [onlyChapter] : technology.chapters).flatMap((chapter) => chapter.lessons);
    if (!all.length) return 0;
    return Math.round(all.filter((lesson) => saved.completed.includes(lessonKey(technology, lesson))).length / all.length * 100);
  }
  function toggleLesson(technology: Technology, lesson: Lesson) {
    const key = lessonKey(technology, lesson);
    setSaved((previous) => ({ ...previous, completed: previous.completed.includes(key) ? previous.completed.filter((item) => item !== key) : [...previous.completed, key] }));
  }
  function toggleBookmark(technology: Technology, lesson: Lesson) {
    const key = lessonKey(technology, lesson);
    setSaved((previous) => ({ ...previous, bookmarks: previous.bookmarks.includes(key) ? previous.bookmarks.filter((item) => item !== key) : [...previous.bookmarks, key] }));
  }
  function updateNote(technology: Technology, lesson: Lesson, note: string) {
    const key = lessonKey(technology, lesson);
    setSaved((previous) => {
      const notes = { ...previous.notes };
      if (note.trim()) notes[key] = note;
      else delete notes[key];
      return { ...previous, notes };
    });
  }
  function markChapter(technology: Technology, chapter: Chapter) {
    const keys = chapter.lessons.map((lesson) => lessonKey(technology, lesson));
    const complete = keys.every((key) => saved.completed.includes(key));
    setSaved((previous) => ({ ...previous, completed: complete ? previous.completed.filter((key) => !keys.includes(key)) : [...new Set([...previous.completed, ...keys])] }));
  }
  function selectPath(path: LearningPath) {
    setSaved((previous) => ({ ...previous, path: path.id }));
    setPathMenuOpen(false);
  }
  function selectFrontend(frontend: SavedState["frontend"]) {
    setSaved((previous) => ({ ...previous, frontend }));
  }
  function resetProgress() {
    if (window.confirm("Reset completed lessons, bookmarks, personal notes, and recent chapters on this device?")) {
      setSaved((previous) => ({ ...emptyState, path: previous.path, frontend: previous.frontend }));
    }
  }
  function goToSearchResult(technology: Technology, chapter: Chapter, lesson: Lesson) {
    setQuery("");
    setSearchOpen(false);
    setSidebarOpen(false);
    router.push(`${routeFor(technology, chapter)}#lesson-${lesson.id}`);
  }

  const recentChapters = saved.recent.map((id) => {
    const [technologyId, chapterId] = id.split("/");
    const technology = TECHNOLOGY_BY_ID.get(technologyId);
    const chapter = technology?.chapters.find((item) => item.id === chapterId);
    return technology && chapter ? { technology, chapter } : undefined;
  }).filter((item): item is { technology: Technology; chapter: Chapter } => !!item).slice(0, 3);

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Fullstack Fieldnotes home"><span className="brand-mark"><Code2 size={17} /></span><span>fullstack <b>fieldnotes</b></span></Link>
        <div className={`search-wrap${searchOpen ? " search-active" : ""}`}>
          <Search size={16} aria-hidden="true" />
          <input ref={searchInput} aria-label="Search lessons" placeholder="Search lessons, concepts, technologies..." value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") { setSearchOpen(false); setQuery(""); } }} />
          <kbd>⌘ K</kbd>
          {searchOpen && query.trim().length >= 2 && <div className="search-results" role="listbox" aria-label="Search results">
            {searchResults.length ? searchGroups.map((group) => <div className="search-group" key={group.category} role="group" aria-label={group.category}><span className="search-group-label">{group.category}</span>{group.results.map(({ technology, chapter, lesson }) => <button key={lessonKey(technology, lesson)} role="option" aria-selected="false" className="search-result" onClick={() => goToSearchResult(technology, chapter, lesson)}><span className="result-book"><BookOpen size={16} /></span><span className="result-text"><strong>{lesson.title}</strong><small>{technology.title} <span>/</span> Ch. {chapter.number}: {chapter.title}</small></span><ArrowRight size={15} /></button>)}</div>) : <p className="search-empty">No lessons found for “{query}”.</p>}
          </div>}
        </div>
        <nav className="top-links" aria-label="Main navigation"><Link className={pathname === "/" ? "top-link-active" : ""} href="/">Roadmap</Link><Link className={pathname === "/bookmarks" ? "top-link-active" : ""} href="/bookmarks">Bookmarks</Link><Link className={pathname === "/progress" ? "top-link-active" : ""} href="/progress">Progress</Link><Link className={pathname === "/revision" ? "top-link-active" : ""} href="/revision">Revision</Link></nav>
        <button className="icon-button theme-toggle" title={`Switch to ${theme === "light" ? "dark" : "light"} theme`} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>
        <button className="icon-button mobile-menu" aria-label={sidebarOpen ? "Close navigation" : "Open navigation"} onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </header>
      {searchOpen && <button className="search-dismiss" aria-label="Close search results" onClick={() => setSearchOpen(false)} />}
      <div className="workspace">
        <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
          <div className="side-heading">YOUR LEARNING PATH</div>
          <div className="path-picker-wrap">
            <button className="path-picker" aria-expanded={pathMenuOpen} onClick={() => setPathMenuOpen(!pathMenuOpen)}><span className="path-picker-icon"><Compass size={16} /></span><span><b>{currentPath.title}</b><small>{currentPath.label}</small></span><ChevronDown size={15} /></button>
            {pathMenuOpen && <div className="path-menu">{LEARNING_PATHS.map((path) => <button key={path.id} onClick={() => selectPath(path)} className={path.id === currentPath.id ? "path-option selected" : "path-option"}><span>{path.title}</span>{path.id === currentPath.id && <Check size={15} />}</button>)}</div>}
          </div>
          <div className="side-progress"><div className="side-progress-label"><span>PATH PROGRESS</span><b>{overallProgress}%</b></div><ProgressBar value={overallProgress} quiet /><small>{completedPathLessons} of {pathLessons.length} lessons</small></div>
          <div className="side-heading side-section-heading">STUDY ORDER <span>{pathTechs.length} STAGES</span></div>
          <nav className="curriculum-nav" aria-label="Curriculum by technology">
            {pathTechs.map((technology, index) => {
              const active = technology.id === currentTechnology?.id;
              const route = routeFor(technology);
              return <Link key={technology.id} href={route} className={`side-tech${active ? " side-tech-active" : ""}`} onClick={() => setSidebarOpen(false)}><span className="stage-index">{String(index + 1).padStart(2, "0")}</span><span className="side-tech-title">{technology.title}</span>{technologyPercent(technology) === 100 ? <CheckCircle2 size={14} className="side-done" /> : active ? <span className="side-active-dot" /> : null}</Link>;
            })}
          </nav>
          <nav className="side-utility-nav" aria-label="Study tools"><Link href="/bookmarks" onClick={() => setSidebarOpen(false)}><Bookmark size={14} /> Bookmarks</Link><Link href="/progress" onClick={() => setSidebarOpen(false)}><ListChecks size={14} /> Progress</Link><Link href="/revision" onClick={() => setSidebarOpen(false)}><CircleHelp size={14} /> Quick revision</Link></nav>
          <div className="side-foot"><span>Keep a steady pace.</span><Flame size={15} /></div>
        </aside>

        <main className="main-content" onClick={() => { if (sidebarOpen) setSidebarOpen(false); }}>
          {initialView === "bookmarks" ? <BookmarksView bookmarks={saved.bookmarks} flatLessons={flatLessons} toggleBookmark={toggleBookmark} /> : initialView === "progress" ? <ProgressView path={currentPath} pathTechs={pathTechs} progress={technologyPercent} chapterProgress={chapterPercent} completedCount={saved.completed.length} resetProgress={resetProgress} /> : initialView === "revision" ? <RevisionView /> : !currentTechnology ? <RoadmapHome currentPath={currentPath} pathTechs={pathTechs} progress={technologyPercent} done={saved.completed.length} recentChapters={recentChapters} choosePath={selectPath} frontend={saved.frontend} selectFrontend={selectFrontend} /> : currentChapter ? <ChapterPage technology={currentTechnology} chapter={currentChapter} progress={chapterPercent(currentTechnology, currentChapter)} done={lessonsDone(currentTechnology, currentChapter)} completed={saved.completed} bookmarks={saved.bookmarks} notes={saved.notes} toggleLesson={toggleLesson} toggleBookmark={toggleBookmark} updateNote={updateNote} markChapter={markChapter} /> : <TechnologyPage technology={currentTechnology} path={activePath} pathIndex={activePathIndex} percent={technologyPercent(currentTechnology)} progress={chapterPercent} done={lessonsDone} completed={saved.completed} onToggleLesson={toggleLesson} />}
          <footer className="page-footer"><span>Made for the long game.</span><span>{CURRICULA.length} curricula <i /> {totalLessons} focused lessons</span></footer>
        </main>
      </div>
    </div>
  );
}

function RoadmapHome({ currentPath, pathTechs, progress, done, recentChapters, choosePath, frontend, selectFrontend }: {
  currentPath: LearningPath; pathTechs: Technology[]; progress: (technology: Technology, chapter?: Chapter) => number; done: number;
  recentChapters: { technology: Technology; chapter: Chapter }[]; choosePath: (path: LearningPath) => void;
  frontend: "react" | "angular"; selectFrontend: (frontend: "react" | "angular") => void;
}) {
  const nextTechnology = pathTechs.find((technology) => progress(technology) < 100) ?? pathTechs[0];
  const nextChapter = nextTechnology?.chapters.find((chapter) => progress(nextTechnology, chapter) < 100) ?? nextTechnology?.chapters.at(-1);
  return <div className="home-view">
    <div className="home-intro"><div className="intro-left"><div className="eyebrow"><span className="eyebrow-line" /> THE JAVA FULL-STACK FIELD GUIDE</div><h1>Java Full-Stack<br /><em>Developer Roadmap.</em></h1><p>A carefully sequenced curriculum for building real engineering judgment, one chapter at a time.</p></div><div className="intro-art" aria-hidden="true"><div className="orbit orbit-outer" /><div className="orbit orbit-middle" /><div className="orbit orbit-inner" /><span className="orbit-core"><Code2 size={29} /></span><span className="orbit-node node-one"><BookOpen size={15} /></span><span className="orbit-node node-two"><ListChecks size={15} /></span><span className="orbit-node node-three"><Laptop size={15} /></span><span className="orbit-caption">LEARN / BUILD / REPEAT</span></div></div>
    <section className="path-section"><div className="section-topline"><div><span className="eyebrow">PICK UP WHERE YOU ARE</span><h2>Three ways into the material.</h2></div><span className="section-aside">FOUNDATION SHARED · DEPTH CHANGES</span></div><div className="path-cards">{LEARNING_PATHS.map((path, index) => <button key={path.id} className={`path-card path-card-${index + 1}${path.id === currentPath.id ? " path-card-current" : ""}`} onClick={() => choosePath(path)}><div className="path-card-top"><span className="path-letter">0{index + 1}</span>{path.id === currentPath.id && <span className="path-current-tag"><Check size={12} /> CURRENT</span>}<ArrowDownRight size={17} /></div><h3>{path.title}</h3><p>{path.description}</p><span className="path-card-foot">{path.sequence.length} TECHNOLOGY STAGES <ArrowRight size={13} /></span></button>)}</div></section>
    <section className="framework-choice"><div><span className="eyebrow">YOUR FRONTEND TRACK</span><h2>Choose one to go deeper.</h2><p>Shared web foundations stay in the roadmap. Your main path continues with one framework.</p></div><div className="framework-options" role="group" aria-label="Choose your primary frontend framework">{(["react", "angular"] as const).map((framework) => <button key={framework} aria-pressed={frontend === framework} className={frontend === framework ? "framework-option framework-selected" : "framework-option"} onClick={() => selectFrontend(framework)}><span>{framework === "react" ? "React" : "Angular"}</span>{frontend === framework && <CheckCircle2 size={15} />}</button>)}</div></section>
    <section className="resume-section" id="saved-work"><div className="resume-heading"><div><span className="eyebrow">YOUR PROGRESS</span><h2>Keep the thread.</h2></div><Link className="text-link" href={nextTechnology ? routeFor(nextTechnology, nextChapter) : "/"}>{done ? "Continue learning" : "Begin the first chapter"}<ArrowRight size={15} /></Link></div><div className="resume-grid"><div className="resume-feature"><div className="resume-feature-top"><span className="resume-icon"><BookOpen size={19} /></span><span className="resume-kicker">{done ? "PICK UP NEXT" : "RECOMMENDED FIRST STEP"}</span></div><h3>{nextTechnology?.title ?? "Core Java"}</h3><p>{nextChapter ? `Chapter ${nextChapter.number}: ${nextChapter.title}` : "Start your chosen path"}</p><ProgressBar value={nextTechnology ? progress(nextTechnology) : 0} /><Link href={nextTechnology ? routeFor(nextTechnology, nextChapter) : "/"} className="button-primary">{done ? "Continue chapter" : "Start learning"}<ArrowRight size={15} /></Link></div><div className="resume-recent"><div className="resume-recent-heading"><span>RECENT CHAPTERS</span><Clock3 size={15} /></div>{recentChapters.length ? recentChapters.map(({ technology, chapter }) => <Link key={chapterKey(technology, chapter)} href={routeFor(technology, chapter)} className="recent-row"><span className="recent-chapter-num">{String(chapter.number).padStart(2, "0")}</span><span><b>{chapter.title}</b><small>{technology.title}</small></span><ArrowRight size={15} /></Link>) : <div className="recent-empty"><span className="recent-empty-mark"><ArrowRight size={15} /></span><p>Your opened chapters will show up here.</p></div>}</div></div></section>
    <section className="roadmap-section"><div className="section-topline"><div><span className="eyebrow">THE LEARNING ROADMAP</span><h2>One useful step at a time.</h2></div><span className="section-aside">DSA RUNS ALONGSIDE YOUR PROJECTS</span></div><div className="roadmap-phases">{ROADMAP_PHASES.map((phase, phaseIndex) => <div className="roadmap-phase" key={phase.title}><div className="phase-marker"><span>{String(phaseIndex + 1).padStart(2, "0")}</span><i /></div><div className="phase-content"><div className="phase-title">{phase.title}</div><div className="phase-techs">{phase.ids.map((id) => { const technology = TECHNOLOGY_BY_ID.get(id); return technology ? <Link href={routeFor(technology)} key={id}><span className="phase-dot" style={{ background: technology.accent }} />{technology.title}<ArrowRight size={13} /></Link> : null; })}</div></div></div>)}</div></section>
    <section className="all-tech-section"><div className="section-topline"><div><span className="eyebrow">BROWSE THE CURRICULUM</span><h2>Find your next subject.</h2></div><span className="section-aside">{CURRICULA.length} ORDERED TECHNOLOGY CURRICULA</span></div><div className="technology-grid">{CURRICULA.map((technology) => <Link key={technology.id} href={routeFor(technology)} className="technology-tile"><span className="tile-accent" style={{ background: technology.accent }} /><span className="tile-info"><small>{technology.category.toUpperCase()}</small><b>{technology.title}</b><span>{technology.chapters.length} chapters <i /> {technology.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} lessons</span></span><ArrowRight size={16} /></Link>)}</div></section>
  </div>;
}

function BookmarksView({ bookmarks, flatLessons, toggleBookmark }: {
  bookmarks: string[];
  flatLessons: { technology: Technology; chapter: Chapter; lesson: Lesson }[];
  toggleBookmark: (technology: Technology, lesson: Lesson) => void;
}) {
  const entries = flatLessons.filter(({ technology, lesson }) => bookmarks.includes(lessonKey(technology, lesson)));
  return <div className="saved-view"><div className="breadcrumbs"><Link href="/">Roadmap</Link><span>/</span><b>Bookmarks</b></div><div className="saved-view-heading"><div className="eyebrow"><span className="eyebrow-line" /> YOUR REFERENCE SHELF</div><h1>Saved for later.</h1><p>Keep useful lessons close for interview prep and quick return visits.</p></div>{entries.length ? <div className="saved-list">{entries.map(({ technology, chapter, lesson }) => <article className="saved-row" key={lessonKey(technology, lesson)}><span className="saved-row-mark"><Bookmark size={16} fill="currentColor" /></span><div className="saved-row-copy"><small>{technology.title} <span>/</span> CHAPTER {chapter.number}: {chapter.title}</small><h2>{lesson.title}</h2><p>{lesson.outcome}</p></div><Link href={`${routeFor(technology, chapter)}#lesson-${lesson.id}`} className="saved-open" aria-label={`Open ${lesson.title}`}><ArrowRight size={16} /></Link><button className="bookmark-button saved-remove" aria-label={`Remove ${lesson.title} bookmark`} title="Remove bookmark" onClick={() => toggleBookmark(technology, lesson)}><X size={15} /></button></article>)}</div> : <div className="saved-empty"><Bookmark size={22} /><h2>No saved lessons yet.</h2><p>Bookmark a lesson with the marker beside its title to keep it here.</p><Link href="/">Browse the roadmap <ArrowRight size={15} /></Link></div>}</div>;
}

function ProgressView({ path, pathTechs, progress, chapterProgress, completedCount, resetProgress }: {
  path: LearningPath; pathTechs: Technology[]; progress: (technology: Technology) => number;
  chapterProgress: (technology: Technology, chapter: Chapter) => number; completedCount: number; resetProgress: () => void;
}) {
  const total = pathTechs.reduce((sum, technology) => sum + technology.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.lessons.length, 0), 0);
  const completed = pathTechs.reduce((sum, technology) => sum + technology.chapters.reduce((chapterSum, chapter) => chapterSum + chapterProgress(technology, chapter) / 100 * chapter.lessons.length, 0), 0);
  const percent = total ? Math.round(completed / total * 100) : 0;
  return <div className="saved-view progress-view"><div className="breadcrumbs"><Link href="/">Roadmap</Link><span>/</span><b>Progress</b></div><div className="saved-view-heading"><div className="eyebrow"><span className="eyebrow-line" /> A CLEAR VIEW OF YOUR WORK</div><h1>Progress, at a glance.</h1><p>{path.title} · {completedCount} lessons checked off across your curricula.</p></div><section className="progress-summary"><div><small>PATH COMPLETION</small><strong>{percent}%</strong><ProgressBar value={percent} /></div><div><small>TECHNOLOGY STAGES</small><strong>{pathTechs.length}</strong><span>in recommended order</span></div><div><small>COMPLETED LESSONS</small><strong>{completedCount}</strong><span>saved on this device</span></div></section><div className="progress-list-heading"><h2>Your learning path.</h2><span>CHAPTER DETAIL</span></div><div className="progress-tech-list">{pathTechs.map((technology, index) => <details className="progress-tech" key={technology.id}><summary><span className="stage-index">{String(index + 1).padStart(2, "0")}</span><span className="progress-tech-name"><b>{technology.title}</b><small>{technology.chapters.length} chapters · {technology.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} lessons</small></span><ProgressBar value={progress(technology)} quiet /><span className="progress-tech-value">{progress(technology)}%</span><ChevronDown size={15} /></summary><div className="progress-chapters">{technology.chapters.map((chapter) => <Link key={chapter.id} href={routeFor(technology, chapter)}><span>{String(chapter.number).padStart(2, "0")}</span><b>{chapter.title}</b><ProgressBar value={chapterProgress(technology, chapter)} quiet /><small>{chapterProgress(technology, chapter)}%</small></Link>)}</div></details>)}</div><div className="reset-row"><span><b>Reset local learning data</b><small>Clears completed lessons, bookmarks, and recently opened chapters.</small></span><button className="button-secondary" onClick={resetProgress}><RotateCcw size={14} /> Reset progress</button></div></div>;
}

function RevisionView() {
  const chapters = CURRICULA.flatMap((technology) => technology.chapters.filter((chapter) => chapter.quickRevision).map((chapter) => ({ technology, chapter })));
  return <div className="saved-view revision-view"><div className="breadcrumbs"><Link href="/">Roadmap</Link><span>/</span><b>Quick revision</b></div><div className="saved-view-heading"><div className="eyebrow"><span className="eyebrow-line" /> SHORT-FORM RECALL</div><h1>Review the essentials.</h1><p>Interview-day notes, implementation details, practical scenarios, and answered questions for every chapter.</p></div><div className="revision-list">{CURRICULA.map((technology) => { const items = chapters.filter((item) => item.technology.id === technology.id); return items.length ? <section className="revision-technology" key={technology.id}><h2><span className="phase-dot" style={{ background: technology.accent }} />{technology.title}</h2>{items.map(({ chapter }) => { const sheet = chapter.quickRevision!; return <details className="revision-chapter" key={chapter.id}><summary><span>CHAPTER {chapter.number}</span><b>{chapter.title}</b><ChevronDown size={15} /></summary><div className="revision-chapter-body"><ul>{[...sheet.definitions, ...sheet.rules, ...sheet.internals, ...sheet.complexity, ...sheet.pitfalls, ...sheet.scenarios].map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>{sheet.example && <div className="revision-example"><div className="section-label">{sheet.example.language.toUpperCase()} · QUICK SYNTAX</div><pre><code>{sheet.example.code}</code></pre><p>{sheet.example.explanation ?? sheet.example.output}</p></div>}<p className="thirty-second-summary">{sheet.summary}</p>{chapter.questions?.map((item) => <details className="question-item" key={item.question}><summary><CircleHelp size={15} /><span>{item.question}</span><ChevronDown size={14} /></summary><p>{item.answer}</p></details>)}<Link href={routeFor(technology, chapter)}>Open full chapter <ArrowRight size={13} /></Link></div></details>; })}</section> : null; })}</div></div>;
}

function TechnologyPage({ technology, path, pathIndex, percent, progress, done, completed, onToggleLesson }: {
  technology: Technology; path: LearningPath; pathIndex: number; percent: number;
  progress: (technology: Technology, chapter: Chapter) => number; done: (technology: Technology, chapter: Chapter) => number;
  completed: string[]; onToggleLesson: (technology: Technology, lesson: Lesson) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const firstIncomplete = technology.chapters.find((chapter) => progress(technology, chapter) < 100);
  const previousTech = pathIndex > 0 ? TECHNOLOGY_BY_ID.get(path.sequence[pathIndex - 1]) : undefined;
  const nextTech = pathIndex >= 0 ? TECHNOLOGY_BY_ID.get(path.sequence[pathIndex + 1]) : undefined;
  return <div className="technology-view"><div className="breadcrumbs"><Link href="/">Roadmap</Link><span>/</span><span>{technology.category}</span><span>/</span><b>{technology.title}</b></div>
    <div className="tech-hero">
      <div className="tech-hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> {technology.category.toUpperCase()} CURRICULUM</div>
        <h1>{technology.title}</h1>
        <p>{technology.description}</p>
        <div className="tech-facts"><span><BookOpen size={15} /> {technology.chapters.length} chapters</span><span><ListChecks size={15} /> {technology.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} lessons</span><span><Compass size={15} /> {path.title}</span></div>
        {technology.officialReferences && <nav className="official-links" aria-label={`${technology.title} official documentation`}>{technology.officialReferences.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.url}>{reference.label}<ExternalLink size={12} /></a>)}</nav>}
      </div>
      <div className="tech-progress-card"><div className="tech-progress-top"><span>YOUR PROGRESS</span><b>{percent}%</b></div><ProgressBar value={percent} /><div className="tech-progress-count"><span>{technology.chapters.filter((chapter) => progress(technology, chapter) === 100).length} of {technology.chapters.length} chapters complete</span><span>{pathIndex >= 0 ? `${pathIndex + 1} / ${path.sequence.length}` : "OPTIONAL"}</span></div><div className="tech-next"><span className="next-indicator"><ArrowRight size={14} /></span><span><small>UP NEXT</small><b>{firstIncomplete ? `Chapter ${firstIncomplete.number}: ${firstIncomplete.title}` : nextTech ? `Continue to ${nextTech.title}` : "All chapters complete"}</b></span></div></div>
    </div>
    {previousTech || nextTech ? <div className="path-context"><span>IN YOUR <b>{path.title.toUpperCase()}</b> SEQUENCE</span><div>{previousTech ? <Link href={routeFor(previousTech)}><ArrowLeft size={14} /> {previousTech.title}</Link> : <span className="sequence-start">PATH START</span>}<span className="sequence-position">{pathIndex + 1} OF {path.sequence.length}</span>{nextTech ? <Link href={routeFor(nextTech)}>{nextTech.title} <ArrowRight size={14} /></Link> : <span className="sequence-start">PATH END</span>}</div></div> : null}
    <section className="chapter-list-section"><div className="chapter-list-heading"><div><span className="eyebrow">STUDY IN THIS ORDER</span><h2>The chapters.</h2></div><span className="section-aside">OPEN ANY CHAPTER WHEN YOU'RE READY</span></div><div className="chapter-list">{technology.chapters.map((chapter) => {
      const value = progress(technology, chapter); const isOpen = expanded === chapter.id; const isComplete = value === 100;
      const unmetPrerequisites = unresolvedPrerequisites(chapter, completed);
      return <article key={chapter.id} className={`chapter-card${isComplete ? " chapter-complete" : ""}${isOpen ? " chapter-expanded" : ""}`}>
        <button className="chapter-card-toggle" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? null : chapter.id)}><span className="chapter-number">{String(chapter.number).padStart(2, "0")}</span><span className="chapter-main"><span className="chapter-title-line"><b>{chapter.title}</b>{isComplete && <CheckCircle2 size={15} className="complete-mark" />}</span><span className="chapter-description">{chapter.description}</span><span className="chapter-meta"><span>{chapter.lessons.length} lessons</span><i /> <span><Clock3 size={12} /> {chapter.minutes} min</span><i /> <span className={levelClass(chapter.level)}>{chapter.level}</span>{chapter.prerequisites.length > 0 && <><i /><span className="prereq-meta">Prerequisite: {chapter.prerequisites.join(", ")}</span></>}</span></span><span className="chapter-card-status">{value > 0 ? <><span>{done(technology, chapter)}/{chapter.lessons.length}</span><ProgressBar value={value} quiet /></> : <span className="status-new">{unmetPrerequisites.length ? "NEEDS PREREQUISITES" : "READY"}</span>}<ChevronDown size={16} className="chapter-chevron" /></span></button>
        {isOpen && <div className="chapter-preview">{unmetPrerequisites.length > 0 && <div className="prerequisite-alert"><span>BEFORE THIS CHAPTER</span><b>Recommended concepts not completed: {unmetPrerequisites.join(", ")}</b></div>}<div className="preview-lessons"><span className="preview-label">LESSONS IN THIS CHAPTER</span>{chapter.lessons.map((lesson, index) => <div key={lesson.id} className="preview-lesson"><label className="lesson-check"><input type="checkbox" checked={completed.includes(lessonKey(technology, lesson))} onChange={() => onToggleLesson(technology, lesson)} /><span><Check size={12} /></span></label><span className="lesson-order">{String(index + 1).padStart(2, "0")}</span><span><b>{lesson.title}</b><small>{lesson.outcome}</small></span><span className={lesson.required ? "required-tag" : "optional-tag"}>{lesson.required ? "CORE" : "OPTIONAL"}</span></div>)}</div><Link className="button-primary preview-button" href={routeFor(technology, chapter)}>{value > 0 ? "Continue learning" : "Start chapter"}<ArrowRight size={15} /></Link></div>}
      </article>;
    })}</div></section>
  </div>;
}

function ChapterPage({ technology, chapter, progress, done, completed, bookmarks, notes, toggleLesson, toggleBookmark, updateNote, markChapter }: {
  technology: Technology; chapter: Chapter; progress: number; done: number; completed: string[]; bookmarks: string[]; notes: Record<string, string>;
  toggleLesson: (technology: Technology, lesson: Lesson) => void; toggleBookmark: (technology: Technology, lesson: Lesson) => void;
  updateNote: (technology: Technology, lesson: Lesson, note: string) => void; markChapter: (technology: Technology, chapter: Chapter) => void;
}) {
  const [copiedCode, setCopiedCode] = useState("");
  const [studyMode, setStudyMode] = useState<"learn" | "revision" | "questions">("learn");
  const index = technology.chapters.findIndex((item) => item.id === chapter.id);
  const previous = technology.chapters[index - 1]; const next = technology.chapters[index + 1];
  const prerequisiteChapters = chapter.prerequisites.map((title) => ({ title, match: findChapterByTitle(title) })).filter((item) => item.match);
  const allComplete = progress === 100;
  const examples = [...(chapter.examples ?? []), ...(chapter.example && !chapter.examples?.some((example) => example.code === chapter.example?.code) ? [chapter.example] : [])];
  async function copyExample(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1500);
    } catch { setCopiedCode(""); }
  }
  return <article className={`chapter-view chapter-mode-${studyMode}`}><div className="breadcrumbs"><Link href="/">Roadmap</Link><span>/</span><Link href={routeFor(technology)}>{technology.title}</Link><span>/</span><b>Chapter {chapter.number}</b></div>
    <div className="chapter-heading"><div className="eyebrow"><span className="eyebrow-line" /> CHAPTER {String(chapter.number).padStart(2, "0")} <span className="chapter-heading-slash">/</span> {chapter.level.toUpperCase()}</div><h1>{chapter.title}</h1><p>{chapter.description}</p><div className="chapter-heading-meta"><span><Clock3 size={15} /> {chapter.minutes} min</span><span><ListChecks size={15} /> {chapter.lessons.length} lessons</span><span><CheckCircle2 size={15} /> {done} of {chapter.lessons.length} complete</span></div><ProgressBar value={progress} /></div>
    <div className="chapter-study-tabs" role="tablist" aria-label="Chapter study mode">
      {([{ id: "learn", label: "Learn", icon: <BookOpen size={14} /> }, { id: "revision", label: "Quick Revision", icon: <RotateCcw size={14} /> }, { id: "questions", label: "Interview Questions", icon: <CircleHelp size={14} /> }] as const).map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={studyMode === tab.id} aria-controls="chapter-study-panel" onClick={() => setStudyMode(tab.id)}>{tab.icon}{tab.label}{tab.id === "questions" && chapter.questions?.length ? <span>{chapter.questions.length}</span> : null}</button>)}
    </div>
    {studyMode === "revision" && <button type="button" className="print-revision" onClick={() => window.print()}><Printer size={14} /> Print revision sheet</button>}
    {studyMode === "revision" && chapter.quickRevision && chapter.questions?.length ? <section className="chapter-section revision-interview-questions"><div className="section-label"><span>02</span> QUICK INTERVIEW CHECK</div><h2>Can you answer these without notes?</h2><div className="revision-question-grid">{chapter.questions.slice(0, 5).map((item, index) => <details className="question-item" key={item.question}><summary><CircleHelp size={15} /><span><small>QUESTION {String(index + 1).padStart(2, "0")}</small>{item.question}</span><ChevronDown size={14} /></summary><p>{item.answer}</p></details>)}</div></section> : null}
    <div className="chapter-content-layout"><div className="chapter-main-column" id="chapter-study-panel" role="tabpanel">
      {studyMode === "learn" && <>
      <section className="chapter-section chapter-overview"><div className="section-label"><span>01</span> CHAPTER OVERVIEW</div><h2>What you'll take away.</h2><ul className="objective-list">{chapter.objectives.map((objective) => <li key={objective}><Check size={15} />{objective}</li>)}</ul>{chapter.prerequisites.length > 0 && <div className="prerequisite-note"><span>PREREQUISITES</span><p>{chapter.prerequisites.join(" · ")}</p></div>}</section>
      <section className="chapter-section related-topics-section"><div className="section-label"><span>02</span> PREREQUISITES AND RELATED CHAPTERS</div><div className="related-topic-links">{prerequisiteChapters.map(({ title, match }) => match && <Link key={title} href={routeFor(match.technology, match.chapter)}><span>PREREQUISITE</span>{title}<ArrowRight size={13} /></Link>)}{previous && <Link href={routeFor(technology, previous)}><span>PREVIOUS</span>{previous.title}<ArrowLeft size={13} /></Link>}{next && <Link href={routeFor(technology, next)}><span>NEXT</span>{next.title}<ArrowRight size={13} /></Link>}</div></section>
      {chapter.learningSections?.map((section, index) => <section className="chapter-section teaching-section" key={section.heading}><div className="section-label"><span>{String(index + 2).padStart(2, "0")}</span> CORE CONCEPT</div><h2>{section.heading}</h2><p>{section.explanation}</p>{section.keyPoints && <ul>{section.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>}</section>)}
      <section className="chapter-section lessons-section"><div className="section-label"><span>02</span> FOLLOW THE SEQUENCE</div><h2>Work through each lesson.</h2><div className="lesson-list">{chapter.lessons.map((lesson, index) => {
        const isDone = completed.includes(lessonKey(technology, lesson)); const isBookmarked = bookmarks.includes(lessonKey(technology, lesson));
        return <section id={`lesson-${lesson.id}`} className={`lesson-detail${isDone ? " lesson-done" : ""}`} key={lesson.id}><div className="lesson-detail-head"><label className="lesson-check lesson-check-large"><input type="checkbox" checked={isDone} onChange={() => toggleLesson(technology, lesson)} aria-label={`Mark ${lesson.title} complete`} /><span><Check size={13} /></span></label><span className="lesson-detail-index">LESSON {String(index + 1).padStart(2, "0")}</span><span className={lesson.required ? "required-tag" : "optional-tag"}>{lesson.required ? "CORE" : "OPTIONAL"}</span><button className={`bookmark-button${isBookmarked ? " bookmark-active" : ""}`} aria-label={isBookmarked ? `Remove ${lesson.title} bookmark` : `Bookmark ${lesson.title}`} title={isBookmarked ? "Remove bookmark" : "Bookmark lesson"} onClick={() => toggleBookmark(technology, lesson)}><Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} /></button></div><h3>{lesson.title}</h3><p>{lesson.outcome}</p>{lesson.explanation && <div className="lesson-explanation"><p><b>Concept</b>{lesson.explanation.concept}</p><p><b>How it works</b>{lesson.explanation.howItWorks}</p>{lesson.explanation.example && <div className="lesson-example"><code>{lesson.explanation.example.code}</code><small>{lesson.explanation.example.output}</small></div>}<p><b>Interview focus</b>{lesson.explanation.interviewFocus}</p>{lesson.explanation.commonMistakes?.map((mistake) => <p className="lesson-pitfall" key={mistake}><b>Watch for</b>{mistake}</p>)}{lesson.explanation.related && <p><b>Related</b>{lesson.explanation.related.join(" · ")}</p>}</div>}<details className="personal-note"><summary>{notes[lessonKey(technology, lesson)] ? "Edit personal note" : "Add a personal note"}</summary><textarea aria-label={`Personal note for ${lesson.title}`} maxLength={2000} placeholder="Add a private note for this lesson..." value={notes[lessonKey(technology, lesson)] ?? ""} onChange={(event) => updateNote(technology, lesson, event.target.value)} /></details></section>;
      })}</div></section>
      {examples.length > 0 && <section className="chapter-section example-section"><div className="section-label"><span>03</span> PRACTICAL EXAMPLES</div><h2>See it in practice.</h2>{examples.map((example) => <div className="code-window" key={example.code}><div className="code-window-top"><span className="code-dots"><i /><i /><i /></span><span>{example.language}</span><button className="copy-code" onClick={() => copyExample(example.code)} aria-label={copiedCode === example.code ? "Code copied" : "Copy code"} title={copiedCode === example.code ? "Copied" : "Copy code"}>{copiedCode === example.code ? <Check size={14} /> : <Copy size={14} />}{copiedCode === example.code && <span>Copied</span>}</button></div><pre><code>{example.code}</code></pre><div className="code-output"><span>OUTPUT</span><code>{example.output}</code></div>{example.explanation && <p className="example-explanation">{example.explanation}</p>}</div>)}</section>}
      {chapter.mistakes && <section className="chapter-section mistakes-section"><div className="section-label"><span>04</span> WATCH FOR THESE</div><h2>Common mistakes.</h2><ul className="mistake-list">{chapter.mistakes.map((mistake) => <li key={mistake}><span>!</span>{mistake}</li>)}</ul></section>}
      {chapter.questions && <section className="chapter-section interview-section"><div className="section-label"><span>05</span> CHECK YOUR UNDERSTANDING</div><h2>Interview practice.</h2><div className="question-list">{chapter.questions.map((item) => <details className="question-item" key={item.question}><summary><CircleHelp size={16} /><span>{item.question}</span><ChevronDown size={15} /></summary><p>{item.answer}</p></details>)}</div></section>}
      {chapter.comparisons?.map((table) => <section className="chapter-section comparison-section" key={table.title}><div className="section-label"><span>07</span> COMPARE THE TRADE-OFFS</div><h2>{table.title}</h2><div className="comparison-table-wrap"><table><thead><tr>{table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}</tr>)}</tbody></table></div></section>)}
      </>}
      {studyMode === "revision" && chapter.quickRevision && <section className="chapter-section quick-revision-sheet"><div className="section-label"><span>01</span> INTERVIEW-DAY SHEET · 3–7 MIN</div><h2>Quick revision.</h2><div className="revision-grid"><section><h3>Definitions</h3><ul>{chapter.quickRevision.definitions.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Rules to remember</h3><ul>{chapter.quickRevision.rules.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Internals</h3><ul>{chapter.quickRevision.internals.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Complexity and trade-offs</h3><ul>{chapter.quickRevision.complexity.map((item) => <li key={item}>{item}</li>)}</ul></section></div>{chapter.quickRevision.example && <div className="revision-example"><div className="section-label">{chapter.quickRevision.example.language.toUpperCase()} · QUICK SYNTAX</div><pre><code>{chapter.quickRevision.example.code}</code></pre><p>{chapter.quickRevision.example.explanation ?? chapter.quickRevision.example.output}</p></div>}{chapter.quickRevision.comparisons.map((table) => <section className="revision-comparison" key={table.title}><h3>{table.title}</h3><div className="comparison-table-wrap"><table><thead><tr>{table.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}</tr>)}</tbody></table></div></section>)}<div className="revision-grid"><section><h3>Interview traps</h3><ul>{chapter.quickRevision.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Production scenarios</h3><ul>{chapter.quickRevision.scenarios.map((item) => <li key={item}>{item}</li>)}</ul></section></div><div className="thirty-second-summary"><b>30-second answer</b><p>{chapter.quickRevision.summary}</p></div></section>}
      {studyMode === "revision" && !chapter.quickRevision && <section className="chapter-section quick-revision-sheet"><div className="section-label"><span>01</span> CHAPTER REVISION</div><h2>Quick revision.</h2><ul className="revision-fallback-list">{(chapter.revision ?? chapter.objectives).map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>{chapter.mistakes && <><h3>Watch for</h3><ul className="mistake-list">{chapter.mistakes.map((item) => <li key={item}><span>!</span>{item}</li>)}</ul></>}{chapter.questions && <div className="question-list">{chapter.questions.map((item) => <details className="question-item" key={item.question}><summary><CircleHelp size={16} /><span>{item.question}</span><ChevronDown size={15} /></summary><p>{item.answer}</p></details>)}</div>}<p className="revision-scope-note">This chapter uses its existing revision notes and interview answers.</p></section>}
      {studyMode === "questions" && <section className="chapter-section interview-section"><div className="section-label"><span>01</span> CHAPTER-SPECIFIC PRACTICE</div><h2>Interview questions and answers.</h2>{chapter.questions?.length ? <div className="question-list">{chapter.questions.map((item, index) => <details className="question-item" key={item.question}><summary><CircleHelp size={16} /><span><small>QUESTION {String(index + 1).padStart(2, "0")}</small>{item.question}</span><ChevronDown size={15} /></summary><p>{item.answer}</p></details>)}</div> : <div className="empty-questions"><p>This chapter does not yet have authored interview questions.</p><button type="button" className="button-secondary" onClick={() => setStudyMode("learn")}>Return to Learn</button></div>}</section>}
      <div className="chapter-complete-bar"><span><b>{allComplete ? "Chapter complete." : `${done} of ${chapter.lessons.length} lessons complete.`}</b><small>{allComplete ? "Your next chapter is ready whenever you are." : "Mark lessons as you work through them."}</small></span><button className={allComplete ? "button-secondary" : "button-primary"} onClick={() => markChapter(technology, chapter)}>{allComplete ? "Mark incomplete" : "Mark chapter complete"}{allComplete ? <RotateCcw size={14} /> : <Check size={15} />}</button></div>
      <nav className="chapter-pagination" aria-label="Chapter navigation">{previous ? <Link href={routeFor(technology, previous)} className="pagination-link previous-link"><ArrowLeft size={16} /><span><small>PREVIOUS CHAPTER</small><b>{previous.title}</b></span></Link> : <Link href={routeFor(technology)} className="pagination-link previous-link"><ArrowLeft size={16} /><span><small>CURRICULUM</small><b>All {technology.title} chapters</b></span></Link>}{next ? <Link href={routeFor(technology, next)} className="pagination-link next-link"><span><small>NEXT CHAPTER</small><b>{next.title}</b></span><ArrowRight size={16} /></Link> : <Link href="/" className="pagination-link next-link"><span><small>UP NEXT</small><b>Return to your roadmap</b></span><ArrowRight size={16} /></Link>}</nav>
    </div><aside className="chapter-aside"><div className="aside-progress"><span>IN THIS CHAPTER</span><b>{done}/{chapter.lessons.length}</b><ProgressBar value={progress} quiet />{chapter.lessons.map((lesson, index) => <a key={lesson.id} href={`#lesson-${lesson.id}`} onClick={() => setStudyMode("learn")} className={completed.includes(lessonKey(technology, lesson)) ? "aside-lesson aside-lesson-done" : "aside-lesson"}><span>{completed.includes(lessonKey(technology, lesson)) ? <Check size={12} /> : String(index + 1).padStart(2, "0")}</span>{lesson.title}</a>)}<Link href={routeFor(technology)} className="aside-full-curriculum">FULL CURRICULUM <ExternalLink size={13} /></Link></div>{chapter.prerequisites.length > 0 && <div className="aside-prereq"><span>BEFORE THIS</span><p>{chapter.prerequisites.join(" · ")}</p><span className="aside-prereq-note">RECOMMENDED FOUNDATION</span></div>}</aside></div>
  </article>;
}
