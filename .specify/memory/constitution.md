<!--
SYNC IMPACT REPORT
==================
Version change: [Initial] → 1.0.0
Principles defined:
  - I. Test-First Development (TDD) - NON-NEGOTIABLE
  - II. CLI-First Interface
  - III. Data Persistence & Integrity
  - IV. User Experience Excellence
  - V. Code Quality & Maintainability
  - VI. Simple & Incremental

Added sections:
  - Core Principles (6 principles)
  - Technology Stack Standards
  - Development Workflow
  - Governance

Templates requiring updates:
  ✅ .specify/templates/plan-template.md - reviewed, aligns with TDD and single-project structure
  ✅ .specify/templates/spec-template.md - reviewed, aligns with user story priority approach
  ✅ .specify/templates/tasks-template.md - reviewed, aligns with TDD test-first workflow

Follow-up TODOs: None
-->

# DoIt Todo Application Constitution

## Core Principles

### I. Test-First Development (TDD) - NON-NEGOTIABLE

**TDD is mandatory for all implementation work:**

- Tests MUST be written BEFORE implementation code
- Tests MUST fail initially (Red phase)
- Implementation MUST make tests pass (Green phase)
- Code MUST be refactored after tests pass (Refactor phase)
- No feature code without corresponding tests
- User must approve test cases before implementation begins

**Rationale**: TDD ensures correctness, prevents regressions, creates living documentation, and enforces clear requirements before coding. For a todo application where data integrity is critical, TDD provides confidence that tasks are correctly created, updated, listed, and deleted.

### II. CLI-First Interface

**Every feature must be accessible via command-line interface:**

- All functionality exposed through Typer-based CLI commands
- Commands must follow standard CLI conventions (flags, arguments, subcommands)
- Human-readable output with rich formatting (colors, tables, status indicators)
- Support for both interactive and scriptable modes
- Stdin/stdout protocol for composability with other tools
- Errors and warnings go to stderr; data output to stdout

**Rationale**: CLI applications must be consistent, predictable, and scriptable. Typer provides excellent developer experience while ensuring professional CLI behavior. Rich formatting improves usability without sacrificing composability.

### III. Data Persistence & Integrity

**Task data must be reliably stored and retrievable:**

- JSON file-based storage for simplicity and portability
- Atomic writes to prevent data corruption
- Data validation on all mutations (create, update, delete)
- Unique task IDs for unambiguous operations
- Schema versioning for future migrations
- Backup mechanism before destructive operations

**Rationale**: Users trust todo applications with important task data. Data loss or corruption is unacceptable. File-based JSON storage balances simplicity with reliability, avoiding database dependencies while maintaining data integrity.

### IV. User Experience Excellence

**The application must be delightful and intuitive to use:**

- Clear, actionable feedback for every operation
- Visual status indicators (✓ complete, ○ incomplete)
- Color-coded output for different task states
- Sensible defaults to minimize required input
- Helpful error messages with suggestions
- Consistent command naming and argument patterns

**Rationale**: A todo application is used daily. Poor UX leads to abandonment. Typer and Rich enable professional terminal interfaces that feel polished and modern, matching user expectations from quality CLI tools.

### V. Code Quality & Maintainability

**Code must be clean, well-structured, and maintainable:**

- Type hints required for all functions (Python 3.13+ features encouraged)
- Modular architecture: models, storage, CLI, services
- Single Responsibility Principle for all classes/functions
- Comprehensive docstrings for public APIs
- Linting (ruff) and formatting (ruff format) enforced
- Test coverage minimum: 90% for core logic

**Rationale**: Small applications become large over time. Poor structure early makes future features expensive. Type hints catch errors before runtime. Modular design enables testing and reuse.

### VI. Simple & Incremental

**Start with the simplest solution that works:**

- YAGNI: Don't add features speculatively
- Implement complete vertical slices (end-to-end features)
- Prefer composition over inheritance
- Avoid premature abstraction
- No external database until file storage proves insufficient
- No authentication/multi-user until single-user is proven

**Rationale**: Over-engineering wastes time and creates maintenance burden. Build incrementally, validating each feature before adding the next. File-based JSON storage is sufficient for personal todo lists; don't add PostgreSQL on day one.

## Technology Stack Standards

**Language**: Python 3.13+ (leveraging latest type system improvements)

**Package Management**: UV (fast, reliable Python package installer and resolver)

**CLI Framework**: Typer (modern, type-hint-based CLI builder)

**Console Formatting**: Rich (beautiful terminal output, tables, colors)

**Testing Framework**: pytest (standard Python testing tool)

**Test Coverage**: pytest-cov (measure and enforce coverage)

**Code Quality**:
- **Linting**: ruff (fast, comprehensive Python linter)
- **Formatting**: ruff format (opinionated code formatter)
- **Type Checking**: mypy (static type analysis)

**Storage Format**: JSON (human-readable, version-controllable, no external dependencies)

**Project Structure**:
```
src/
  doit/
    models/      # Task data models
    storage/     # File I/O and persistence
    cli/         # Typer command definitions
    services/    # Business logic

tests/
  unit/          # Unit tests (isolated logic)
  integration/   # Integration tests (CLI + storage)
```

**Rationale**: This stack balances modern Python capabilities (3.13 type system), developer productivity (UV, Typer, Rich), code quality (ruff, mypy, pytest), and simplicity (JSON storage, no external services).

## Development Workflow

### 1. Feature Specification
- Create feature spec in `specs/<feature>/spec.md`
- Define user stories with acceptance criteria
- Prioritize stories (P1 = MVP, P2+ = enhancements)
- Get user approval before planning

### 2. Planning
- Create implementation plan in `specs/<feature>/plan.md`
- Document technical approach and architecture
- Identify affected modules and data models
- Get user approval before task breakdown

### 3. Task Breakdown
- Generate task list in `specs/<feature>/tasks.md`
- Organize by user story for independent delivery
- Mark parallel tasks with [P]
- Include test tasks BEFORE implementation tasks

### 4. TDD Implementation Cycle

**For EVERY task:**

a) **Red Phase**:
   - Write test(s) that verify the desired behavior
   - Run tests → MUST fail (no implementation yet)
   - User approves test cases

b) **Green Phase**:
   - Write minimal code to make tests pass
   - Run tests → MUST pass
   - No refactoring yet, just pass the tests

c) **Refactor Phase**:
   - Improve code structure, naming, clarity
   - Run tests → MUST still pass
   - Commit when tests green and code clean

**Testing Requirements**:
- Unit tests for models, storage, services
- Integration tests for CLI commands (invoke via Typer's test utilities)
- Use pytest fixtures for test data and temporary files
- Mock file I/O where appropriate, but also test real file operations

### 5. Quality Gates

**Before committing**:
- [ ] All tests pass (pytest)
- [ ] Linting passes (ruff check)
- [ ] Formatting applied (ruff format)
- [ ] Type checking passes (mypy)
- [ ] Test coverage ≥90% for modified code

**Before PR**:
- [ ] Feature tested end-to-end manually
- [ ] All acceptance criteria met
- [ ] Documentation updated
- [ ] No commented-out code or TODOs

### 6. Git Workflow
- Feature branches: `###-feature-name` format
- Atomic commits: one logical change per commit
- Descriptive commit messages
- PR to main after quality gates pass

## Governance

### Amendment Process

This constitution supersedes all other development practices. To amend:

1. Propose change with rationale
2. Document impact on existing code/tests
3. Get user approval
4. Update constitution with version bump:
   - **MAJOR**: Incompatible changes (remove/redefine principles)
   - **MINOR**: New principles or expanded guidance
   - **PATCH**: Clarifications, typos, wording

### Compliance

- All PRs MUST verify compliance with constitution principles
- Violations MUST be justified in `plan.md` Complexity Tracking section
- Automated checks enforce quality gates (tests, linting, formatting)

### Versioning Policy

- Constitution version controls governance evolution
- Breaking changes to principles require MAJOR bump
- New principles or standards require MINOR bump
- Clarifications and fixes require PATCH bump

### Enforcement

- Claude Code agents must reference this constitution when planning and implementing
- `/sp.plan` command verifies Constitution Check before proceeding
- Quality gates automated via pre-commit hooks or CI

---

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02
