# tb-lint

**Linting tools to enforce consistent naming conventions between Tinybird (snake_case) and API code (camelCase)**

## Problem Statement

When working with Tinybird, you face a common challenge:

- **Tinybird** stores data internally using **snake_case** columns (`user_id`, `session_id`, `created_at`)
- **APIs** typically use **camelCase** for JSON fields (`userId`, `sessionId`, `createdAt`)
- Your codebase likely has a **messy mix** of both conventions

While Tinybird can handle the conversion automatically (ingesting camelCase JSON and storing as snake_case), maintaining consistency across your codebase is challenging without proper tooling.

**tb-lint** solves this problem by providing:

1. 🔍 **Oxlint plugin** for enforcing naming conventions in TypeScript/JavaScript code
2. 📋 **Tinybird file linter** for checking `.datasource`, `.pipe`, and `.incl` files
3. ✅ **CI integration** to prevent naming convention violations from entering your codebase

## Features

### Naming Convention Enforcement

| Context | Convention | Examples |
|---------|-----------|----------|
| **API / JSON Keys** | camelCase | ✅ `userId`, `sessionId`, `createdAt`<br>❌ `user_id`, `UserId` |
| **Tinybird Columns** | snake_case | ✅ `user_id`, `session_id`, `created_at`<br>❌ `userId`, `UserId` |
| **Mapping Objects** | camelCase → snake_case | ✅ `{ userId: "user_id" }`<br>❌ `{ user_id: "user_id" }` |

### Oxlint Plugin Rules

#### 1. `tinybird-case/camel-case-json-keys`

Enforces camelCase naming for object keys in JavaScript/TypeScript code.

**Valid:**
```typescript
const user = {
  userId: "123",
  sessionId: "abc",
  createdAt: new Date(),
};
```

**Invalid:**
```typescript
const user = {
  user_id: "123",      // ❌ Should be userId
  SessionId: "abc",    // ❌ Should be sessionId
  created_at: new Date(), // ❌ Should be createdAt
};
```

#### 2. `tinybird-case/camel-snake-mapping`

Enforces correct mapping between camelCase keys and snake_case values in mapping objects.

**Valid:**
```typescript
const TB_USER_FIELDS = {
  userId: "user_id",        // ✅ Correct mapping
  sessionId: "session_id",  // ✅ Correct mapping
  createdAt: "created_at",  // ✅ Correct mapping
};
```

**Invalid:**
```typescript
const TB_USER_FIELDS = {
  user_id: "user_id",       // ❌ Key should be camelCase
  userId: "userId",         // ❌ Value should be snake_case
  userId: "uid",            // ❌ Incorrect mapping (should be "user_id")
};
```

### Tinybird File Linter

The CLI tool checks Tinybird project files for naming violations:

**`.datasource` files:**
- ✅ All column names must be snake_case
- ❌ Reports camelCase or PascalCase column names

**`.pipe` files:**
- ✅ Column references must be snake_case
- ✅ Aliases (AS xxx) must be camelCase for API-facing output
- ❌ Reports snake_case aliases or camelCase columns

**Example valid `.pipe` file:**
```sql
SELECT
    user_id AS userId,
    session_id AS sessionId,
    COUNT(*) AS eventCount
FROM events
GROUP BY user_id, session_id
```

**Example invalid `.pipe` file:**
```sql
SELECT
    userId AS userId,           -- ❌ Column should be snake_case
    session_id AS session_id,   -- ❌ Alias should be camelCase
FROM events
```

## Installation

```bash
npm install --save-dev @tinybird/tb-lint
```

## Usage

### Oxlint Integration

1. Create or update `.oxlintrc.json` in your project root:

```json
{
  "jsPlugins": ["./node_modules/@tinybird/tb-lint/dist/oxlint/tinybird-case-plugin.mjs"],
  "rules": {
    "tinybird-case/camel-case-json-keys": "error",
    "tinybird-case/camel-snake-mapping": "error"
  }
}
```

2. Add a lint script to your `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint --config .oxlintrc.json"
  }
}
```

3. Run the linter:

```bash
npm run lint
```

### Tinybird File Linter

Lint your Tinybird project files:

```bash
# Lint current directory
npx tb-lint

# Lint specific directory
npx tb-lint ./tinybird

# Verbose output (show all checked files)
npx tb-lint -v
```

**CLI Options:**
- `-v, --verbose` - Show all files checked, not just files with issues
- `-h, --help` - Show help message

### Programmatic Usage

```typescript
import { lintTinybirdFiles } from '@tinybird/tb-lint/tb-lint';

const exitCode = await lintTinybirdFiles({
  path: './tinybird',
  verbose: true,
});

if (exitCode !== 0) {
  console.error('Linting failed!');
}
```

## CI Integration

### GitHub Actions

Create `.github/workflows/lint.yml`:

```yaml
name: Lint

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript linter
        run: npm run lint

      - name: Run Tinybird file linter
        run: npx tb-lint ./tinybird

      - name: Run tests
        run: npm test
```

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
lint:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run lint
    - npx tb-lint ./tinybird
    - npm test
```

## Development

### Project Structure

```
tb-lint/
├── src/
│   ├── utils/
│   │   └── caseUtils.ts          # Case conversion utilities
│   ├── oxlint/
│   │   └── tinybird-case-plugin.mts  # Oxlint plugin
│   └── tb-lint/
│       ├── index.mts             # CLI entry point
│       └── parsers.ts            # Tinybird file parsers
├── test/
│   ├── utils/
│   │   └── caseUtils.test.ts
│   └── tb-lint/
│       └── parsers.test.ts
├── examples/
│   ├── valid/                    # Valid examples
│   └── invalid/                  # Invalid examples
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── .oxlintrc.json
```

### Building

```bash
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck
```

### Running the Linters Locally

```bash
# Lint TypeScript/JavaScript files
npm run lint

# Lint Tinybird files
npm run tb-lint
```

## Examples

See the `examples/` directory for comprehensive examples:

- **`examples/valid/`** - Correctly formatted files
  - `events.datasource` - Valid datasource with snake_case columns
  - `user_events.pipe` - Valid pipe with proper aliases
  - `api-handler.ts` - Valid TypeScript with camelCase API objects

- **`examples/invalid/`** - Files with violations
  - `events_bad.datasource` - Datasource with naming violations
  - `user_events_bad.pipe` - Pipe with naming violations
  - `api-handler-bad.ts` - TypeScript with naming violations

## Rules Reference

### Case Conversion Rules

The following conversion rules are applied:

| camelCase | snake_case |
|-----------|------------|
| `userId` | `user_id` |
| `sessionId` | `session_id` |
| `createdAt` | `created_at` |
| `userIDToken` | `user_id_token` |
| `HTTPResponse` | `http_response` |

### Special Cases

- **Consecutive uppercase letters**: `userID` → `user_id`
- **Acronyms**: `HTTPResponse` → `http_response`
- **Numbers**: `user123Id` → `user123_id`

## Common Patterns

### Mapping Objects for Data Transformation

```typescript
// Define field mappings
const TB_USER_FIELDS = {
  userId: "user_id",
  sessionId: "session_id",
  createdAt: "created_at",
};

// Transform API data to Tinybird format
function toTinybirdFormat(apiData: any) {
  return {
    [TB_USER_FIELDS.userId]: apiData.userId,
    [TB_USER_FIELDS.sessionId]: apiData.sessionId,
    [TB_USER_FIELDS.createdAt]: apiData.createdAt,
  };
}
```

### Tinybird Pipe Projections

```sql
-- Always use snake_case columns with camelCase aliases
SELECT
    user_id AS userId,
    session_id AS sessionId,
    event_timestamp AS eventTimestamp,
    COUNT(*) AS eventCount
FROM events
GROUP BY user_id, session_id, event_timestamp
```

## Troubleshooting

### False Positives

If you have legitimate snake_case keys in your API code (e.g., interfacing with external APIs), you can:

1. Use a comment to disable the rule for specific lines:
```typescript
// oxlint-disable-next-line tinybird-case/camel-case-json-keys
const externalApi = {
  legacy_field: value
};
```

2. Configure exceptions in `.oxlintrc.json` (consult Oxlint documentation for details)

### Tinybird File Linter Limitations

The Tinybird file linter uses regex-based parsing and may miss complex SQL patterns. For best results:

- Keep SQL formatting consistent
- Use one column per line in datasources
- Avoid overly complex SQL in pipes (split into multiple nodes)

## Contributing

Contributions are welcome! Please:

1. Add tests for new features or bug fixes
2. Ensure all tests pass: `npm test`
3. Follow the existing code style
4. Update documentation as needed

## License

MIT

## Acknowledgments

Built for teams using Tinybird who want to maintain clean, consistent naming conventions across their data pipeline and API code.
