# Contributing to tb-lint

Thank you for your interest in contributing to tb-lint! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/tb-lint.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

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

# Run with coverage
npm test -- --coverage
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
# Lint TypeScript/JavaScript files
npm run lint

# Lint Tinybird example files
npm run tb-lint
```

## Project Structure

- `src/utils/` - Core utility functions for case conversion
- `src/oxlint/` - Oxlint plugin implementation
- `src/tb-lint/` - Tinybird file linter CLI and parsers
- `test/` - Test files mirroring the src structure
- `examples/` - Example files demonstrating valid and invalid patterns

## Adding New Features

### Adding a New Oxlint Rule

1. Add the rule implementation to `src/oxlint/tinybird-case-plugin.mts`
2. Export the rule in the plugin's `rules` object
3. Add tests for the rule
4. Document the rule in the README
5. Add example files in `examples/`

### Adding New Parsers

1. Add parser logic to `src/tb-lint/parsers.ts`
2. Add comprehensive tests in `test/tb-lint/parsers.test.ts`
3. Update CLI if needed in `src/tb-lint/index.mts`
4. Document the new functionality in README

## Testing Guidelines

- Write tests for all new features
- Ensure tests cover both valid and invalid cases
- Include edge cases in your tests
- Aim for high test coverage (>80%)

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('specific functionality', () => {
    it('should handle valid input', () => {
      // Test implementation
    });

    it('should reject invalid input', () => {
      // Test implementation
    });

    it('should handle edge cases', () => {
      // Test implementation
    });
  });
});
```

## Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Write clear, descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

## Commit Messages

Follow the conventional commits specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test changes
- `refactor:` for code refactoring
- `chore:` for maintenance tasks

Examples:
```
feat: add support for nested object validation
fix: handle consecutive underscores in snake_case
docs: update installation instructions
test: add edge cases for camelToSnake
```

## Pull Request Process

1. Update documentation for any user-facing changes
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Ensure type checking passes: `npm run typecheck`
5. Update the README if adding new features
6. Create a pull request with a clear description of changes

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests pass
- [ ] Type checking passes
```

## Reporting Bugs

When reporting bugs, please include:

1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details (Node version, OS, etc.)
6. Example code demonstrating the issue

## Feature Requests

Feature requests are welcome! Please provide:

1. Clear description of the feature
2. Use case / motivation
3. Example of how it would work
4. Any relevant examples from other tools

## Questions?

If you have questions about contributing, please:

1. Check existing issues and discussions
2. Review the README documentation
3. Open a new issue with the "question" label

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a positive community environment

## License

By contributing to tb-lint, you agree that your contributions will be licensed under the MIT License.
