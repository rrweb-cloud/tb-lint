#!/usr/bin/env node

/**
 * Tinybird File Linter CLI
 *
 * Scans Tinybird project files (.datasource, .pipe, .incl) and checks for
 * naming convention violations.
 */

import { readFile } from 'fs/promises';
import { glob } from 'glob';
import { relative } from 'path';
import { parseDatasource, parsePipe, parseIncl, LintIssue } from './parsers.js';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

interface LintOptions {
  path?: string;
  verbose?: boolean;
}

async function lintTinybirdFiles(options: LintOptions = {}): Promise<number> {
  const searchPath = options.path || process.cwd();
  const verbose = options.verbose || false;

  console.log(`${colors.cyan}Tinybird File Linter${colors.reset}`);
  console.log(`${colors.dim}Scanning: ${searchPath}${colors.reset}\n`);

  // Find all Tinybird files
  const datasourceFiles = await glob('**/*.datasource', { cwd: searchPath, absolute: true });
  const pipeFiles = await glob('**/*.pipe', { cwd: searchPath, absolute: true });
  const inclFiles = await glob('**/*.incl', { cwd: searchPath, absolute: true });

  const allFiles = [...datasourceFiles, ...pipeFiles, ...inclFiles];

  if (allFiles.length === 0) {
    console.log(`${colors.yellow}⚠ No Tinybird files found${colors.reset}`);
    return 0;
  }

  console.log(`Found ${allFiles.length} Tinybird files to check\n`);

  const allIssues: LintIssue[] = [];

  // Process each file
  for (const file of allFiles) {
    const content = await readFile(file, 'utf-8');
    const relativePath = relative(searchPath, file);

    let issues: LintIssue[] = [];

    if (file.endsWith('.datasource')) {
      issues = parseDatasource(content, relativePath);
    } else if (file.endsWith('.pipe')) {
      issues = parsePipe(content, relativePath);
    } else if (file.endsWith('.incl')) {
      issues = parseIncl(content, relativePath);
    }

    if (issues.length > 0 || verbose) {
      if (issues.length > 0) {
        console.log(`${colors.red}✗${colors.reset} ${relativePath}`);
        for (const issue of issues) {
          const severity = issue.severity === 'error' ? colors.red : colors.yellow;
          console.log(`  ${severity}${issue.severity}${colors.reset} [line ${issue.line}] ${issue.issue}`);
        }
        console.log();
      } else if (verbose) {
        console.log(`${colors.green}✓${colors.reset} ${relativePath}`);
      }
    }

    allIssues.push(...issues);
  }

  // Summary
  console.log(`${colors.cyan}Summary${colors.reset}`);
  console.log(`Files checked: ${allFiles.length}`);
  console.log(`Issues found: ${allIssues.length}`);

  if (allIssues.length === 0) {
    console.log(`\n${colors.green}✓ All checks passed!${colors.reset}`);
    return 0;
  } else {
    console.log(`\n${colors.red}✗ Linting failed with ${allIssues.length} issue(s)${colors.reset}`);
    return 1;
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const options: LintOptions = {};

  // Simple argument parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Tinybird File Linter

Usage: tb-lint [options] [path]

Options:
  -v, --verbose    Show all files checked, not just files with issues
  -h, --help       Show this help message

Examples:
  tb-lint                    # Lint current directory
  tb-lint ./tinybird         # Lint specific directory
  tb-lint -v                 # Verbose output
      `);
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      options.path = arg;
    }
  }

  try {
    const exitCode = await lintTinybirdFiles(options);
    process.exit(exitCode);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { lintTinybirdFiles };
