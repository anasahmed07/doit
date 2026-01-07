# Implementation Plan: Todo Console Application

**Branch**: `001-todo-cli-app` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-cli-app/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a command-line todo application that enables users to create, view, update, delete, and complete tasks through an intuitive CLI. Tasks are stored in-memory during the session, with simple CRUD operations and visual status indicators. The application prioritizes clean code architecture, test-first development, and excellent user experience through modern Python tooling (Typer, Rich).

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Typer (CLI framework), Rich (console formatting), pytest (testing)
**Storage**: In-memory (list/dict structures during session)
**Testing**: pytest with pytest-cov for coverage, Typer test utilities for CLI integration tests
**Target Platform**: Cross-platform CLI (Windows, Linux, macOS) - Python 3.13+ required
**Project Type**: Single project (CLI application)
**Performance Goals**: <2 seconds to display task list, <10 seconds for any operation, handles 1,000+ tasks without degradation
**Constraints**: In-memory only (no persistence), single-user, no external services, operates within single terminal session
**Scale/Scope**: Personal task management, ~5 core commands, ~4 user stories, foundational architecture for future file-based persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Test-First Development (TDD) - NON-NEGOTIABLE

**Status**: ✅ PASS - Plan enforces TDD workflow

- **Requirement**: Tests MUST be written BEFORE implementation code
- **Plan Compliance**: Phase 2 task breakdown will organize tasks with test tasks preceding implementation tasks
- **Verification**: tasks.md structure will include RED/GREEN/REFACTOR phases explicitly

### Principle II: CLI-First Interface

**Status**: ✅ PASS - All functionality exposed via Typer commands

- **Requirement**: All functionality accessible via CLI
- **Plan Compliance**:
  - Five Typer commands planned: `add`, `list`, `update`, `delete`, `complete`
  - Rich formatting for status indicators and tables
  - Stderr for errors, stdout for data
  - Follows standard CLI conventions (--help, flags, arguments)

### Principle III: Data Persistence & Integrity

**Status**: ⚠️ MODIFIED FOR PHASE 1 - In-memory only per spec

- **Requirement**: Reliable storage and retrieval (JSON file-based)
- **Current Phase**: In-memory storage (dict/list) per spec requirements
- **Justification**: Spec explicitly states "in-memory storage acceptable" and "no database dependencies"
- **Future Path**: Architecture designed to easily swap in file-based persistence layer later
- **Validation**: Data model includes unique IDs and validation rules ready for persistence

### Principle IV: User Experience Excellence

**Status**: ✅ PASS - Rich CLI experience planned

- **Requirement**: Delightful, intuitive interface
- **Plan Compliance**:
  - Rich library for visual indicators (✓/○ symbols)
  - Color-coded task states
  - Clear confirmation messages (FR-010)
  - Helpful error messages with suggestions (FR-008)
  - Consistent command patterns

### Principle V: Code Quality & Maintainability

**Status**: ✅ PASS - Modern Python architecture

- **Requirement**: Clean, well-structured, maintainable code
- **Plan Compliance**:
  - Type hints required (Python 3.13+ features)
  - Modular architecture: models, storage, cli, services
  - Ruff for linting and formatting
  - Mypy for type checking
  - Test coverage ≥90% target
  - Comprehensive docstrings

### Principle VI: Simple & Incremental

**Status**: ✅ PASS - YAGNI applied

- **Requirement**: Simplest solution that works
- **Plan Compliance**:
  - In-memory storage (no premature file/DB)
  - Single-user only (no multi-user complexity)
  - No authentication/authorization
  - Complete vertical slices (P1 → P2 → P3)
  - Direct data structures (no ORM, no repository pattern initially)

**Overall Constitution Status**: ✅ PASS with one justified modification (Principle III - in-memory phase)

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-cli-app/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (Task entity design)
├── quickstart.md        # Phase 1 output (developer setup guide)
├── contracts/           # Phase 1 output (CLI command signatures)
│   └── cli-commands.md  # Typer command specifications
├── checklists/          # Quality checklists
│   └── requirements.md  # Specification quality validation (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── doit/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py           # Task data model with validation
│   ├── storage/
│   │   ├── __init__.py
│   │   └── memory.py         # In-memory storage implementation
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py   # Business logic (CRUD operations)
│   └── cli/
│       ├── __init__.py
│       ├── main.py           # Typer app entry point
│       └── commands.py       # Command implementations

tests/
├── unit/
│   ├── test_task_model.py    # Task model validation tests
│   ├── test_memory_storage.py  # Storage layer tests
│   └── test_task_service.py  # Service logic tests
└── integration/
    └── test_cli_commands.py  # End-to-end CLI tests

pyproject.toml                # UV project configuration
README.md                     # Project overview
```

**Structure Decision**: Single project structure selected per constitution default. This is a standalone CLI application with no web/mobile components, fitting the "single project" pattern. Modular organization (models → storage → services → cli) enables clean separation of concerns and easy testing. Future persistence layer can be added by implementing new storage backend without changing service or CLI layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle III: In-memory instead of file persistence | Spec explicitly requires in-memory storage for Phase 1; this is an educational/prototyping application | File-based JSON storage would violate spec requirement "in-memory storage acceptable" and "no database dependencies"; architecture designed to add persistence later without refactoring |

**Justification Details**: The constitution mandates file-based JSON storage for data integrity, but the feature specification explicitly states "Tasks do not need to persist between application sessions (in-memory storage is acceptable)" and lists "Persistent storage (database, file system)" in the Out of Scope section. This is intentional for learning purposes and rapid prototyping. The architecture uses a storage abstraction layer (storage/memory.py) that can be swapped for storage/file.py in a future feature without changing business logic or CLI code.

---

## Post-Design Constitution Re-Evaluation

*Completed after Phase 1 (data-model.md, contracts, quickstart.md)*

### Architecture Alignment Review

**Data Model (data-model.md)**:
- ✅ **TDD Support**: Model includes comprehensive validation rules testable in unit tests
- ✅ **Type Safety**: Full type hints with Python 3.13+ features (`Task` dataclass, `TaskID` type alias)
- ✅ **Simplicity**: Single entity (Task) with 5 fields, no over-engineering
- ✅ **Future-Ready**: Storage Protocol allows backend swapping without refactoring

**CLI Contracts (contracts/cli-commands.md)**:
- ✅ **CLI-First**: All 6 commands (add, list, update, delete, complete, uncomplete) fully specified
- ✅ **UX Excellence**: Rich formatting, color-coded output, helpful error messages with suggestions
- ✅ **Testability**: Each command has defined success/error scenarios for integration tests
- ✅ **Accessibility**: Symbols + color + ASCII fallbacks for inclusive design

**Development Setup (quickstart.md)**:
- ✅ **Quality Gates**: Pre-commit hooks enforce tests, linting, formatting, type checking
- ✅ **TDD Workflow**: Explicit Red-Green-Refactor cycle documented with examples
- ✅ **Tool Integration**: UV, Ruff, Mypy, pytest configured per constitution standards

### Risk Assessment

**Identified Risks**:

1. **Risk**: In-memory storage loses all data on app close
   - **Mitigation**: Documented in spec assumptions, quickstart warns users
   - **Future Path**: File-based storage planned for future feature
   - **Severity**: LOW (intentional per spec)

2. **Risk**: CLI-only interface limits accessibility
   - **Mitigation**: Rich formatting with ASCII fallbacks, screen reader considerations
   - **Future Path**: Could add web UI or API, but CLI-first per constitution
   - **Severity**: LOW (CLI is design goal)

3. **Risk**: No task backup before delete
   - **Mitigation**: Clear confirmation messages, undo not in scope for MVP
   - **Future Path**: Could add trash/archive in future feature
   - **Severity**: MEDIUM (accepted for simplicity)

**No Critical Risks Identified**

### Final Constitution Verdict

**Status**: ✅ **APPROVED FOR IMPLEMENTATION**

All six constitutional principles are satisfied:

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. TDD | ✅ PASS | Test structure defined, quickstart includes TDD workflow |
| II. CLI-First | ✅ PASS | 6 commands specified with Typer+Rich |
| III. Persistence | ⚠️ MODIFIED | In-memory Phase 1 with architecture for future file storage |
| IV. UX Excellence | ✅ PASS | Rich formatting, helpful errors, accessibility |
| V. Code Quality | ✅ PASS | Type hints, modular design, Ruff+Mypy configured |
| VI. Simplicity | ✅ PASS | Single entity, no premature abstraction, YAGNI applied |

**Ready for**: `/sp.tasks` command to generate task breakdown and begin TDD implementation

### Phase 2 Readiness Checklist

- [x] Technical Context fully defined (no NEEDS CLARIFICATION)
- [x] Constitution Check passed (initial)
- [x] Phase 0: research.md completed (technology decisions documented)
- [x] Phase 1: data-model.md completed (Task entity fully specified)
- [x] Phase 1: contracts/cli-commands.md completed (all 6 commands specified)
- [x] Phase 1: quickstart.md completed (developer setup guide)
- [x] Agent context updated (CLAUDE.md with Python 3.13+, Typer, Rich)
- [x] Constitution Check re-evaluated (post-design)
- [x] No critical risks or blockers identified

**Next Command**: `/sp.tasks` to generate testable task breakdown organized by user story priority (P1 → P2 → P3)
