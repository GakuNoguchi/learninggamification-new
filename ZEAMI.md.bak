# ZEAMI Framework - Practical Development Knowledge System

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     ███████╗ ███████╗  █████╗  ███╗   ███╗ ██╗         ║
║     ╚══███╔╝ ██╔════╝ ██╔══██╗ ████╗ ████║ ██║         ║
║       ███╔╝  █████╗   ███████║ ██╔████╔██║ ██║         ║
║      ███╔╝   ██╔══╝   ██╔══██║ ██║╚██╔╝██║ ██║         ║
║     ███████╗ ███████╗ ██║  ██║ ██║ ╚═╝ ██║ ██║         ║
║     ╚══════╝ ╚══════╝ ╚═╝  ╚═╝ ╚═╝     ╚═╝ ╚═╝         ║
║                                                          ║
║        Practical Knowledge for Modern Development       ║
╚══════════════════════════════════════════════════════════╝
```

## ⚠️ Most Important Principle

**Always be conscious of best practices in every domain.**

Avoid reinventing the wheel. Adopt established best practices from each technology stack, framework, and language community. Before creating custom solutions, search for, understand, and apply existing excellent solutions.

## 🌟 What is ZEAMI?

ZEAMI is a knowledge framework that systematizes practical development know-how. It maximizes developer productivity through AI-human collaborative development, error pattern learning, and efficient development processes.

## 🎯 Core Principles

### 1. Vision-Driven Development
**Clarify the goal before technical details**
- Start with What to build
- Share Why we're building it
- Decide How through dialogue

### 2. Interactive Value Co-creation
**Find optimal solutions through dialogue, not one-way instructions**
- Ask "What do you think about this?"
- Consider both pros and cons
- Identify essence through critical thinking

### 3. Continuous Recording and Learning
**A system to never repeat the same mistakes**
- Record and share error patterns
- Generalize success cases
- Knowledge circulation across the team

### 4. Zero-Friction Development Experience
**Naturally improve quality without disrupting existing flows**
- Don't create overly complex systems
- Choose simple and intuitive methods
- Focus on incremental improvements

## 📚 Practical Knowledge System

### Error Patterns and Solutions

#### TypeScript Error Patterns
```yaml
Cannot_find_module:
  symptom: "Cannot find module 'xxx'"
  causes:
    - Package not installed
    - Missing type definitions
    - Path resolution issues
  solutions:
    1. npm install xxx
    2. npm install -D @types/xxx
    3. Check tsconfig.json paths configuration
  prevention: "Explicit dependency management"

Type_mismatch:
  symptom: "Type 'X' is not assignable to type 'Y'"
  causes:
    - Type definition mismatch
    - Implicit any type
    - Generic misuse
  solutions:
    1. Explicit type annotations
    2. Use type guards
    3. as const assertion
  prevention: "Enable strict: true"

Async_await_error:
  symptom: "await is only valid in async function"
  causes:
    - Missing async context
    - Promise chain misunderstanding
  solutions:
    1. Add async keyword to function
    2. Convert to .then() chain
    3. Wrap with IIFE
  prevention: "Consistent async handling"
```

#### React/Next.js Patterns
```yaml
Hydration_mismatch:
  symptom: "Text content does not match server-rendered HTML"
  causes:
    - Client/server state mismatch
    - Conditional rendering
    - Date/Math.random usage
  solutions:
    1. Use useEffect for client processing
    2. Use suppressHydrationWarning
    3. Disable SSR with dynamic import
  prevention: "Clear SSR/CSR separation"

useEffect_cleanup:
  symptom: "Memory leak detected"
  causes:
    - Missing cleanup function
    - Unremoved event listeners
    - Uncleared timers
  solutions:
    ```javascript
    useEffect(() => {
      const timer = setTimeout(...);
      return () => clearTimeout(timer);
    }, []);
    ```
  prevention: "Always return cleanup function"
```

### Development Flow Best Practices

#### New Feature Development Flow
```mermaid
graph TD
    A[Understand Requirements] --> B[Design Consideration]
    B --> C[Minimal Implementation]
    C --> D[Functionality Check]
    D --> E{Issues?}
    E -->|Yes| F[Root Cause Analysis]
    F --> G[Essential Solution]
    G --> D
    E -->|No| H[Create Tests]
    H --> I[Refactoring]
    I --> J[Documentation]
```

#### Error Resolution Thought Process
```
1. Accurate Understanding of Symptoms
   - Read full error message
   - Identify timing of occurrence
   - Establish reproduction steps

2. Hypothesis Formation
   - List possible causes
   - Order by probability
   - Decide verification method

3. Incremental Verification
   - Create minimal reproduction code
   - Verify hypotheses one by one
   - Add logs to check state

4. Root Solution
   - Essential fix, not surface workaround
   - Implement prevention for similar issues
   - Share insights with team
```

### Practical Design Patterns

#### Universal Adapter Pattern
```javascript
// Select appropriate execution method based on environment
class UniversalAdapter {
  async execute(command) {
    // Check available environments with priority
    const executors = [
      { check: this.isMCPAvailable, exec: this.executeMCP },
      { check: this.isIPCAvailable, exec: this.executeIPC },
      { check: this.isHTTPAvailable, exec: this.executeHTTP },
      { check: this.isDirectAvailable, exec: this.executeDirect }
    ];

    for (const { check, exec } of executors) {
      if (await check.call(this)) {
        return await exec.call(this, command);
      }
    }

    throw new Error('No execution environment available');
  }
}
```

#### Progressive Enhancement Pattern
```javascript
// Extend incrementally from base functionality
class FeatureManager {
  constructor() {
    this.features = new Map();
  }

  // Register core functionality
  registerCore(name, implementation) {
    this.features.set(name, {
      level: 'core',
      impl: implementation,
      fallback: null
    });
  }

  // Register enhancement (with fallback)
  registerEnhancement(name, implementation, fallback) {
    this.features.set(name, {
      level: 'enhanced',
      impl: implementation,
      fallback: fallback || this.features.get(name)?.impl
    });
  }

  // Execute (use highest available level)
  async execute(name, ...args) {
    const feature = this.features.get(name);
    if (!feature) throw new Error(`Feature ${name} not found`);

    try {
      return await feature.impl(...args);
    } catch (error) {
      if (feature.fallback) {
        console.warn(`Falling back for ${name}:`, error.message);
        return await feature.fallback(...args);
      }
      throw error;
    }
  }
}
```

### Knowledge Structure Format

#### Multi-Format Knowledge System
```yaml
knowledge_structure:
  documentation:
    format: Markdown
    purpose: "Human-readable explanations"
    example: "README.md, guide documents"

  structured_data:
    format: YAML/JSON
    purpose: "Machine-processable data"
    example: "Configuration files, error pattern DB"

  flow_diagrams:
    format: Mermaid
    purpose: "Process flow visualization"
    example: "Architecture diagrams, state transitions"

  schemas:
    format: TypeScript/Zod
    purpose: "Type safety guarantee"
    example: "API schemas, data models"
```

#### Error Recording Format
```json
{
  "id": "ERR_2024_001",
  "timestamp": "2024-01-23T10:00:00Z",
  "error": {
    "message": "Cannot read property 'foo' of undefined",
    "stack": "...",
    "context": {
      "file": "src/components/Widget.tsx",
      "line": 42,
      "function": "handleClick"
    }
  },
  "solution": {
    "approach": "Optional chaining",
    "code_change": {
      "before": "object.foo.bar",
      "after": "object?.foo?.bar"
    },
    "explanation": "Handle potential object absence"
  },
  "metadata": {
    "frequency": 3,
    "success_rate": 1.0,
    "tags": ["typescript", "runtime-error", "null-safety"],
    "related": ["ERR_2023_105", "ERR_2024_003"]
  }
}
```

### Efficient Development Techniques

#### Utilizing Parallel Processing
```javascript
// ❌ Inefficient: Sequential processing
const user = await fetchUser(id);
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts);

// ✅ Efficient: Parallel processing
const [user, settings, permissions] = await Promise.all([
  fetchUser(id),
  fetchSettings(id),
  fetchPermissions(id)
]);

// ✅ Conditional parallel processing
const results = await Promise.allSettled([
  fetchRequired(),
  shouldFetchOptional() ? fetchOptional() : Promise.resolve(null)
]);
```

#### Cache Strategy
```javascript
class SmartCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(key, fetcher) {
    const cached = this.cache.get(key);

    // If cache is valid
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    // Cache miss or expired
    try {
      const data = await fetcher();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      // Return stale cache on error (if available)
      if (cached) {
        console.warn('Using stale cache due to error:', error);
        return cached.data;
      }
      throw error;
    }
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (pattern instanceof RegExp ? pattern.test(key) : key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Project Structure Best Practices

```
project/
├── src/
│   ├── components/        # UI Components
│   │   ├── common/       # Shared components
│   │   ├── features/     # Feature-specific components
│   │   └── layouts/      # Layout components
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCache.ts
│   │   └── useWebSocket.ts
│   │
│   ├── services/         # Business logic
│   │   ├── api/         # API communication
│   │   ├── storage/     # Data persistence
│   │   └── validation/  # Validation
│   │
│   ├── types/           # Type definitions
│   │   ├── models/      # Data models
│   │   ├── api/        # API response types
│   │   └── global.d.ts # Global type definitions
│   │
│   └── utils/           # Utility functions
│       ├── format/      # Format functions
│       ├── helpers/     # Helper functions
│       └── constants.ts # Constants
│
├── docs/
│   ├── architecture/    # Architecture documentation
│   ├── guides/         # Development guides
│   └── api/           # API specifications
│
└── tests/
    ├── unit/          # Unit tests
    ├── integration/   # Integration tests
    └── e2e/          # E2E tests
```

## 🔍 Measurable Improvement Effects

### Performance Optimization
```yaml
before_optimization:
  initial_load: 3.2s
  api_response: 800ms
  render_time: 150ms
  memory_usage: 120MB

after_optimization:
  initial_load: 1.1s  # -65% (code splitting, lazy loading)
  api_response: 200ms # -75% (caching, parallelization)
  render_time: 50ms   # -66% (React.memo, virtual scrolling)
  memory_usage: 45MB  # -62% (memory leak fixes)

techniques_applied:
  - Code splitting with dynamic imports
  - API response caching
  - React component memoization
  - Virtual scrolling for large lists
  - Memory leak fixes in event listeners
```

## 🎨 UI/UX Practical Knowledge

### TailwindCSS Best Practices

#### 1. Utility-First Principle
```jsx
// ❌ Avoid: Custom CSS overuse
<div className="custom-card">
  <style jsx>{`
    .custom-card {
      padding: 20px;
      margin: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `}</style>
</div>

// ✅ Recommended: Tailwind utility classes
<div className="p-5 m-2.5 rounded-lg shadow-md">
  {/* Content */}
</div>
```

#### 2. Proper Component Class Usage
```jsx
// ❌ Avoid: Too many class enumerations
<button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105">
  Click me
</button>

// ✅ Recommended: @apply or componentization
// styles.css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md;
    @apply hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75;
    @apply transition duration-200 ease-in-out transform hover:scale-105;
  }
}

// Component
<button className="btn-primary">
  Click me
</button>

// Or, componentization
const Button = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-700 text-white',
    danger: 'bg-red-500 hover:bg-red-700 text-white'
  };

  return (
    <button className={`px-4 py-2 font-semibold rounded-lg shadow-md transition ${variants[variant]}`}>
      {children}
    </button>
  );
};
```

#### 3. Tailwind Responsive Design Implementation
```jsx
// Mobile-first approach
<div className="
  w-full px-4 py-2           // Mobile (default)
  sm:px-6 sm:py-3            // 640px+
  md:px-8 md:py-4            // 768px+
  lg:px-12 lg:py-6           // 1024px+
  xl:px-16 xl:py-8           // 1280px+
  2xl:max-w-7xl 2xl:mx-auto  // 1536px+
">
  {/* Responsive grid */}
  <div className="
    grid grid-cols-1          // Mobile: 1 column
    sm:grid-cols-2            // Tablet: 2 columns
    lg:grid-cols-3            // Desktop: 3 columns
    xl:grid-cols-4            // Wide: 4 columns
    gap-4 sm:gap-6 lg:gap-8
  ">
    {items.map(item => (
      <Card key={item.id} {...item} />
    ))}
  </div>
</div>
```

#### 4. Dark Mode Support
```jsx
// Utilizing Tailwind's dark mode classes
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border border-gray-200 dark:border-gray-700
  hover:shadow-lg dark:hover:shadow-2xl
">
  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
    Title
  </h2>
  <p className="text-gray-600 dark:text-gray-300">
    Description
  </p>
</div>
```

### Accessibility Checklist
```yaml
keyboard_navigation:
  - Logical tab order
  - Visually clear focus
  - Escape key closes modals
  - Enter key executes buttons

screen_reader:
  - Proper aria-label settings
  - Correct role attribute usage
  - Meaningful alt text descriptions
  - Heading level hierarchy

color_contrast:
  - WCAG AA level compliance (4.5:1)
  - Important info not dependent on color alone
  - Dark mode support

interactive_elements:
  - Minimum tap area 44x44px
  - Clear hover state changes
  - Loading state display
  - Clear error states
```

## 🚨 Anti-patterns Collection

### Code Patterns to Avoid
```javascript
// ❌ Global pollution
window.myApp = {
  data: [],
  init: function() { }
};

// ✅ Modularization
export class App {
  private data: any[] = [];
  init() { }
}

// ❌ Magic numbers
if (status === 200) { }
if (role === 1) { }

// ✅ Constants
const HTTP_STATUS = { OK: 200 };
const USER_ROLE = { ADMIN: 1 };

// ❌ Deeply nested callback hell
getData((data) => {
  processData(data, (processed) => {
    saveData(processed, (saved) => {
      notify(saved);
    });
  });
});

// ✅ Flattened with async/await
const data = await getData();
const processed = await processData(data);
const saved = await saveData(processed);
await notify(saved);

// ❌ Giant functions
function doEverything(data) {
  // 300 lines of code...
}

// ✅ Small single-responsibility functions
function validateData(data) { }
function transformData(data) { }
function saveData(data) { }
```

## 📈 Continuous Improvement Process

### Weekly Review Template
```markdown
## Weekly Development Review - YYYY-MM-DD

### Completed Tasks
- [ ] Feature A implementation
- [ ] Bug B fix
- [ ] Performance improvement C

### Discovered Issues and Solutions
1. **Issue**: [Issue description]
   **Cause**: [Root cause]
   **Solution**: [Implemented solution]
   **Prevention**: [Future prevention measures]

### Learnings
- Technical discoveries
- Process improvements
- Team collaboration insights

### Next Week's Priorities
1. Most important task
2. Important task
3. Optional task if possible

### Metrics
- Code coverage: XX%
- Build time: XXs
- Bundle size: XXkB
```

## 🌟 Summary

The ZEAMI framework is a system that continuously improves development efficiency through accumulation and sharing of practical knowledge. The key points are:

1. **Keep it simple** - Don't create overly complex systems
2. **Essential solutions** - Address root causes, not symptoms
3. **Knowledge sharing** - Record error patterns and solutions
4. **Continuous improvement** - Accumulate small improvements

By following these principles, you can build a sustainable and efficient development environment.

---

*Version: 2.0.0*
*Last Updated: 2024-01-23*
*Created with ZEAMI Framework*