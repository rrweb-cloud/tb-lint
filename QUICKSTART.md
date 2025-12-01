# Quick Start Guide

Get up and running with tb-lint in 5 minutes!

## Installation

```bash
npm install --save-dev @tinybird/tb-lint
```

## Basic Setup

### 1. Configure Oxlint

Create `.oxlintrc.json` in your project root:

```json
{
  "jsPlugins": ["./node_modules/@tinybird/tb-lint/dist/oxlint/tinybird-case-plugin.mjs"],
  "rules": {
    "tinybird-case/camel-case-json-keys": "error",
    "tinybird-case/camel-snake-mapping": "error"
  }
}
```

### 2. Add npm Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "lint": "oxlint --config .oxlintrc.json",
    "tb-lint": "tb-lint ./tinybird",
    "lint:all": "npm run lint && npm run tb-lint"
  }
}
```

### 3. Run the Linters

```bash
# Lint TypeScript/JavaScript files
npm run lint

# Lint Tinybird files
npm run tb-lint

# Lint everything
npm run lint:all
```

## Your First Fix

### Before (Invalid)

**TypeScript:**
```typescript
const user = {
  user_id: "123",        // ❌ Should be camelCase
  session_id: "abc",     // ❌ Should be camelCase
};

const TB_FIELDS = {
  user_id: "user_id",    // ❌ Key should be camelCase
};
```

**Tinybird .datasource:**
```
SCHEMA >
    userId String,       -- ❌ Should be snake_case
    SessionId String     -- ❌ Should be snake_case
```

**Tinybird .pipe:**
```sql
SELECT
    userId AS userId,           -- ❌ Column should be snake_case
    session_id AS session_id    -- ❌ Alias should be camelCase
FROM events
```

### After (Valid)

**TypeScript:**
```typescript
const user = {
  userId: "123",         // ✅ camelCase
  sessionId: "abc",      // ✅ camelCase
};

const TB_FIELDS = {
  userId: "user_id",     // ✅ Correct mapping
  sessionId: "session_id", // ✅ Correct mapping
};
```

**Tinybird .datasource:**
```
SCHEMA >
    user_id String,      -- ✅ snake_case
    session_id String    -- ✅ snake_case
```

**Tinybird .pipe:**
```sql
SELECT
    user_id AS userId,          -- ✅ Column: snake_case, Alias: camelCase
    session_id AS sessionId     -- ✅ Column: snake_case, Alias: camelCase
FROM events
```

## Common Patterns

### API Request/Response Types

```typescript
// ✅ Use camelCase for API-facing types
interface UserEvent {
  userId: string;
  eventName: string;
  timestamp: string;
}
```

### Tinybird Field Mappings

```typescript
// ✅ Map camelCase API fields to snake_case Tinybird columns
const TB_USER_FIELDS = {
  userId: "user_id",
  eventName: "event_name",
  timestamp: "timestamp",
};
```

### Data Transformation

```typescript
// ✅ Transform API data to Tinybird format
function transformToTinybird(apiData: UserEvent) {
  return {
    [TB_USER_FIELDS.userId]: apiData.userId,
    [TB_USER_FIELDS.eventName]: apiData.eventName,
    [TB_USER_FIELDS.timestamp]: apiData.timestamp,
  };
}
```

### Tinybird Queries

```sql
-- ✅ Always use snake_case columns with camelCase aliases
SELECT
    user_id AS userId,
    event_name AS eventName,
    created_at AS createdAt,
    COUNT(*) AS count
FROM events
GROUP BY user_id, event_name, created_at
```

## Integration with CI

Add to your CI pipeline (GitHub Actions example):

```yaml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint:all
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out [examples/](examples/) for more examples
- Review [CONTRIBUTING.md](CONTRIBUTING.md) if you want to contribute
- See [CHANGELOG.md](CHANGELOG.md) for version history

## Troubleshooting

### Oxlint not finding the plugin

Make sure the path in `.oxlintrc.json` is correct:
```json
{
  "jsPlugins": ["./node_modules/@tinybird/tb-lint/dist/oxlint/tinybird-case-plugin.mjs"]
}
```

### tb-lint command not found

Run with npx:
```bash
npx tb-lint ./tinybird
```

Or install globally:
```bash
npm install -g @tinybird/tb-lint
```

### False positives

Use inline comments to disable rules:
```typescript
// oxlint-disable-next-line tinybird-case/camel-case-json-keys
const externalApi = { legacy_field: value };
```

## Get Help

- Open an issue on GitHub
- Check existing issues for solutions
- Read the full documentation

Happy linting! 🎉
