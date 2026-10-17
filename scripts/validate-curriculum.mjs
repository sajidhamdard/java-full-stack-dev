import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../content/curriculum.ts", import.meta.url), "utf8");
const guideSource = await readFile(new URL("../content/chapter-guides.ts", import.meta.url), "utf8");
const deriveSource = await readFile(new URL("../content/derive-chapter-guide.ts", import.meta.url), "utf8");
const compilerOptions = { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 };
const guideJavascript = ts.transpileModule(guideSource, { compilerOptions }).outputText;
const deriveJavascript = ts.transpileModule(deriveSource, { compilerOptions }).outputText;
const curriculumJavascript = ts.transpileModule(source, { compilerOptions }).outputText
  .replace(/^import \{ CHAPTER_GUIDES \} from "\.\/chapter-guides";\s*/m, "")
  .replace(/^import \{ deriveChapterGuide \} from "\.\/derive-chapter-guide";\s*/m, "");
const javascript = `${guideJavascript}\n${deriveJavascript}\n${curriculumJavascript}`;
let curriculumModule;
try {
  curriculumModule = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
} catch (error) {
  console.error(`Unable to load curriculum modules: ${error.name}: ${String(error.message).slice(0, 500)}`);
  process.exit(1);
}
const { CHAPTER_GUIDES, CURRICULA, LEARNING_PATHS, ROADMAP_PHASES } = curriculumModule;
const deriveChapterGuide = curriculumModule.deriveChapterGuide;

const technologyIds = new Set();
const lessonIds = new Set();
const chapterIds = new Set();
const titleOf = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

assert.ok(CURRICULA.length > 0, "Add at least one curriculum.");
for (const technology of CURRICULA) {
  assert.ok(!technologyIds.has(technology.id), `Duplicate technology id: ${technology.id}`);
  technologyIds.add(technology.id);
  assert.ok(technology.title.trim() && technology.description.trim(), `${technology.id} needs a title and description.`);
  assert.ok(technology.chapters.length > 0, `${technology.title} needs chapters.`);

  for (const [index, chapter] of technology.chapters.entries()) {
    assert.equal(chapter.number, index + 1, `${technology.title} chapter order must be numbered sequentially; found ${chapter.number} at position ${index + 1}.`);
    assert.ok(!chapterIds.has(`${technology.id}/${chapter.id}`), `Duplicate chapter id: ${technology.id}/${chapter.id}`);
    chapterIds.add(`${technology.id}/${chapter.id}`);
    assert.ok(chapter.title.trim() && chapter.description.trim(), `${technology.title} chapter ${chapter.number} needs a title and description.`);
    assert.ok(chapter.minutes > 0, `${technology.title} chapter ${chapter.number} needs a positive reading estimate.`);
    assert.ok(chapter.lessons.length >= 2, `${technology.title} chapter ${chapter.number} needs at least two focused lessons.`);

    for (const lesson of chapter.lessons) {
      assert.ok(!lessonIds.has(`${technology.id}/${lesson.id}`), `Duplicate lesson id: ${technology.id}/${lesson.id}`);
      lessonIds.add(`${technology.id}/${lesson.id}`);
      assert.ok(lesson.title.trim() && lesson.outcome.trim().length > 24, `${technology.title}: ${lesson.title} needs a meaningful explanation.`);
      assert.doesNotMatch(`${lesson.title} ${lesson.outcome}`, /placeholder|coming soon|lorem ipsum|todo/i, `${technology.title}: ${lesson.title} looks like placeholder content.`);
    }

    for (const prerequisite of chapter.prerequisites) {
      const expected = titleOf(prerequisite);
      const exists = CURRICULA.some((candidateTechnology) => candidateTechnology.chapters.some((candidate) => {
        const candidateTitle = titleOf(candidate.title);
        return candidateTitle === expected || candidateTitle.includes(expected) || expected.includes(candidateTitle);
      }));
      assert.ok(exists, `${technology.title} chapter ${chapter.number} has an unresolved prerequisite: ${prerequisite}`);
    }

    for (const question of chapter.questions ?? []) {
      assert.ok(question.question.trim() && question.answer.trim().length > 30, `${technology.title} chapter ${chapter.number} has an incomplete interview question.`);
    }
  }
}

for (const [id, expected] of [["core-java", 15], ["spring-boot", 15], ["docker", 12]]) {
  const technology = CURRICULA.find((candidate) => candidate.id === id);
  assert.ok(technology, `Required curriculum is missing: ${id}`);
  assert.equal(technology.chapters.length, expected, `${id} must have ${expected} chapters.`);
}

const inventoryOnly = process.argv.includes("--inventory");
const chapterCoverage = [];
const reusableCopy = new Map();
const guideIds = new Set(Object.keys(CHAPTER_GUIDES));
const placeholderPattern = /placeholder|coming soon|lorem ipsum|todo|tbd/i;

for (const technology of CURRICULA) {
  for (const chapter of technology.chapters) {
    const id = `${technology.id}/${chapter.id}`;
    const missing = [];
    const guide = CHAPTER_GUIDES[id] ?? deriveChapterGuide(technology, chapter);
    const learnText = (chapter.learningSections ?? []).map((section) => section.explanation);
    const sheet = chapter.quickRevision;
    const questions = chapter.questions ?? [];
    const practicalLearn = chapter.learningSections?.some((section) => /practical|scenario/i.test(section.heading) && section.explanation.length >= 180);

    if (!guide || learnText.length < 4 || learnText.some((text) => text.trim().length < 120)) missing.push("Learn");
    if ((!chapter.examples?.length && !chapter.example && !(sheet?.scenarios.length >= 2)) || (!(chapter.examples?.length || chapter.example) && !practicalLearn)) missing.push("examples/scenarios");
    if (!sheet || sheet.definitions.length < 3 || sheet.rules.length < 3 || sheet.internals.length < 3 || sheet.complexity.length < 2 || sheet.pitfalls.length < 3 || sheet.scenarios.length < 2 || sheet.summary.length < 100) missing.push("Quick Revision");
    if (questions.length < 8 || questions.some((item) => !item.question.trim() || item.answer.trim().length < 50)) missing.push("Interview Q&A");
    if ((chapter.mistakes?.length ?? 0) < 3) missing.push("pitfalls");

    const lessonTitles = new Set(chapter.lessons.map((lesson) => lesson.title));
    for (const [title, explanation] of Object.entries(guide?.lessonExplanations ?? {})) {
      if (!lessonTitles.has(title)) missing.push(`broken lesson reference: ${title}`);
      if (!explanation.concept?.trim() || !explanation.howItWorks?.trim() || !explanation.interviewFocus?.trim()) missing.push(`incomplete lesson explanation: ${title}`);
    }

    for (const table of [...(chapter.comparisons ?? []), ...(sheet?.comparisons ?? [])]) {
      if (table.columns.length < 2 || table.rows.length < 2 || table.rows.some((row) => row.values.length + 1 !== table.columns.length)) missing.push(`invalid comparison table: ${table.title}`);
    }

    const contentStrings = [...learnText, ...(sheet ? [sheet.summary] : []), ...questions.flatMap((item) => [item.question, item.answer])];
    if (placeholderPattern.test(JSON.stringify(guide))) missing.push("placeholder text");
    for (const text of contentStrings) {
      if (placeholderPattern.test(text)) missing.push("placeholder text");
      const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
      const owner = reusableCopy.get(normalized);
      if (normalized.length >= 100 && owner && owner !== id) missing.push(`content reused from ${owner}`);
      else if (normalized.length >= 100) reusableCopy.set(normalized, id);
    }

    chapterCoverage.push({ id, technology: technology.title, title: chapter.title, missing: [...new Set(missing)] });
  }
}

const orphanGuides = [...guideIds].filter((id) => !chapterCoverage.some((chapter) => chapter.id === id));
const incompleteChapters = chapterCoverage.filter((chapter) => chapter.missing.length > 0);
const completeChapters = chapterCoverage.length - incompleteChapters.length;
const issueCounts = new Map();
for (const chapter of incompleteChapters) for (const issue of chapter.missing) issueCounts.set(issue, (issueCounts.get(issue) ?? 0) + 1);

console.log(`Chapter content: ${completeChapters}/${chapterCoverage.length} complete; ${incompleteChapters.length} incomplete.`);
console.log(`Missing Learn: ${issueCounts.get("Learn") ?? 0}; Quick Revision: ${issueCounts.get("Quick Revision") ?? 0}; Interview Q&A: ${issueCounts.get("Interview Q&A") ?? 0}; examples/scenarios: ${issueCounts.get("examples/scenarios") ?? 0}.`);
if (orphanGuides.length) console.log(`Orphan guides: ${orphanGuides.join(", ")}`);
if (incompleteChapters.length) {
  console.log("Incomplete chapters:");
  for (const technology of CURRICULA) {
    const entries = incompleteChapters.filter((chapter) => chapter.technology === technology.title);
    if (entries.length) console.log(`- ${technology.title} (${entries.length}): ${entries.map((chapter) => `${chapter.id.split("/")[1]} [${chapter.missing.join("; ")}]`).join(", ")}`);
  }
}
assert.equal(orphanGuides.length, 0, `Guides reference missing chapters: ${orphanGuides.join(", ")}`);
if (!inventoryOnly) assert.equal(incompleteChapters.length, 0, `${incompleteChapters.length} chapters still need substantive content.`);

for (const id of ["programming-fundamentals", "git", "dsa", "sql", "mongodb", "angular", "react", "microservices", "kafka", "kubernetes", "cicd", "aws", "linux", "testing", "security", "system-design", "projects", "interview-prep"]) {
  assert.ok(technologyIds.has(id), `Roadmap technology is missing: ${id}`);
}

for (const path of LEARNING_PATHS) {
  assert.ok(path.sequence.length > 0, `${path.title} needs a study sequence.`);
  assert.ok(new Set(path.sequence).size === path.sequence.length, `${path.title} contains a duplicate technology stage.`);
  for (const id of path.sequence) assert.ok(technologyIds.has(id), `${path.title} references unknown technology ${id}.`);
}

for (const phase of ROADMAP_PHASES) {
  assert.ok(phase.ids.length > 0, `${phase.title} needs roadmap content.`);
  for (const id of phase.ids) assert.ok(technologyIds.has(id), `${phase.title} references unknown technology ${id}.`);
}

console.log(`Validated ${CURRICULA.length} technologies, ${chapterIds.size} ordered chapters, ${lessonIds.size} lessons, ${LEARNING_PATHS.length} paths, and ${ROADMAP_PHASES.length} roadmap phases.`);