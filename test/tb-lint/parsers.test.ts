import { describe, it, expect } from 'vitest';
import { parseDatasource, parsePipe, parseIncl } from '../../src/tb-lint/parsers';

describe('Tinybird File Parsers', () => {
  describe('parseDatasource', () => {
    it('should accept valid snake_case column names', () => {
      const content = `
SCHEMA >
    user_id String,
    session_id String,
    created_at DateTime,
    event_name String

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      expect(issues).toHaveLength(0);
    });

    it('should report camelCase column names as errors', () => {
      const content = `
SCHEMA >
    userId String,
    session_id String,
    createdAt DateTime

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      expect(issues.length).toBeGreaterThan(0);

      const userIdIssue = issues.find((i) => i.column === 'userId');
      expect(userIdIssue).toBeDefined();
      expect(userIdIssue?.issue).toContain('snake_case');

      const createdAtIssue = issues.find((i) => i.column === 'createdAt');
      expect(createdAtIssue).toBeDefined();
    });

    it('should report PascalCase column names as errors', () => {
      const content = `
SCHEMA >
    UserId String,
    SessionId String

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      expect(issues.length).toBe(2);
    });

    it('should handle columns with backticks', () => {
      const content = `
SCHEMA >
    \`user_id\` String,
    \`session_id\` String

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      expect(issues).toHaveLength(0);
    });

    it('should handle columns with DEFAULT values', () => {
      const content = `
SCHEMA >
    user_id String,
    created_at DateTime DEFAULT now(),
    is_active Boolean DEFAULT true

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      expect(issues).toHaveLength(0);
    });

    it('should ignore comments', () => {
      const content = `
SCHEMA >
    user_id String,
    # This is a comment about userId (camelCase in comment is OK)
    session_id String

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      expect(issues).toHaveLength(0);
    });
  });

  describe('parsePipe', () => {
    it('should accept valid snake_case columns with camelCase aliases', () => {
      const content = `
SELECT
    user_id AS userId,
    session_id AS sessionId,
    created_at AS createdAt
FROM events
      `.trim();

      const issues = parsePipe(content, 'test.pipe');
      expect(issues).toHaveLength(0);
    });

    it('should report camelCase column names as errors', () => {
      const content = `
SELECT
    userId AS userId,
    sessionId AS sessionId
FROM events
      `.trim();

      const issues = parsePipe(content, 'test.pipe');
      expect(issues.length).toBeGreaterThan(0);

      const userIdIssue = issues.find((i) => i.column === 'userId' && i.issue.includes('Column'));
      expect(userIdIssue).toBeDefined();
    });

    it('should report snake_case aliases as errors', () => {
      const content = `
SELECT
    user_id AS user_id,
    session_id AS session_id
FROM events
      `.trim();

      const issues = parsePipe(content, 'test.pipe');
      expect(issues.length).toBeGreaterThan(0);

      const aliasIssue = issues.find((i) => i.issue.includes('Alias'));
      expect(aliasIssue).toBeDefined();
    });

    it('should handle complex SELECT statements', () => {
      const content = `
SELECT
    user_id AS userId,
    COUNT(*) AS count,
    MAX(created_at) AS lastSeen
FROM events
WHERE user_id IS NOT NULL
GROUP BY user_id
      `.trim();

      const issues = parsePipe(content, 'test.pipe');
      // COUNT(*) and MAX(created_at) should be ignored as they're functions
      expect(issues).toHaveLength(0);
    });

    it('should handle WITH clauses', () => {
      const content = `
WITH user_sessions AS (
    SELECT
        user_id AS userId,
        session_id AS sessionId
    FROM sessions
)
SELECT
    userId,
    sessionId
FROM user_sessions
      `.trim();

      const issues = parsePipe(content, 'test.pipe');
      expect(issues).toHaveLength(0);
    });

    it('should report mixed case violations', () => {
      const content = `
SELECT
    user_id AS user_id,
    UserId AS UserId,
    sessionId AS session_id
FROM events
      `.trim();

      const issues = parsePipe(content, 'test.pipe');
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe('parseIncl', () => {
    it('should apply same rules as pipe files', () => {
      const content = `
SELECT
    user_id AS userId,
    session_id AS sessionId
FROM events
      `.trim();

      const issues = parseIncl(content, 'test.incl');
      expect(issues).toHaveLength(0);
    });

    it('should report errors like pipe files', () => {
      const content = `
SELECT
    userId AS userId
FROM events
      `.trim();

      const issues = parseIncl(content, 'test.incl');
      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty files', () => {
      expect(parseDatasource('', 'test.datasource')).toHaveLength(0);
      expect(parsePipe('', 'test.pipe')).toHaveLength(0);
      expect(parseIncl('', 'test.incl')).toHaveLength(0);
    });

    it('should handle files with only comments', () => {
      const content = `
# This is a comment
# Another comment
      `.trim();

      expect(parseDatasource(content, 'test.datasource')).toHaveLength(0);
      expect(parsePipe(content, 'test.pipe')).toHaveLength(0);
    });

    it('should provide correct line numbers', () => {
      const content = `
SCHEMA >
    user_id String,
    userId String,
    session_id String

ENGINE MergeTree
      `.trim();

      const issues = parseDatasource(content, 'test.datasource');
      const userIdIssue = issues.find((i) => i.column === 'userId');
      expect(userIdIssue?.line).toBe(3);
    });
  });
});
