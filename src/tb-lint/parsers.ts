/**
 * Parsers for Tinybird files
 * Simple regex-based parsers to extract column names and aliases
 */

import { isCamelCase, isSnakeCase } from '../utils/caseUtils.js';

export interface LintIssue {
  file: string;
  line: number;
  column: string;
  issue: string;
  severity: 'error' | 'warning';
}

/**
 * Parse a .datasource file and check for snake_case column names
 */
export function parseDatasource(content: string, filename: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');

  let inSchemaSection = false;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const trimmed = line.trim();

    // Detect SCHEMA section
    if (trimmed.toUpperCase().startsWith('SCHEMA')) {
      inSchemaSection = true;
      continue;
    }

    // Exit schema section on ENGINE or empty line after schema
    if (inSchemaSection && (trimmed.toUpperCase().startsWith('ENGINE') || trimmed === '')) {
      if (trimmed.toUpperCase().startsWith('ENGINE')) {
        inSchemaSection = false;
      }
      continue;
    }

    // Parse column definitions in SCHEMA section
    if (inSchemaSection && trimmed.length > 0 && !trimmed.startsWith('#')) {
      // Match pattern: `column_name Type` or `column_name Type DEFAULT value`
      const columnMatch = trimmed.match(/^`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s+\w+/);

      if (columnMatch) {
        const columnName = columnMatch[1];

        // Check if column name is snake_case
        if (!isSnakeCase(columnName)) {
          issues.push({
            file: filename,
            line: lineNumber,
            column: columnName,
            issue: `Column name "${columnName}" should be in snake_case`,
            severity: 'error',
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Parse a .pipe file and check for:
 * 1. Column names in SELECT should be snake_case
 * 2. Aliases (AS xxx) should be camelCase when they appear to be API-facing
 */
export function parsePipe(content: string, filename: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split('\n');

  let lineNumber = 0;
  let inSqlBlock = false;

  for (const line of lines) {
    lineNumber++;
    const trimmed = line.trim();

    // Detect SQL blocks (between empty lines or starting with SELECT/WITH)
    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH')) {
      inSqlBlock = true;
    }

    if (!inSqlBlock) continue;

    // Look for SELECT ... AS ... patterns
    // This regex finds patterns like: column_name AS aliasName
    const asMatches = line.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);

    for (const match of asMatches) {
      const columnName = match[1];
      const aliasName = match[2];

      // Check if column name is snake_case
      if (!isSnakeCase(columnName) && !columnName.includes('(')) {
        // Ignore function calls
        issues.push({
          file: filename,
          line: lineNumber,
          column: columnName,
          issue: `Column "${columnName}" should be in snake_case`,
          severity: 'error',
        });
      }

      // Check if alias is camelCase (for API-facing output)
      if (!isCamelCase(aliasName)) {
        issues.push({
          file: filename,
          line: lineNumber,
          column: aliasName,
          issue: `Alias "${aliasName}" should be in camelCase for API output`,
          severity: 'error',
        });
      }
    }

    // Also check for snake_case aliases (common mistake)
    const snakeCaseAliasMatch = line.match(/AS\s+([a-z_]+[_][a-z_]+)/i);
    if (snakeCaseAliasMatch) {
      const aliasName = snakeCaseAliasMatch[1];
      if (isSnakeCase(aliasName)) {
        issues.push({
          file: filename,
          line: lineNumber,
          column: aliasName,
          issue: `Alias "${aliasName}" is snake_case but should be camelCase for API output`,
          severity: 'error',
        });
      }
    }
  }

  return issues;
}

/**
 * Parse a .incl file
 * These are typically SQL fragments, so we apply similar rules as .pipe files
 */
export function parseIncl(content: string, filename: string): LintIssue[] {
  // Reuse pipe parser logic for .incl files
  return parsePipe(content, filename);
}
