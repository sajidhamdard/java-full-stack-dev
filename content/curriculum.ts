import { CHAPTER_GUIDES } from "./chapter-guides";
import { deriveChapterGuide } from "./derive-chapter-guide";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Lesson = {
  id: string;
  title: string;
  outcome: string;
  required: boolean;
  explanation?: LessonExplanation;
};

export type Question = { question: string; answer: string };

export type CodeExample = { language: string; code: string; output: string; explanation?: string };
export type ComparisonTable = { title: string; columns: string[]; rows: { label: string; values: string[] }[] };
export type TeachingSection = { heading: string; explanation: string; keyPoints?: string[] };
export type LessonExplanation = {
  concept: string;
  howItWorks: string;
  example?: CodeExample;
  interviewFocus: string;
  commonMistakes?: string[];
  related?: string[];
};
export type QuickRevision = {
  definitions: string[];
  rules: string[];
  internals: string[];
  example?: CodeExample;
  comparisons: ComparisonTable[];
  complexity: string[];
  pitfalls: string[];
  scenarios: string[];
  summary: string;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  description: string;
  minutes: number;
  level: Level;
  prerequisites: string[];
  objectives: string[];
  lessons: Lesson[];
  example?: CodeExample;
  learningSections?: TeachingSection[];
  examples?: CodeExample[];
  comparisons?: ComparisonTable[];
  mistakes?: string[];
  questions?: Question[];
  revision?: string[];
  summary?: string;
  quickRevision?: QuickRevision;
};

export type ChapterGuide = Required<Pick<Chapter, "learningSections" | "examples" | "comparisons" | "mistakes" | "questions" | "summary" | "quickRevision">> & {
  lessonExplanations?: Record<string, LessonExplanation>;
};

export type Technology = {
  id: string;
  title: string;
  category: string;
  description: string;
  accent: string;
  officialReferences?: { label: string; url: string }[];
  chapters: Chapter[];
};

const lessons = (prefix: string, items: [string, string, boolean?][]): Lesson[] =>
  items.map(([title, outcome, required = true], index) => ({
    id: `${prefix}-${index + 1}`,
    title,
    outcome,
    required,
  }));

function chapter(
  technology: string,
  number: number,
  title: string,
  description: string,
  items: [string, string, boolean?][],
  options: Partial<Pick<Chapter, "minutes" | "level" | "prerequisites" | "objectives" | "example" | "mistakes" | "questions" | "revision">> = {},
): Chapter {
  return {
    id: `${String(number).padStart(2, "0")}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    number,
    title,
    description,
    minutes: options.minutes ?? items.length * 8 + 6,
    level: options.level ?? "Beginner",
    prerequisites: options.prerequisites ?? [],
    objectives: options.objectives ?? items.slice(0, 3).map((item) => item[1]),
    lessons: lessons(`${technology}-${number}`, items),
    example: options.example,
    mistakes: options.mistakes,
    questions: options.questions,
    revision: options.revision,
  };
}

const javaChapters: Chapter[] = [
  chapter("core-java", 1, "Java Fundamentals", "Meet the language, its runtime, and the journey from source file to running program.", [
    ["What Java is", "Describe Java as a statically typed, object-oriented language that compiles to portable bytecode."],
    ["JDK, JRE, and JVM", "Distinguish the developer tools, runtime libraries, and virtual machine."],
    ["Compile and run a program", "Use javac and java to compile and launch a small class."],
    ["Platform independence", "Explain how bytecode and a platform-specific JVM work together."],
  ], {
    minutes: 32,
    objectives: ["Trace source code through compilation to execution.", "Explain the roles of the JDK, JRE, and JVM.", "Describe what Java's portability does and does not guarantee."],
    example: { language: "java", code: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Java\");\n    }\n}\n\n// javac Main.java\n// java Main", output: "Hello, Java" },
    mistakes: ["The JVM is not the Java compiler; javac produces bytecode.", "Platform-independent bytecode still runs on a platform-specific JVM."],
    questions: [{ question: "How does Java achieve platform independence?", answer: "The compiler emits platform-neutral bytecode. A JVM implementation for the target operating system executes that bytecode; native libraries and environment assumptions can still limit portability." }],
    revision: ["javac compiles .java source to .class bytecode.", "The JVM loads and executes bytecode.", "The JDK includes the tools and runtime needed for development."],
  }),
  chapter("core-java", 2, "Variables, Types and Operators", "Model values precisely, choose suitable types, and understand conversions.", [
    ["Variables and constants", "Declare local variables and use final when a binding should not be reassigned."],
    ["Primitive and reference types", "Compare primitive values with object references and their default field values."],
    ["Conversions and promotion", "Recognize widening, narrowing casts, and numeric promotion in expressions."],
    ["Operators and precedence", "Read arithmetic, comparison, logical, and assignment expressions safely."],
  ], { questions: [{ question: "What is the difference between a primitive and a reference?", answer: "A primitive variable holds a value such as an int. A reference variable holds a reference to an object (or null); assigning it copies the reference, not the object." }], revision: ["Local variables need definite assignment before use.", "Narrowing conversions can lose information.", "Use parentheses when precedence is not immediately clear."] }),
  chapter("core-java", 3, "Control Flow and Loops", "Branch clearly and repeat work with predictable loop boundaries.", [
    ["if, switch, and expressions", "Choose between conditional branches and switch forms for discrete alternatives."],
    ["for and while loops", "Select counted or condition-driven loops and maintain their termination conditions."],
    ["break, continue, and nested loops", "Control loop flow without obscuring the main path."],
    ["Defensive conditions", "Order checks to handle empty, null, and boundary cases explicitly."],
  ], { questions: [{ question: "When is a while loop preferable to a for loop?", answer: "Use while when repetition depends on a condition and the iteration count is not the primary idea. Use for when initialization, continuation, and update form one clear counted loop." }] }),
  chapter("core-java", 4, "Methods and Program Structure", "Break behavior into methods with clear inputs, outputs, and responsibilities.", [
    ["Method signatures and return values", "Define parameters, return types, and method bodies that express one task."],
    ["Overloading and varargs", "Distinguish methods by parameter lists and use variable-length arguments sparingly."],
    ["Scope and access modifiers", "Control where local variables and members are visible."],
    ["Packages and imports", "Group related types and refer to them without ambiguous names."],
  ], { questions: [{ question: "Does Java pass objects by reference?", answer: "Java passes every argument by value. For an object argument, the copied value is the reference, so a method can mutate the referenced object but cannot replace the caller's reference." }] }),
  chapter("core-java", 5, "Classes, Objects and Constructors", "Create object types with deliberate state and valid construction paths.", [
    ["Fields and object identity", "Separate per-object instance state from class-level static state."],
    ["Constructors and invariants", "Initialize required state and keep each constructed object valid."],
    ["this and constructor chaining", "Refer to the current object and reuse initialization with this(...)."],
    ["Encapsulation and access", "Expose behavior while protecting mutable implementation details."],
  ], { questions: [{ question: "Why make fields private?", answer: "Private fields let a class enforce invariants and evolve its representation without allowing callers to mutate internal state arbitrarily." }] }),
  chapter("core-java", 6, "Object-Oriented Design", "Apply abstraction, inheritance, polymorphism, and composition to model change.", [
    ["Inheritance and overriding", "Reuse and specialize behavior while respecting substitutability."],
    ["Abstract classes and interfaces", "Choose shared implementation or a capability contract for a type hierarchy."],
    ["Runtime polymorphism", "Understand how the actual object type selects an overridden method."],
    ["Composition over inheritance", "Assemble behavior from collaborating objects when a subtype relationship is not real."],
  ], { level: "Intermediate", questions: [{ question: "When is composition preferable to inheritance?", answer: "Prefer composition when behavior varies independently or a subtype would inherit operations it cannot safely support. It keeps dependencies explicit and avoids fragile base-class coupling." }] }),
  chapter("core-java", 7, "Strings and Immutability", "Use immutable text values correctly and choose efficient builders for repeated changes.", [
    ["String equality and operations", "Compare string content with equals and use the API for safe transformations."],
    ["String pool and immutability", "Explain why literals may be shared and why String values cannot be changed."],
    ["StringBuilder and formatting", "Build text efficiently and format values without repeated concatenation."],
    ["Text input and Unicode", "Handle whitespace, encoding, and character-versus-code-point assumptions."],
  ], { questions: [{ question: "Why should strings generally be compared with equals rather than ==?", answer: "== compares reference identity, while equals compares string content. Interning can make some literals share a reference, but that is not a content-equality guarantee." }] }),
  chapter("core-java", 8, "Exceptions and Error Handling", "Report recoverable failures with meaningful exception types and preserve context.", [
    ["Checked and unchecked exceptions", "Choose how callers should be required to handle a failure."],
    ["try, catch, and finally", "Handle expected failure paths and keep cleanup reliable."],
    ["Try-with-resources", "Close AutoCloseable resources even when work fails."],
    ["Designing exceptions", "Add useful context without swallowing or needlessly wrapping failures."],
  ], { questions: [{ question: "When should you create a custom exception?", answer: "Create one when a domain-specific failure communicates meaning callers need to handle. Preserve the original cause when translating a lower-level exception." }] }),
  chapter("core-java", 9, "Collections Framework", "Select collections by ordering, uniqueness, lookup needs, and concurrency requirements.", [
    ["List, Set, Queue, and Map", "Choose the collection contract that matches the required behavior."],
    ["ArrayList and LinkedList", "Compare indexed access, insertion patterns, memory overhead, and iteration."],
    ["HashSet and TreeSet", "Choose hash-based membership or sorted traversal."],
    ["Map views and iteration", "Use entrySet and avoid modifying a map unsafely during iteration."],
    ["Why the Collections Framework exists", "Use common contracts and algorithms instead of coupling code to bespoke containers."],
    ["Collection hierarchy and contracts", "Distinguish Collection subtypes from the separate Map key-value abstraction."],
    ["ArrayList resizing and amortized cost", "Explain backing-array growth and the difference between average append cost and a resizing append."],
    ["LinkedList nodes and practical trade-offs", "Account for node allocation, traversal, locality, and deque alternatives."],
    ["HashSet and hash-based membership", "Trace uniqueness checks through hashCode and equals."],
    ["HashMap buckets and collisions", "Follow a lookup from spread hash to bucket and equality check."],
    ["HashMap resize and load factor", "Explain threshold-driven capacity growth and rehashing costs."],
    ["equals and hashCode contracts", "Keep equality and hash behavior consistent for values stored in hash-based collections."],
    ["Comparable and Comparator", "Choose natural ordering or a separate comparator for a specific sort order."],
    ["TreeMap and TreeSet ordering", "Use sorted maps and sets for ordered traversal and range queries."],
    ["ConcurrentHashMap and atomic operations", "Select concurrent per-key map operations without assuming multi-key transactions."],
    ["Fail-fast iterators", "Recognize best-effort concurrent-modification detection and safe removal patterns."],
    ["Choosing a collection by workload", "Select a structure from ordering, access, uniqueness, concurrency, and memory needs."],
  ], { level: "Intermediate", questions: [{ question: "When would you choose TreeMap over HashMap?", answer: "Choose TreeMap when sorted key iteration or range queries are required. Use HashMap when ordering is unnecessary and expected constant-time lookup is appropriate." }] }),
  chapter("core-java", 10, "Hashing, Equality and Map Internals", "Understand hash-based lookup, collision handling, and the equality contract.", [
    ["equals and hashCode contract", "Ensure equal objects have equal hash codes and stable map-key identity."],
    ["Buckets and collisions", "Trace a key through hashing, bucket selection, and equality checks."],
    ["Resize and load factor", "Explain why capacity and load factor affect rehashing."],
    ["Mutable keys and safe usage", "Keep key fields used by equality stable while stored in a hash map."],
  ], { level: "Intermediate", example: { language: "java", code: "record UserId(long value) {}\n\nMap<UserId, String> users = new HashMap<>();\nusers.put(new UserId(42), \"Ada\");\nSystem.out.println(users.get(new UserId(42)));", output: "Ada" }, mistakes: ["Overriding equals without hashCode breaks hash-based collections.", "Changing a key's equality fields after insertion can make its entry unreachable."], questions: [{ question: "What happens when two HashMap keys have the same hash?", answer: "They occupy the same bucket and are distinguished by equality. Collisions are expected; a good hash distribution reduces how often they occur." }], revision: ["Equal keys must have equal hashes.", "Hash chooses a bucket; equality identifies the key.", "Do not mutate equality-relevant key state after insertion."] }),
  chapter("core-java", 11, "Generics and Type Safety", "Express reusable APIs while catching incompatible types at compile time.", [
    ["Generic classes and methods", "Parameterize reusable types and methods with explicit type variables."],
    ["Wildcards and bounds", "Use extends and super to express producer and consumer flexibility."],
    ["Type erasure and limitations", "Understand runtime erasure and restrictions on generic types."],
  ], { level: "Intermediate", questions: [{ question: "What does PECS mean for generic wildcards?", answer: "Producer Extends, Consumer Super: use extends when reading values as a type, and super when writing that type into a structure." }] }),
  chapter("core-java", 12, "Lambdas and Functional Interfaces", "Represent behavior as values and recognize the standard functional interfaces.", [
    ["Functional interfaces", "Use a single abstract method contract to describe behavior."],
    ["Lambda expressions and method references", "Pass concise behavior to APIs without losing readability."],
    ["Predicate, Function, Consumer, Supplier", "Select standard function shapes for testing, transforming, consuming, and creating values."],
  ], { level: "Intermediate" }),
  chapter("core-java", 13, "Streams and Optional", "Transform collections with readable pipelines and model possibly absent results explicitly.", [
    ["Intermediate and terminal operations", "Distinguish lazy pipeline stages from operations that produce a result."],
    ["Mapping, filtering, and reduction", "Compose common transformations without unintended side effects."],
    ["Optional usage", "Represent a possibly absent return value without using Optional as a field everywhere."],
  ], { level: "Intermediate", questions: [{ question: "Why should side effects in stream operations be avoided?", answer: "Streams may evaluate lazily and parallel streams may execute in different orders. Side effects make pipelines harder to reason about and can introduce race conditions." }] }),
  chapter("core-java", 14, "Concurrency and Threads", "Coordinate concurrent work using executors, safe publication, and explicit synchronization.", [
    ["Threads and ExecutorService", "Submit bounded tasks to an executor and shut it down responsibly."],
    ["Visibility, atomicity, and synchronization", "Distinguish visibility from atomic updates and use synchronization for shared state."],
    ["Concurrent collections and futures", "Choose thread-safe data structures and compose asynchronous results."],
    ["Race conditions and deadlocks", "Recognize interleavings and avoid inconsistent lock ordering."],
  ], { level: "Advanced", prerequisites: ["Classes, Objects and Constructors", "Collections Framework"], questions: [{ question: "What is the difference between visibility and atomicity?", answer: "Visibility concerns whether one thread observes another thread's writes. Atomicity concerns whether an operation appears indivisible; volatile supports visibility but does not make compound updates atomic." }] }),
  chapter("core-java", 15, "JVM, Memory and Modern Java", "Connect runtime memory and garbage collection to modern language features and production diagnosis.", [
    ["Heap, stack, and object lifetime", "Describe common runtime memory areas without assuming every JVM implementation is identical."],
    ["Garbage collection and class loading", "Explain reachability-based reclamation and how classes are loaded."],
    ["Records, sealed types, and modern Java", "Use concise data carriers and restricted hierarchies where they fit."],
    ["Java 17 and 21 highlights", "Recognize useful language and runtime improvements in current LTS releases."],
  ], { level: "Advanced", prerequisites: ["Classes, Objects and Constructors", "Exceptions and Error Handling"] }),
];

const curricula: Technology[] = [
  {
    id: "programming-fundamentals", title: "Programming Fundamentals", category: "Foundations", description: "Build the mental models that make every later language easier to learn.", accent: "#bc5a38",
    chapters: [
      chapter("fundamentals", 1, "How Programs Work", "Learn how source code becomes instructions and how data moves through a program.", [["Input, processing, output", "Break a small program into inputs, transformations, and observable results."], ["Values and expressions", "Evaluate expressions and name intermediate values clearly."], ["Variables and state", "Trace how a named value changes through a sequence of steps."]]),
      chapter("fundamentals", 2, "Logic and Problem Solving", "Translate a problem into clear steps before reaching for syntax.", [["Decompose a problem", "Split a task into smaller steps with clear inputs and outcomes."], ["Conditions and repetition", "Express decisions and repeated work as explicit control flow."], ["Trace and test examples", "Use normal, boundary, and empty inputs to check reasoning."]]),
      chapter("fundamentals", 3, "Functions and Data Structures", "Organize reusable behavior and choose a suitable way to group values.", [["Functions and parameters", "Give reusable operations clear contracts and responsibilities."], ["Arrays and collections", "Store related values and access them by position or key."], ["Debugging basics", "Follow values and use a small reproducible example to isolate a fault."]]),
    ],
  },
  {
    id: "git", title: "Git and GitHub", category: "Foundations", description: "Track changes confidently and collaborate without losing the history of your work.", accent: "#d98242",
    chapters: [
      chapter("git", 1, "Version Control Essentials", "Understand snapshots, commits, and the working tree before collaborating.", [["Repository and working tree", "Distinguish working files, staging, and committed snapshots."], ["Stage and commit", "Create focused commits with a useful message."], ["Inspect history", "Use status, diff, and log to understand changes before sharing."]]),
      chapter("git", 2, "Branches and Collaboration", "Develop changes independently and integrate them through review.", [["Branches and merges", "Create a short-lived branch and merge its changes."], ["Resolve conflicts", "Review both sides of a conflict and keep the intended result."], ["Pull requests", "Share a focused change and respond to review feedback."]]),
      chapter("git", 3, "Reliable Git Workflows", "Recover from mistakes and keep shared history understandable.", [["Revert and reset", "Choose a safe history operation based on whether work is shared."], ["Rebase basics", "Replay local commits without rewriting published history carelessly."], ["Ignore files and tags", "Keep generated files out of commits and mark useful releases."]], { level: "Intermediate" }),
    ],
  },
  { id: "core-java", title: "Core Java", category: "Backend", description: "Learn the language in dependency order, from the first program through JVM and concurrency internals.", accent: "#c6583f", officialReferences: [{ label: "Dev.java tutorials", url: "https://dev.java/learn/" }, { label: "Java API documentation", url: "https://docs.oracle.com/en/java/" }], chapters: javaChapters },
  {
    id: "dsa", title: "DSA and Problem Solving", category: "Foundations", description: "Practice data structures and complexity as an ongoing track alongside application development.", accent: "#bc8038",
    chapters: [
      chapter("dsa", 1, "Complexity and Analysis", "Estimate how runtime and memory grow as inputs become larger.", [["Big O notation", "Compare growth rates without confusing constants with scalability."], ["Time and space trade-offs", "Account for auxiliary memory as well as runtime."], ["Analyze loops and recursion", "Estimate common iterative and recursive algorithms."]]),
      chapter("dsa", 2, "Arrays, Strings and Hashing", "Use contiguous data and hash-based lookup for common interview problems.", [["Array and string patterns", "Recognize two pointers, sliding windows, and prefix sums."], ["Hash maps and sets", "Trade additional memory for expected constant-time lookup."], ["Boundary cases", "Test empty, singleton, duplicate, and extreme inputs."]]),
      chapter("dsa", 3, "Stacks, Queues and Trees", "Choose structures that capture order, priority, and hierarchy.", [["Stacks and queues", "Model last-in-first-out and first-in-first-out work."], ["Trees and traversal", "Traverse hierarchical data with depth-first and breadth-first strategies."], ["Heaps and priority queues", "Retrieve an extreme value efficiently as priorities change."]], { level: "Intermediate" }),
      chapter("dsa", 4, "Graphs and Dynamic Programming", "Model relationships and reuse solutions to overlapping subproblems.", [["Graph representations", "Choose adjacency lists or matrices for the graph's operations."], ["Traversal and shortest paths", "Use BFS, DFS, and suitable shortest-path strategies."], ["Dynamic programming", "Define a state, recurrence, and base cases before coding."], ["Practice cadence", "Solve a few focused problems weekly while continuing project work.", false]], { level: "Advanced" }),
    ],
  },
  {
    id: "sql", title: "SQL and Database Fundamentals", category: "Data", description: "Query relational data, model integrity, and make informed choices about transactions and indexes.", accent: "#5e857d",
    chapters: [
      chapter("sql", 1, "Relational Data and SQL", "Learn tables, keys, and the shape of a reliable relational query.", [["Tables and relationships", "Represent entities as rows and connect them with keys."], ["SELECT and filtering", "Project required columns and filter rows with correct predicates."], ["NULL and three-valued logic", "Handle missing values with IS NULL and understand unknown comparisons."]], { example: { language: "sql", code: "SELECT id, email\nFROM users\nWHERE active = TRUE\nORDER BY created_at DESC\nLIMIT 20;", output: "Returns up to 20 active users, newest first." }, questions: [{ question: "Why should you avoid SELECT * in an application query?", answer: "Selecting only needed columns reduces transferred data and makes the query's contract clearer. It also avoids silently loading new columns after a schema change." }], revision: ["A table stores rows described by columns.", "Use predicates to filter before returning rows.", "NULL requires IS NULL because comparisons with NULL are unknown."] }),
      chapter("sql", 2, "Joins, Aggregation and Subqueries", "Combine related rows and summarize results without changing their meaning.", [["Inner and outer joins", "Select a join based on whether unmatched rows should remain."], ["GROUP BY and HAVING", "Aggregate at the intended grouping level and filter groups."], ["Subqueries and common table expressions", "Break down a query while keeping its cardinality clear."]]),
      chapter("sql", 3, "Schema Design and Transactions", "Protect data integrity and reason about concurrent database work.", [["Keys and constraints", "Use primary, foreign, unique, and check constraints to encode invariants."], ["Normalization", "Reduce update anomalies by separating independent facts."], ["ACID and isolation", "Explain atomicity, consistency, isolation, and durability in practical terms."], ["Isolation anomalies", "Recognize dirty reads, non-repeatable reads, and serialization trade-offs."]], { level: "Intermediate" }),
      chapter("sql", 4, "Indexes and Query Plans", "Use database evidence to improve slow queries without guessing.", [["B-tree and composite indexes", "Match index column order to filters and ordering needs."], ["Execution plans", "Inspect scans, joins, row estimates, and expensive plan steps."], ["Pagination and query shape", "Compare offset pagination with keyset pagination for growing data."]], { level: "Intermediate" }),
    ],
  },
  {
    id: "spring-boot", title: "Spring Boot", category: "Backend", description: "Build testable, secure Spring services and understand how their production behavior is configured.", accent: "#62826b",
    officialReferences: [{ label: "Spring Boot reference", url: "https://docs.spring.io/spring-boot/index.html" }, { label: "Spring Framework reference", url: "https://docs.spring.io/spring-framework/reference/" }],
    chapters: [
      chapter("spring", 1, "Spring Framework Fundamentals", "Understand the container that assembles an application from managed objects.", [["Inversion of control", "Let the application context construct and connect managed objects."], ["Application context", "Describe the context as a registry and lifecycle manager for application components."], ["Spring modules", "Recognize the roles of core, web, data, and security modules."]]),
      chapter("spring", 2, "IoC and Dependency Injection", "Make dependencies explicit and keep application components straightforward to test.", [["Constructor injection", "Make required dependencies explicit and enable straightforward unit tests."], ["Dependency direction", "Keep higher-level policy independent of low-level implementation details."], ["Choosing injection styles", "Use constructor injection for required dependencies and avoid field injection."], ["Bean scope", "Choose singleton or narrower scopes based on state and request behavior."]]),
      chapter("spring", 3, "Spring Beans and Lifecycle", "Understand how bean definitions become configured, managed instances.", [["Bean registration", "Register components with scanning or explicit configuration."], ["Initialization and destruction", "Use lifecycle callbacks sparingly and keep startup work predictable."], ["Proxies and post-processors", "Recognize how Spring wraps beans to add cross-cutting behavior."]], { level: "Intermediate" }),
      chapter("spring", 4, "Spring Boot Fundamentals", "Create an application entry point and use Boot's sensible conventions.", [["Application startup", "Use the Boot entry point and component scanning intentionally."], ["Starters", "Use a starter to select a coordinated set of dependencies."], ["Embedded servers", "Explain how an embedded server simplifies application packaging."]]),
      chapter("spring", 5, "Auto-Configuration and Starters", "Inspect how Boot configures an application from its classpath and settings.", [["Conditional configuration", "Understand conditions that activate or back off from auto-configuration."], ["Configuration properties", "Bind and validate related settings with typed configuration."], ["Debugging configuration", "Inspect condition reports and avoid excluding configuration blindly."]], { level: "Intermediate" }),
      chapter("spring", 6, "Application Configuration and Profiles", "Keep environment-specific configuration explicit and secrets outside source control.", [["Property sources", "Understand environment variables, config files, and override precedence."], ["Profiles", "Select environment-specific beans and settings deliberately."], ["Secrets and validation", "Supply sensitive values securely and fail early for invalid configuration."]], { level: "Intermediate" }),
      chapter("spring", 7, "Building REST APIs", "Define resource-oriented endpoints with clear request and response contracts.", [["Controllers and mappings", "Map HTTP methods and paths to focused controller methods."], ["DTOs and serialization", "Separate API representations from persistence entities."], ["Status codes and pagination", "Return useful HTTP semantics and bound collection responses."]], { level: "Intermediate", example: { language: "java", code: "@RestController\n@RequestMapping(\"/api/books\")\nclass BookController {\n    private final BookService service;\n\n    BookController(BookService service) {\n        this.service = service;\n    }\n\n    @GetMapping(\"/{id}\")\n    BookResponse find(@PathVariable long id) {\n        return service.find(id);\n    }\n}", output: "GET /api/books/42 -> 200 OK with a BookResponse JSON body" }, questions: [{ question: "Why return a DTO instead of a JPA entity from a controller?", answer: "A DTO keeps the public API independent of persistence mapping, limits exposed fields, and prevents serialization from traversing lazy entity relationships unexpectedly." }], revision: ["Model endpoints around resources and HTTP semantics.", "Keep transport DTOs separate from persistence entities.", "Paginate collections and return appropriate status codes."] }),
      chapter("spring", 8, "Validation and Exception Handling", "Reject invalid input consistently and return predictable error responses.", [["Bean Validation", "Validate request DTO constraints at the API boundary."], ["Global exception handling", "Translate known failures into stable response shapes."], ["Problem details and errors", "Expose actionable errors without leaking internals."]], { level: "Intermediate" }),
      chapter("spring", 9, "Spring Data JPA and Hibernate", "Map persistent state and use repositories without hiding database behavior.", [["Repositories and entities", "Map persistent state without leaking entities into every API layer."], ["Entity relationships", "Choose association ownership and cardinality deliberately."], ["Fetch strategies and N+1", "Detect repeated queries and choose measured fetch strategies."]], { level: "Intermediate" }),
      chapter("spring", 10, "Transactions and Database Integration", "Define atomic application operations and connect persistence safely.", [["Transaction boundaries", "Understand rollback rules and the proxy-based @Transactional model."], ["Isolation and propagation", "Select transaction behavior based on consistency requirements."], ["Migrations and connection pools", "Version schema changes and configure bounded database connections."]], { level: "Intermediate" }),
      chapter("spring", 11, "Spring Security", "Protect endpoints using explicit authentication and authorization rules.", [["Security filter chain", "Understand request processing through Spring Security filters."], ["Authentication and authorization", "Separate identity verification from permission checks."], ["JWT and OAuth2 resource servers", "Validate token claims, issuer configuration, and authorization rules."]], { level: "Advanced" }),
      chapter("spring", 12, "Testing Spring Boot Applications", "Test application behavior at the right boundary and avoid brittle mocks.", [["Unit tests", "Test business rules in isolation with JUnit."], ["Web and persistence slices", "Load only the Spring components relevant to a behavior."], ["Integration tests", "Verify real configuration and database interactions where valuable."]], { level: "Intermediate" }),
      chapter("spring", 13, "Caching, Scheduling and Async Work", "Use cached and background work with explicit consistency and failure behavior.", [["Cache keys and invalidation", "Define cache lifetime and invalidation alongside the source of truth."], ["Async execution", "Choose an executor and propagate context and errors deliberately."], ["Scheduling", "Make recurring work observable and safe to retry."]], { level: "Advanced" }),
      chapter("spring", 14, "Monitoring, Logging and Actuator", "Expose operational signals that help diagnose the application safely.", [["Actuator and health", "Expose suitable health and operational endpoints."], ["Structured logging", "Add useful context without recording secrets or personal data."], ["Metrics and tracing", "Instrument latency, errors, and dependencies for operational questions."]], { level: "Advanced" }),
      chapter("spring", 15, "Production Readiness and Interview Review", "Prepare a service for deployment and explain the trade-offs behind its design.", [["Graceful shutdown and readiness", "Stop accepting work before terminating in-flight requests."], ["Production configuration", "Validate resource limits, health checks, secrets, and database capacity."], ["Scenario review", "Explain how you would investigate latency, errors, and failing deployments."]], { level: "Advanced" }),
    ],
  },
  {
    id: "frontend", title: "Web and Frontend Foundations", category: "Frontend", description: "Learn the browser platform before choosing a framework-specific interface path.", accent: "#8b7150",
    chapters: [
      chapter("frontend", 1, "HTML and Accessibility", "Structure pages semantically and make essential interactions available to everyone.", [["Semantic HTML", "Use elements whose meaning matches the content and interaction."], ["Forms and labels", "Associate labels, inputs, and useful validation messages."], ["Keyboard and assistive technology", "Preserve focus order and accessible names for controls."]]),
      chapter("frontend", 2, "CSS and Responsive Layout", "Build adaptable layouts with predictable spacing and responsive constraints.", [["Box model and cascade", "Reason about sizing, specificity, and inherited styles."], ["Flexbox and grid", "Choose layout primitives based on one-dimensional or two-dimensional needs."], ["Responsive interfaces", "Use fluid constraints and test narrow viewports without horizontal overflow."]]),
      chapter("frontend", 3, "JavaScript and TypeScript", "Understand browser-side programming, asynchronous work, and static type checking.", [["JavaScript values and functions", "Use lexical scope, objects, modules, and modern syntax."], ["Promises and async/await", "Sequence asynchronous work and handle rejected operations."], ["TypeScript fundamentals", "Model data with types while remembering types disappear at runtime."], ["HTTP and browser APIs", "Fetch data and respond to browser events without blocking the UI."]], { level: "Intermediate" }),
    ],
  },
  {
    id: "react", title: "React", category: "Frontend", description: "Build component-driven interfaces and keep state close to the work it represents.", accent: "#50868b",
    officialReferences: [{ label: "React documentation", url: "https://react.dev/learn" }],
    chapters: [
      chapter("react", 1, "Components and Rendering", "Compose UI from components and understand how data reaches each view.", [["Components and JSX", "Describe UI with small, reusable component functions."], ["Props and one-way data flow", "Pass explicit inputs from a parent to its child."], ["Conditional and list rendering", "Render collections with stable keys and clear empty states."]]),
      chapter("react", 2, "State and User Interaction", "Model interactive UI as state and events rather than manual DOM updates.", [["State and event handlers", "Update component state in response to user actions."], ["Controlled forms", "Keep form values and validation behavior predictable."], ["Sharing and lifting state", "Place shared state at the nearest common owner."]], { example: { language: "tsx", code: "function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount((value) => value + 1)}>\n      Added {count} times\n    </button>\n  );\n}", output: "Clicking the button updates the displayed count." }, questions: [{ question: "Why use a functional state update when the next value depends on the current value?", answer: "The updater receives the latest queued state, so repeated updates are applied in order without relying on a value captured by an older render." }], revision: ["State describes the UI for the current render.", "Update state through its setter; do not mutate existing state.", "Lift state only as far as the components that share it need."] }),
      chapter("react", 3, "Effects and Data Fetching", "Synchronize with external systems while managing loading, errors, and stale responses.", [["Effect lifecycle", "Use effects for synchronization rather than derived render calculations."], ["Fetching and cancellation", "Represent pending, failed, and successful request states."], ["Routing and tests", "Connect views through routes and test user-visible behavior."]], { level: "Intermediate" }),
    ],
  },
  {
    id: "microservices", title: "Microservices and Distributed Systems", category: "Architecture", description: "Reason about service boundaries, failure, and consistency before splitting a system apart.", accent: "#627b70",
    chapters: [
      chapter("microservices", 1, "Boundaries and Communication", "Compare deployment boundaries and choose how services coordinate.", [["Monolith and service boundaries", "Split by cohesive business capability rather than technical layer."], ["Synchronous APIs", "Use request-response communication with timeouts and bounded payloads."], ["Events and asynchronous work", "Decouple producers and consumers while accepting eventual consistency."]], { level: "Intermediate" }),
      chapter("microservices", 2, "Resilience Patterns", "Design for partial failure without amplifying an outage.", [["Timeouts and retries", "Bound waits and retry only operations that are safe to repeat."], ["Circuit breakers and bulkheads", "Limit cascading failure and isolate constrained resources."], ["Idempotency and rate limits", "Make repeated requests safe and protect capacity."]], { level: "Advanced" }),
      chapter("microservices", 3, "Consistency and Workflows", "Coordinate multi-service changes without pretending a distributed transaction is local.", [["Saga workflows", "Manage a multi-step business operation with explicit compensations."], ["Outbox pattern", "Publish a durable event from the same local transaction as the state change."], ["CAP and eventual consistency", "Explain trade-offs in the presence of network partitions."]], { level: "Advanced" }),
      chapter("microservices", 4, "Service Operations", "Make request flows diagnosable across independent processes.", [["API gateways and discovery", "Route external traffic and locate service instances."], ["Tracing and correlation", "Follow a request across service boundaries with trace context."], ["Deployment and ownership", "Align operational ownership with independently released services."]], { level: "Advanced" }),
    ],
  },
  {
    id: "kafka", title: "Kafka and Messaging", category: "Backend", description: "Build event-driven integrations with a grounded understanding of partitions and delivery semantics.", accent: "#7b7770",
    officialReferences: [{ label: "Apache Kafka documentation", url: "https://kafka.apache.org/documentation/" }],
    chapters: [
      chapter("kafka", 1, "Kafka Concepts", "Understand topics, partitions, brokers, and the log model.", [["Topics and partitions", "Use partitions for ordered logs and parallel consumption."], ["Producers and keys", "Choose keys that preserve the ordering a business operation requires."], ["Brokers and replication", "Explain how replicas support availability and durability."]], { level: "Intermediate" }),
      chapter("kafka", 2, "Consumers and Delivery", "Scale consumers while making offset and duplicate behavior explicit.", [["Consumer groups", "Scale work across partitions while preserving group ownership."], ["Offsets and commits", "Choose commit timing based on processing and recovery requirements."], ["Delivery and idempotency", "Handle redelivery safely rather than assuming exactly-once business effects."]], { level: "Advanced", example: { language: "text", code: "partition 0:  [record 10] [record 11] [record 12]\nconsumer A:  process record 10 -> write result -> commit offset 11\n\nif the process stops before the commit, record 10 is delivered again", output: "The handler must tolerate replay, for example with a unique event ID or an idempotent database update." }, questions: [{ question: "Can Kafka consumer processing be assumed exactly once for an external database write?", answer: "No. A consumer can repeat a record if it crashes after committing the database change but before committing its offset. Use idempotent effects or an explicitly coordinated transaction strategy." }], revision: ["A consumer group shares partitions among its members.", "Offsets describe the group's position in a partition.", "At-least-once processing can redeliver; make effects idempotent."] }),
      chapter("kafka", 3, "Reliable Event Processing", "Design compatible event contracts and operate a consumer that can recover.", [["Schema evolution", "Change event schemas without breaking deployed producers and consumers."], ["Retries and dead-letter topics", "Separate transient failures from invalid or repeatedly failing records."], ["Outbox and observability", "Publish committed domain changes and monitor lag and failures."]], { level: "Advanced" }),
    ],
  },
  {
    id: "mongodb", title: "MongoDB", category: "Data", description: "Model document data around access patterns and understand consistency, indexing, and aggregation.", accent: "#628355",
    chapters: [
      chapter("mongodb", 1, "Documents and Data Modeling", "Understand BSON documents, collections, and embedding trade-offs.", [["Documents and collections", "Represent related data as flexible BSON documents grouped in collections."], ["Embedding and referencing", "Choose document boundaries based on access patterns and update behavior."], ["Schema validation", "Keep flexible schemas useful with explicit validation rules."]]),
      chapter("mongodb", 2, "CRUD and Querying", "Read and update documents precisely without accidental broad writes.", [["Filters and projections", "Match documents with explicit predicates and return only needed fields."], ["Updates and atomic operators", "Change fields and arrays atomically with update operators."], ["Pagination and sorting", "Bound query results and choose a stable sort order."]]),
      chapter("mongodb", 3, "Indexes and Query Plans", "Use indexes to support observed queries while accounting for write and storage cost.", [["Single and compound indexes", "Order compound index keys around equality, sort, and range predicates."], ["Explain plans", "Inspect index use and examined documents for a representative query."], ["Unique and TTL indexes", "Enforce uniqueness and expire time-bound data where appropriate."]], { level: "Intermediate", example: { language: "javascript", code: "db.orders.createIndex({ customerId: 1, createdAt: -1 });\n\ndb.orders.find({ customerId: 42 })\n  .sort({ createdAt: -1 })\n  .limit(20)\n  .explain(\"executionStats\");", output: "Review winningPlan and totalDocsExamined against the returned result count." }, questions: [{ question: "Why does the order of fields matter in a compound index?", answer: "MongoDB indexes keys in the declared order. A query can efficiently use the leading prefix, so field order should reflect equality predicates, sort order, and range access patterns." }], revision: ["Build indexes around actual query and sort patterns.", "Compound index field order changes which prefixes can be used.", "Indexes improve reads but consume storage and add write work."] }),
      chapter("mongodb", 4, "Aggregation and Transactions", "Transform documents in a pipeline and understand multi-document consistency boundaries.", [["Aggregation pipeline", "Compose match, group, project, and lookup stages with deliberate cardinality."], ["Transactions", "Use multi-document transactions only when a data-model change is insufficient."], ["Consistency and operations", "Understand replica-set write concerns, read concerns, and recovery."]], { level: "Advanced" }),
    ],
  },
  {
    id: "angular", title: "Angular", category: "Frontend", description: "Build structured TypeScript applications with components, dependency injection, routing, and reactive forms.", accent: "#a74358",
    officialReferences: [{ label: "Angular documentation", url: "https://angular.dev/overview" }],
    chapters: [
      chapter("angular", 1, "Angular and Components", "Understand the application shell and create views with standalone components.", [["Workspace and standalone components", "Create components and understand Angular's standalone-first structure."], ["Templates and bindings", "Connect component state to templates with property and event bindings."], ["Inputs, outputs, and control flow", "Exchange data and render conditional or repeated template content."]]),
      chapter("angular", 2, "Services and Dependency Injection", "Share application behavior through services with explicit dependency scopes.", [["Injectable services", "Keep reusable application logic outside view components."], ["Provider scopes", "Choose root or component-level service lifetime deliberately."], ["Signals and derived state", "Represent reactive local state and derive values without duplication."]], { level: "Intermediate" }),
      chapter("angular", 3, "Routing and Forms", "Navigate between views and validate user input at the boundary.", [["Router configuration", "Define routes, parameters, and a useful not-found path."], ["Route guards", "Protect navigation while keeping server authorization authoritative."], ["Reactive forms", "Model validation and submission state explicitly."]], { level: "Intermediate", example: { language: "typescript", code: "const routes: Routes = [\n  { path: \"books/:id\", component: BookDetailComponent },\n  { path: \"**\", component: NotFoundComponent },\n];", output: "Navigating to /books/42 activates the book detail route." }, questions: [{ question: "Can an Angular route guard replace server-side authorization?", answer: "No. A guard improves navigation and user experience, but a client can be modified or bypassed. The server must authorize every protected operation." }], revision: ["Routes map URLs to application views.", "Use guards for client navigation, never as the security boundary.", "Validate form input on the client and again on the server."] }),
      chapter("angular", 4, "HTTP, RxJS and Testing", "Integrate APIs with observable streams and verify user-visible behavior.", [["HttpClient and interceptors", "Share request concerns without hiding important response behavior."], ["RxJS subscriptions", "Compose observable work and clean up subscriptions correctly."], ["Component and service tests", "Test important behavior with focused fixtures and controlled dependencies."]], { level: "Advanced" }),
    ],
  },
  {
    id: "linux", title: "Linux and Networking", category: "Foundations", description: "Build confidence with command-line tools, processes, permissions, and practical network diagnosis.", accent: "#78845d",
    chapters: [
      chapter("linux", 1, "Shell and Filesystem", "Navigate a Linux system and compose commands without losing sight of the working directory.", [["Paths and navigation", "Use absolute and relative paths to inspect a filesystem."], ["Pipes and redirection", "Compose small commands and redirect output for inspection."], ["Search and text tools", "Use grep, find, and basic text processing to answer operational questions."]]),
      chapter("linux", 2, "Processes, Permissions and Services", "Inspect running work and apply least-privilege file access.", [["Processes and signals", "Inspect process state and send signals with a clear termination intent."], ["Users and permissions", "Interpret ownership and read, write, and execute permissions."], ["Services and logs", "Inspect systemd services and journal logs when diagnosing a host."]], { level: "Intermediate" }),
      chapter("linux", 3, "Networking Fundamentals", "Trace a request from name resolution through a network connection.", [["IP, ports, and routes", "Distinguish host addresses, service ports, and network paths."], ["DNS and HTTP", "Explain name resolution, TLS, and the request-response lifecycle."], ["Network troubleshooting", "Use curl, ss, dig, and logs to isolate connection failures."]], { level: "Intermediate", example: { language: "bash", code: "getent hosts api.internal\ncurl -v --connect-timeout 3 https://api.internal/health\nss -lntp", output: "Check name resolution, the HTTP/TLS exchange, then listening TCP sockets." }, questions: [{ question: "How would you distinguish a DNS failure from a connection refusal?", answer: "Check name resolution first with a resolver tool. If a name resolves but a TCP connection is refused, the destination is reachable but no process is accepting that port, or a network rule is actively rejecting it." }], revision: ["DNS resolves names to addresses; it does not prove a service is healthy.", "A TCP connection targets a host address and port.", "Check name resolution, routing, listening sockets, then application behavior."] }),
      chapter("linux", 4, "Production Troubleshooting", "Gather evidence about resource pressure before changing a production host.", [["CPU and memory", "Inspect load, memory, and process-level resource consumption."], ["Disk and file descriptors", "Check disk space, inode use, and open-file limits."], ["Incident notes", "Capture timestamps, symptoms, commands, and safe next actions."]], { level: "Advanced" }),
    ],
  },
  {
    id: "cicd", title: "CI/CD and Build Pipelines", category: "DevOps", description: "Automate tested, traceable software delivery with staged promotion and rollback.", accent: "#558579",
    chapters: [
      chapter("cicd", 1, "Build and Delivery Fundamentals", "Separate repeatable builds from controlled release and deployment decisions.", [["Continuous integration", "Integrate small changes and run automated quality checks frequently."], ["Build artifacts", "Produce versioned artifacts that can be promoted between environments."], ["Pipeline stages", "Order compile, test, scan, package, and deployment steps intentionally."]]),
      chapter("cicd", 2, "GitHub Actions and Jenkins", "Express automation as reviewable pipeline configuration.", [["Workflow triggers and jobs", "Define when jobs run and how their dependencies are ordered."], ["Runners and credentials", "Use scoped secrets and trusted runner boundaries."], ["Reusable pipelines", "Share common workflows without hiding required application behavior."]], { level: "Intermediate" }),
      chapter("cicd", 3, "Release Strategies and Rollback", "Deliver changes with a controlled blast radius and a practiced recovery path.", [["Rolling and blue-green releases", "Compare deployment strategies by capacity and recovery behavior."], ["Canary and feature flags", "Limit exposure and separate deployment from feature activation."], ["Rollback and database changes", "Plan compatibility across application and schema versions."]], { level: "Advanced" }),
      chapter("cicd", 4, "Supply Chain and GitOps", "Make delivery provenance visible and reconcile declared deployment state.", [["Dependency and image scanning", "Find vulnerable components before promotion."], ["Artifact provenance", "Track source revisions and build inputs used by a release."], ["GitOps principles", "Reconcile a declared deployment state and review changes through Git."]], { level: "Advanced" }),
    ],
  },
  {
    id: "aws", title: "AWS and Cloud Fundamentals", category: "Cloud", description: "Learn core cloud building blocks, identity, networking, and the operational trade-offs of managed services.", accent: "#b37a3b",
    officialReferences: [{ label: "AWS documentation", url: "https://docs.aws.amazon.com/" }, { label: "AWS Well-Architected", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" }],
    chapters: [
      chapter("aws", 1, "Cloud and AWS Foundations", "Understand regions, availability zones, shared responsibility, and cloud cost.", [["Regions and availability zones", "Choose deployment locations while planning for zone-level failure."], ["Shared responsibility", "Separate provider controls from customer configuration and data security."], ["Cost and service selection", "Estimate service cost drivers and choose a managed level deliberately."]]),
      chapter("aws", 2, "IAM and Network Boundaries", "Grant narrow identity permissions and control how services communicate.", [["Users, roles, and policies", "Prefer short-lived role credentials and least-privilege policies."], ["VPC, subnets, and routes", "Design public and private network segments with explicit routes."], ["Security groups", "Allow required traffic between known service boundaries."]], { level: "Intermediate" }),
      chapter("aws", 3, "Compute and Storage", "Select compute and storage services based on runtime and durability needs.", [["EC2 and Auto Scaling", "Operate virtual machines and scale a group behind health checks."], ["S3 storage", "Use object storage with deliberate access, lifecycle, and versioning policies."], ["ECS, EKS, and Lambda", "Compare managed containers, Kubernetes, and event-driven functions."]], { level: "Intermediate" }),
      chapter("aws", 4, "Databases and Application Delivery", "Connect an application to managed data and deliver traffic reliably.", [["RDS and backups", "Plan relational database sizing, backups, and maintenance windows."], ["Load balancers and health", "Route traffic to healthy targets and understand health-check behavior."], ["CloudWatch and IaC", "Use logs and metrics with repeatable infrastructure definitions."]], { level: "Advanced" }),
    ],
  },
  {
    id: "testing", title: "Testing and Code Quality", category: "Engineering Practice", description: "Choose tests that protect meaningful behavior and improve confidence without brittle over-mocking.", accent: "#87775b",
    chapters: [
      chapter("testing", 1, "Testing Fundamentals", "Match a test's scope to the behavior and failure you need to catch.", [["Test pyramid and test boundaries", "Balance fast unit checks with focused integration and end-to-end tests."], ["Assertions and fixtures", "Make setup readable and failures specific to the behavior."], ["Test naming and coverage", "Name scenarios clearly and use coverage as a clue rather than a quality target."]]),
      chapter("testing", 2, "JUnit, Mockito and Test Doubles", "Test Java behavior with real collaborators where practical and controlled doubles where useful.", [["JUnit lifecycle and parameterized tests", "Reduce duplicated setup while preserving clear scenarios."], ["Mocks, stubs, and fakes", "Choose a test double based on the behavior being isolated."], ["Mocking risks", "Avoid asserting implementation details that make refactoring expensive."]], { level: "Intermediate", example: { language: "java", code: "@Test\nvoid appliesDiscountToEligibleOrder() {\n    Order order = new Order(List.of(new Item(\"book\", 20)));\n\n    Price total = pricingService.totalFor(order);\n\n    assertEquals(new Price(18), total);\n}", output: "The assertion verifies the observable price for the selected scenario." }, questions: [{ question: "When should a test use a real dependency instead of a mock?", answer: "Use a real dependency when it is fast, deterministic, and part of the behavior under test. Mock boundaries that are slow, nondeterministic, or need a controlled failure response." }], revision: ["Test observable behavior at the narrowest useful boundary.", "Use mocks to control a boundary, not to mirror every method call.", "A passing test should make a regression easier to detect."] }),
      chapter("testing", 3, "Integration and End-to-End Testing", "Verify real boundaries and user workflows with deliberate test data.", [["Database integration tests", "Check persistence behavior against a representative database engine."], ["API and browser tests", "Exercise contracts and critical user-visible journeys."], ["Deterministic test environments", "Control time, ordering, network dependencies, and test cleanup."]], { level: "Intermediate" }),
      chapter("testing", 4, "Performance and Quality Gates", "Keep slowdowns and maintainability regressions visible in the delivery pipeline.", [["Load and stress tests", "Distinguish expected load from saturation and identify the limiting resource."], ["Static analysis", "Use compiler checks and analyzers to find defects before runtime."], ["Quality gates", "Set actionable checks and review exceptions rather than ignoring findings."]], { level: "Advanced" }),
    ],
  },
  {
    id: "security", title: "Application Security", category: "Engineering Practice", description: "Protect application boundaries, identity, dependencies, and sensitive data with practical controls.", accent: "#a55a49",
    chapters: [
      chapter("security", 1, "Web Security Fundamentals", "Understand common trust boundaries and the risks of treating input as trusted.", [["Threat modeling basics", "Identify assets, entry points, trust boundaries, and likely abuse cases."], ["Injection and output encoding", "Use parameterized queries and context-appropriate output encoding."], ["CSRF and CORS", "Distinguish cross-site request forgery protection from browser origin policy."]], { level: "Intermediate" }),
      chapter("security", 2, "Identity, Authorization and Secrets", "Protect user sessions, API permissions, and service credentials.", [["Authentication and authorization", "Verify identity separately from checking access to a resource."], ["OAuth2 and token handling", "Validate issuers, audiences, expiry, and storage risks."], ["Secrets management", "Keep credentials out of source, logs, and image layers; rotate them deliberately."]], { level: "Advanced" }),
      chapter("security", 3, "Supply Chain and Production Defense", "Reduce exposure from dependencies and investigate security signals.", [["Dependency updates and scanning", "Prioritize reachable vulnerabilities and maintain an update process."], ["Transport and data protection", "Use TLS and apply data minimization and retention rules."], ["Incident readiness", "Preserve useful audit evidence and define containment steps."]], { level: "Advanced" }),
    ],
  },
  {
    id: "design-patterns", title: "Design Patterns and Low-Level Design", category: "Architecture", description: "Apply object-oriented design tools to keep change local and interfaces purposeful.", accent: "#64807c",
    chapters: [
      chapter("lld", 1, "SOLID and Object Design", "Use responsibility, substitutability, and dependency direction to make change easier.", [["Single responsibility and cohesion", "Group behavior around one reason to change."], ["Open-closed and substitutability", "Extend behavior without breaking the expectations of existing callers."], ["Interface segregation and dependency inversion", "Keep contracts small and high-level policy independent of concrete details."]], { level: "Intermediate" }),
      chapter("lld", 2, "Creation and Composition Patterns", "Use established patterns when they clarify object creation and collaboration.", [["Factory and builder", "Separate complex creation from use and validate required construction state."], ["Strategy and adapter", "Swap algorithms or adapt a boundary behind a stable contract."], ["Decorator and composition", "Add behavior without an inheritance hierarchy of combinations."]], { level: "Intermediate" }),
      chapter("lld", 3, "Low-Level Design Exercises", "Turn requirements into explicit domain objects, contracts, and testable behavior.", [["Clarify requirements and invariants", "Identify actors, rules, and edge cases before drawing classes."], ["Model objects and APIs", "Assign responsibilities and define collaboration through small interfaces."], ["Machine-coding practice", "Implement a bounded feature with tests, error handling, and readable code."]], { level: "Advanced" }),
    ],
  },
  {
    id: "projects", title: "Full-Stack Projects and Machine Coding", category: "Practice", description: "Apply the curriculum in complete, testable applications and time-bounded coding exercises.", accent: "#b76d4e",
    chapters: [
      chapter("projects", 1, "Build a Production-Ready REST Service", "Turn a small domain into a reliable API with persistence and tests.", [["Define scope and API contracts", "Write the use cases, resource shapes, validation rules, and error responses before coding."], ["Implement persistence and business rules", "Keep database access, domain behavior, and web transport responsibilities distinct."], ["Test and document the service", "Cover business cases and API boundaries, then publish a concise OpenAPI contract."]], { level: "Intermediate", prerequisites: ["Building REST APIs", "Spring Data JPA and Hibernate"], example: { language: "text", code: "POST /api/tasks\nGET  /api/tasks?status=OPEN&page=0&size=20\nPATCH /api/tasks/{id}\n\nAcceptance: validate input, persist changes, return stable errors, and test each contract.", output: "A versioned API that can be run and verified from a clean checkout." }, questions: [{ question: "What makes a project portfolio-ready rather than just runnable?", answer: "A clear problem statement, reliable setup instructions, meaningful tests, documented API behavior, sensible error handling, and visible trade-offs make the work reviewable beyond a successful local run." }], revision: ["Start with bounded use cases and an explicit API contract.", "Keep transport, business rules, and persistence responsibilities distinct.", "Make a clean checkout reproducible with tests and setup instructions."] }),
      chapter("projects", 2, "Integrate a Full-Stack Application", "Connect a frontend experience to the backend while handling real network states.", [["Compose the user workflow", "Model the page and API behavior for success, empty, loading, and failure states."], ["Connect a frontend and service", "Integrate the chosen React or Angular client with a versioned Spring API."], ["Add integration and accessibility checks", "Verify a critical user journey with keyboard access and a representative API response."]], { level: "Intermediate", prerequisites: ["HTML and Accessibility", "JavaScript and TypeScript", "Building REST APIs"] }),
      chapter("projects", 3, "Deploy, Observe and Improve", "Package an application and use operational evidence to improve it safely.", [["Containerize the application", "Build a reproducible Docker image and configure health and runtime settings."], ["Automate a delivery pipeline", "Run checks on changes and promote a versioned artifact through an environment."], ["Review a production scenario", "Use logs, metrics, and a trace to explain a defect and verify its fix."]], { level: "Advanced", prerequisites: ["Dockerfile and Image Building", "Build and Delivery Fundamentals", "Monitoring, Logging and Actuator"] }),
      chapter("projects", 4, "Machine-Coding Practice", "Deliver a small, complete implementation under a clear time constraint.", [["Clarify requirements and edge cases", "State assumptions, domain invariants, input boundaries, and expected behavior."], ["Build a vertical slice", "Implement one working path with a test before adding secondary behavior."], ["Explain trade-offs and next steps", "Describe what is intentionally omitted and how you would evolve the solution."]], { level: "Advanced", prerequisites: ["Low-Level Design Exercises"], example: { language: "text", code: "Prompt: implement a fixed-window in-memory rate limiter.\nContract: allow(key, limit, windowStart) -> decision + retryAfter\nTests: new key, limit boundary, reset window, concurrent calls.", output: "A small API, explicit boundary behavior, focused tests, and a brief design explanation." }, questions: [{ question: "How do you decide what to implement first in a timed coding exercise?", answer: "Clarify the contract and boundaries, identify the smallest end-to-end behavior, and make it correct and testable before adding optional features or abstracting hypothetical change." }], revision: ["Clarify inputs, outputs, assumptions, and boundary cases first.", "Build the smallest vertical slice and test the important rules.", "Explain trade-offs and known limits honestly."] }),
    ],
  },
  {
    id: "interview-prep", title: "Role-Specific Interview Preparation", category: "Interviews", description: "Turn foundational knowledge into concise explanations, coding practice, and production scenario judgment.", accent: "#9b655b",
    chapters: [
      chapter("interviews", 1, "Fresher and Java Fundamentals", "Practice explaining core concepts and writing clear entry-level Java solutions.", [["Core Java question review", "Explain types, object design, collections, exceptions, and equality with short examples."], ["Coding problem routine", "Clarify constraints, describe complexity, and test edge cases before submitting code."], ["Project discussion", "Describe your contribution, a technical decision, and one change you would make now."]], { questions: [{ question: "How should a fresher explain a project they built?", answer: "Start with the user problem and your contribution. Walk through the main data and request flow, one decision and trade-off, how you tested it, and what you would improve next." }], revision: ["Lead with a direct answer, then support it with a small example.", "State complexity and test boundary cases in coding rounds.", "Be precise about your own contribution and learning." ] }),
      chapter("interviews", 2, "Backend and Full-Stack Interviews", "Connect language, API, database, security, and frontend decisions into one coherent explanation.", [["Spring and persistence review", "Explain dependency injection, transaction boundaries, API validation, and query behavior."], ["Frontend integration", "Discuss API loading and error states, browser security, and accessible interactions."], ["SQL and data questions", "Solve a query, choose an index from an access pattern, and state the consistency requirements."]], { level: "Intermediate", prerequisites: ["Spring Security", "Indexes and Query Plans"], questions: [{ question: "How do you explain an API that is slow only for some users?", answer: "Compare request inputs and data shape, inspect latency by dependency and query plan, check cache behavior and load, then use a trace or correlation ID to identify the specific slow path before changing it." }] }),
      chapter("interviews", 3, "Experienced Developer Scenarios", "Respond to reliability, concurrency, security, and distributed-system scenarios with evidence and trade-offs.", [["Concurrency and production incidents", "Reason about shared state, saturation, retries, and failure containment."], ["Distributed system design", "Compare synchronous and asynchronous boundaries, consistency, and recovery behavior."], ["Architecture trade-offs", "Choose an approach from explicit constraints and explain the cost of alternatives."]], { level: "Advanced", prerequisites: ["Concurrency and Threads", "Resilience Patterns", "Requirements and Estimation"], questions: [{ question: "What should you do when a retry storm is amplifying a dependency outage?", answer: "Stop unbounded retries, enforce timeouts and backoff with jitter, apply concurrency limits or a circuit breaker, and shed optional work. Confirm recovery with dependency latency, error rate, and queue depth before relaxing protections." }] }),
      chapter("interviews", 4, "System Design and Behavioral Review", "Practice structured design conversations and concise, specific behavioral examples.", [["System design walkthrough", "Clarify requirements, estimate scale, sketch interfaces and data, then examine failure and operations."], ["Behavioral evidence", "Use a specific situation, personal action, result, and reflection without overstating impact."], ["Practice plan", "Rotate coding, system design, and project explanation instead of cramming disconnected questions."]], { level: "Advanced", prerequisites: ["Practice Design Exercises", "Low-Level Design Exercises"] }),
    ],
  },
  {
    id: "docker", title: "Docker", category: "DevOps", description: "Package applications into reproducible containers and understand their runtime boundaries.", accent: "#507f82",
    officialReferences: [{ label: "Docker docs", url: "https://docs.docker.com/" }],
    chapters: [
      chapter("docker", 1, "Containerization Fundamentals", "Understand what containers isolate and how they differ from virtual machines.", [["Processes and isolation", "Explain how containers isolate processes while sharing a host kernel."], ["Containers and virtual machines", "Compare container startup and isolation boundaries with a virtual machine."], ["When to containerize", "Identify when repeatable application packaging helps a development workflow."]]),
      chapter("docker", 2, "Docker Architecture", "Trace a Docker command through its client, daemon, and image registry.", [["Docker client and daemon", "Explain how the CLI sends requests to the Docker Engine API."], ["Registries and image distribution", "Pull and publish tagged images through a registry."], ["BuildKit overview", "Understand build contexts and the role of the image builder."]]),
      chapter("docker", 3, "Images and Containers", "Distinguish image layers from running container processes.", [["Image layers", "Describe layered filesystems and immutable image content."], ["Image tags and digests", "Distinguish a mutable human-readable tag from an immutable digest."], ["Container runtime state", "Inspect the writable layer and process state of a running container."]]),
      chapter("docker", 4, "Dockerfile and Image Building", "Build a reproducible application image with explicit files and runtime behavior.", [["Dockerfile instructions", "Use FROM, WORKDIR, COPY, and CMD for predictable image construction."], ["Build context and .dockerignore", "Send only required files to the image builder."], ["Layer caching", "Order stable and changing build inputs to preserve useful cache layers."]], { example: { language: "dockerfile", code: "FROM eclipse-temurin:21-jre\nWORKDIR /app\nCOPY build/libs/app.jar app.jar\nUSER 10001\nEXPOSE 8080\nENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]", output: "docker build -t catalog-api:1.0 .\ndocker run --rm -p 8080:8080 catalog-api:1.0" }, mistakes: ["COPY does not automatically exclude local build output or secrets; use .dockerignore.", "A container's EXPOSE metadata does not publish a host port.", "Prefer exec-form ENTRYPOINT so the Java process receives signals directly."], questions: [{ question: "What is the difference between EXPOSE and publishing a port?", answer: "EXPOSE documents the port the image expects to use. Publishing with docker run -p creates a host-to-container port mapping that makes it reachable through the host." }], revision: ["Build context controls which files the builder can access.", "A container image is immutable; a container is a process using that image.", "Run as a non-root user and keep secrets out of image layers."] }),
      chapter("docker", 5, "Container Lifecycle and Commands", "Inspect, run, stop, and diagnose containers from the command line.", [["Run and inspect", "Create a container with explicit ports, environment, and restart behavior."], ["Logs and exec", "Observe output and inspect a running process without rebuilding the image."], ["Exit codes and signals", "Interpret process termination and handle graceful shutdown."]]),
      chapter("docker", 6, "Docker Volumes and Persistent Storage", "Preserve application data outside the disposable container layer.", [["Named volumes", "Manage durable data with a Docker-managed volume."], ["Bind mounts", "Share host files with a container for local development."], ["Backup and lifecycle", "Plan data backup and cleanup independently from container removal."]]),
      chapter("docker", 7, "Docker Networking", "Connect containers while keeping service discovery and port boundaries clear.", [["Bridge networks", "Let containers discover peers by service name on a shared network."], ["Published ports", "Map host ports intentionally without confusing host and container addresses."], ["DNS and troubleshooting", "Trace name resolution and connection failures between containers."]]),
      chapter("docker", 8, "Multi-Stage Builds and Image Optimization", "Reduce image size and keep build tools out of production runtimes.", [["Build and runtime stages", "Copy only required artifacts from a builder into the final stage."], ["Layer and cache strategy", "Order stable and changing inputs to preserve useful cache layers."], ["Base image selection", "Balance compatibility, maintenance, and attack surface."]], { level: "Intermediate" }),
      chapter("docker", 9, "Docker Compose", "Describe a repeatable local multi-container development environment.", [["Compose services", "Declare application dependencies in one readable configuration."], ["Health and startup", "Distinguish process startup from application readiness."], ["Environment and secrets", "Keep environment-specific values out of the image."]]),
      chapter("docker", 10, "Security and Best Practices", "Build and run images with a deliberate security boundary.", [["Non-root processes", "Run application processes with an unprivileged user."], ["Image provenance and scanning", "Track trusted base images and scan dependencies and layers."], ["Secrets and capabilities", "Keep credentials out of build layers and drop unnecessary privileges."]], { level: "Intermediate" }),
      chapter("docker", 11, "Troubleshooting and Production Scenarios", "Diagnose common container failures from observed runtime evidence.", [["Startup and health failures", "Inspect entry points, configuration, probes, and application logs."], ["Networking and storage incidents", "Check DNS, ports, mount permissions, and available capacity."], ["Resource pressure", "Use limits and runtime metrics to investigate memory or CPU failures."]], { level: "Advanced" }),
      chapter("docker", 12, "Docker Interview Preparation", "Explain container trade-offs and work through practical image scenarios.", [["Images versus containers", "Explain immutable image layers and process-based containers."], ["Build scenario", "Design a secure, cached multi-stage build for a Java service."], ["Runtime scenario", "Diagnose a container that works locally but fails after deployment."]], { level: "Advanced" }),
    ],
  },
  {
    id: "kubernetes", title: "Kubernetes", category: "DevOps", description: "Deploy containerized workloads declaratively and reason about their health and rollout.", accent: "#53878b",
    officialReferences: [{ label: "Kubernetes concepts", url: "https://kubernetes.io/docs/concepts/" }],
    chapters: [
      chapter("kubernetes", 1, "Cluster and Workload Basics", "Connect the cluster control plane to pods and declarative workload objects.", [["Cluster architecture", "Describe the API server, scheduler, and node responsibilities."], ["Pods and Deployments", "Declare desired replica count and let a controller reconcile it."], ["Labels and selectors", "Connect workloads and services through stable selection rules."]], { level: "Intermediate", example: { language: "yaml", code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: catalog\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: catalog\n  template:\n    metadata:\n      labels:\n        app: catalog\n    spec:\n      containers:\n        - name: catalog\n          image: catalog-api:1.0", output: "kubectl apply -f catalog.yaml\nkubectl rollout status deployment/catalog" }, questions: [{ question: "What does a Deployment add on top of a Pod?", answer: "A Deployment manages ReplicaSets to maintain the declared number of pod replicas and coordinate rolling updates and rollbacks." }], revision: ["A pod is the smallest scheduled workload unit.", "A Deployment reconciles a desired replica count through ReplicaSets.", "Selectors connect a workload to the pods it manages."] }),
      chapter("kubernetes", 2, "Networking and Configuration", "Expose workloads and manage configuration without baking it into images.", [["Services and Ingress", "Choose stable internal discovery and an external HTTP entry point."], ["ConfigMaps and Secrets", "Supply configuration while following the platform's secret-handling limits."], ["DNS and network paths", "Trace a request from ingress to a selected pod."]], { level: "Intermediate" }),
      chapter("kubernetes", 3, "Health, Scaling and Releases", "Keep workloads available during failure and controlled change.", [["Probes and resource requests", "Separate startup, liveness, and readiness signals and request resources."], ["Rollouts and rollback", "Observe deployment progress and recover from a bad release."], ["Autoscaling and Helm", "Scale from measured demand and parameterize reusable deployments."]], { level: "Advanced" }),
    ],
  },
  {
    id: "system-design", title: "System Design", category: "Architecture", description: "Turn an ambiguous product need into a system with explicit constraints and trade-offs.", accent: "#bf744d",
    chapters: [
      chapter("system-design", 1, "Requirements and Estimation", "Clarify what the system must do before drawing boxes.", [["Functional and non-functional needs", "Separate user-visible behavior from availability, latency, and security goals."], ["Traffic and storage estimates", "Estimate order of magnitude and state your assumptions."], ["SLOs and bottlenecks", "Use service objectives to prioritize the design's constraints."]], { level: "Advanced" }),
      chapter("system-design", 2, "Data and Scaling", "Choose storage and scaling strategies around access patterns and bottlenecks.", [["SQL and NoSQL choices", "Select data models from consistency, query, and ownership needs."], ["Caching and CDN", "Place caches intentionally and plan invalidation and stale data behavior."], ["Replication and partitioning", "Scale reads and writes while recognizing their consistency costs."]], { level: "Advanced" }),
      chapter("system-design", 3, "Reliability and Messaging", "Design for degraded dependencies and communicate work asynchronously when appropriate.", [["Queues and backpressure", "Buffer work without allowing unbounded backlog growth."], ["Availability and recovery", "Set failure boundaries, redundancy, and recovery expectations."], ["Observability", "Choose logs, metrics, and traces that answer operational questions."]], { level: "Advanced" }),
      chapter("system-design", 4, "Practice Design Exercises", "Apply a consistent method to common system design interview scenarios.", [["URL shortener", "Design key generation, redirects, storage, and abuse controls."], ["Notification service", "Model preferences, delivery channels, retries, and user-visible status."], ["Rate limiter and file upload", "Compare algorithms and handle large, resumable data transfers."]], { level: "Advanced" }),
    ],
  },
];

for (const technology of curricula) {
  for (const chapter of technology.chapters) {
    const guide = CHAPTER_GUIDES[`${technology.id}/${chapter.id}`] ?? deriveChapterGuide(technology, chapter);
    if (guide) {
      const { lessonExplanations, ...chapterContent } = guide;
      Object.assign(chapter, chapterContent);
      for (const lesson of chapter.lessons) {
        const explanation = lessonExplanations?.[lesson.title];
        if (explanation) lesson.explanation = explanation;
      }
    }
  }
}

export const CURRICULA = curricula;
export const TECHNOLOGY_BY_ID = new Map(CURRICULA.map((technology) => [technology.id, technology]));

export type LearningPath = {
  id: "beginner" | "intermediate" | "experienced";
  title: string;
  label: string;
  description: string;
  sequence: string[];
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "beginner", title: "Fresher / Beginner", label: "Start with the essentials", description: "Build the foundations in order, then move into Java and your first complete application.",
    sequence: ["programming-fundamentals", "git", "core-java", "dsa", "sql", "mongodb", "frontend", "spring-boot", "react", "testing", "microservices", "kafka", "linux", "docker", "cicd", "kubernetes", "aws", "design-patterns", "system-design", "projects", "interview-prep"],
  },
  {
    id: "intermediate", title: "Intermediate Developer", label: "Build production depth", description: "Strengthen implementation, testing, integration, and operational judgment.",
    sequence: ["core-java", "sql", "mongodb", "spring-boot", "frontend", "react", "dsa", "testing", "security", "kafka", "microservices", "linux", "docker", "cicd", "kubernetes", "aws", "design-patterns", "system-design", "projects", "interview-prep"],
  },
  {
    id: "experienced", title: "Experienced / Interview Prep", label: "Practice trade-offs and scale", description: "Focus on internals, reliability, architecture, and scenario-based interview decisions.",
    sequence: ["core-java", "spring-boot", "security", "kafka", "microservices", "linux", "docker", "cicd", "kubernetes", "aws", "design-patterns", "system-design", "projects", "interview-prep"],
  },
];

export const ROADMAP_PHASES = [
  { title: "Start here", ids: ["programming-fundamentals", "git", "core-java", "dsa"] },
  { title: "Data and services", ids: ["sql", "mongodb", "spring-boot"] },
  { title: "Choose your frontend", ids: ["frontend", "angular", "react"] },
  { title: "Quality and security", ids: ["testing", "security"] },
  { title: "Distributed systems", ids: ["microservices", "kafka"] },
  { title: "Ship and scale", ids: ["linux", "docker", "cicd", "kubernetes", "aws"] },
  { title: "Design for the real world", ids: ["design-patterns", "system-design"] },
  { title: "Build and prepare", ids: ["projects", "interview-prep"] },
];
