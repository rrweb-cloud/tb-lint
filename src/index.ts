/**
 * @rrwebcloud/tb-lint
 *
 * Linting tools to enforce consistent naming conventions
 * between Tinybird (snake_case) and API code (camelCase)
 */

export {
  isCamelCase,
  isSnakeCase,
  camelToSnake,
  snakeToCamel,
  validateMapping,
} from './utils/caseUtils.js';

export {
  parseDatasource,
  parsePipe,
  parseIncl,
  type LintIssue,
} from './tb-lint/parsers.js';

export { lintTinybirdFiles } from './tb-lint/index.mjs';

// Re-export the Oxlint plugin
export { default as tinybirdCasePlugin } from './oxlint/tinybird-case-plugin.mjs';
