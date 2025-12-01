# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added

- Initial release of tb-lint
- Oxlint plugin with two rules:
  - `tinybird-case/camel-case-json-keys` - Enforces camelCase for JSON object keys
  - `tinybird-case/camel-snake-mapping` - Enforces correct camelCase → snake_case mappings
- Tinybird file linter CLI for checking `.datasource`, `.pipe`, and `.incl` files
- Core case conversion utilities:
  - `isCamelCase()` - Validate camelCase strings
  - `isSnakeCase()` - Validate snake_case strings
  - `camelToSnake()` - Convert camelCase to snake_case
  - `snakeToCamel()` - Convert snake_case to camelCase
  - `validateMapping()` - Validate camelCase ↔ snake_case mappings
- Comprehensive test suite with >90% coverage
- Example files demonstrating valid and invalid patterns
- GitHub Actions CI/CD workflow
- Full documentation including:
  - README with usage examples
  - Contributing guidelines
  - MIT License

### Features

- Parse and validate Tinybird datasource column names
- Parse and validate Tinybird pipe SQL with AS aliases
- CLI tool with verbose mode and flexible path targeting
- Colorized terminal output for better readability
- Programmatic API for integration into build tools

## [Unreleased]

### Planned

- Auto-fix capability for common violations
- Configuration file support for custom rules
- VS Code extension for real-time linting
- Support for additional file formats
- Performance optimizations for large codebases
