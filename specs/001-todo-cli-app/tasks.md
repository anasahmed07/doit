# Task Breakdown: Todo Console Application

**Feature**: 001-todo-cli-app | **Branch**: `001-todo-cli-app` | **Date**: 2026-01-02
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md)

## Overview

This document breaks down the Todo Console Application into testable, independent tasks organized by user story. The project follows Test-Driven Development (TDD) as mandated by the constitution - all implementation tasks have corresponding test tasks that must be completed first.

**Total User Stories**: 4 (P1: 1 MVP, P2: 1, P3: 2)
**Total Tasks**: 52 tasks
**MVP Scope**: User Story 1 only (Create and View Tasks)

## Implementation Strategy

**Incremental Delivery**:
1. **MVP (User Story 1)**: Create and view tasks - delivers core value
2. **P2 Enhancement (User Story 2)**: Mark complete/incomplete - enables workflow tracking
3. **P3 Enhancements (User Stories 3-4)**: Update and delete - improves usability

**TDD Workflow** (per constitution):
- **RED**: Write failing test
- **GREEN**: Implement minimal code to pass test
- **REFACTOR**: Improve code while tests still pass

**Independent Testing**: Each user story can be tested independently and delivers value on its own.

---

## Phase 1: Project Setup

**Goal**: Initialize project structure, dependencies, and development tools

**Tasks**:

- [X] T001 Initialize Python project with UV and pyproject.toml in repository root
- [X] T002 [P] Create project structure: src/doit/{models,storage,services,cli}/__init__.py
- [X] T003 [P] Create test structure: tests/{unit,integration}/__init__.py
- [X] T004 [P] Configure pyproject.toml with dependencies (typer, rich, pytest, pytest-cov, ruff, mypy)
- [X] T005 [P] Create .gitignore for Python (.venv, __pycache__, *.pyc, .pytest_cache, .mypy_cache, .coverage)
- [X] T006 [P] Configure ruff in pyproject.toml (line-length=100, target-version=py313, select E/F/I/N/UP/S/B/A/C4/PT)
- [X] T007 [P] Configure mypy in pyproject.toml (python_version=3.13, strict=true, disallow_untyped_defs=true)
- [X] T008 [P] Configure pytest in pyproject.toml (testpaths=tests, python_files=test_*.py)
- [X] T009 [P] Create pytest conftest.py in tests/ with sample fixtures structure
- [X] T010 Verify setup: run `uv sync && ruff check . && mypy src/ && pytest` (should pass with no tests)

**Completion Criteria**:
- ✅ UV environment created and activated
- ✅ All dependencies installed
- ✅ Project structure matches plan.md
- ✅ Quality tools configured and passing
- ✅ pytest discovers test directory

---

## Phase 2: Foundational Components

**Goal**: Implement shared infrastructure needed by all user stories

### Domain Exceptions

- [X] T011 Create src/doit/models/exceptions.py with DoitError base class
- [X] T012 [P] Add ValidationError(DoitError) to models/exceptions.py
- [X] T013 [P] Add TaskNotFoundError(DoitError) to models/exceptions.py
- [X] T014 [P] Add StorageError(DoitError) to models/exceptions.py

**Completion Criteria**:
- ✅ All 4 exception classes defined with docstrings
- ✅ Mypy passes for exceptions.py

---

## Phase 3: User Story 1 - Create and View Tasks (P1 - MVP)

**Story Goal**: Users can add tasks with title/description and view all tasks in a formatted list

**Independent Test**: Add multiple tasks via CLI, then list them. Verify all appear with correct IDs, titles, descriptions, and pending status.

**Why MVP**: This is the core value - without create/view, the app has no purpose. This is the minimal viable product.

### Task Model (RED → GREEN → REFACTOR)

- [X] T015 [US1] RED: Write test_task_creation_with_valid_data in tests/unit/test_task_model.py
- [X] T016 [US1] RED: Write test_task_validation_empty_title_raises_error in tests/unit/test_task_model.py
- [X] T017 [US1] RED: Write test_task_validation_whitespace_title_raises_error in tests/unit/test_task_model.py
- [X] T018 [US1] RED: Write test_task_validation_title_too_long_raises_error in tests/unit/test_task_model.py
- [X] T019 [US1] RED: Write test_task_validation_description_too_long_raises_error in tests/unit/test_task_model.py
- [X] T020 [US1] RED: Write test_task_unicode_support in tests/unit/test_task_model.py
- [X] T021 [US1] GREEN: Implement Task dataclass in src/doit/models/task.py with validation
- [X] T022 [US1] REFACTOR: Review Task model for type hints, docstrings, validation logic clarity

### Memory Storage (RED → GREEN → REFACTOR)

- [X] T023 [US1] RED: Write test_memory_storage_add_task in tests/unit/test_memory_storage.py
- [X] T024 [US1] RED: Write test_memory_storage_get_task_by_id in tests/unit/test_memory_storage.py
- [X] T025 [US1] RED: Write test_memory_storage_get_all_tasks_sorted in tests/unit/test_memory_storage.py
- [X] T026 [US1] RED: Write test_memory_storage_auto_increment_ids in tests/unit/test_memory_storage.py
- [X] T027 [US1] GREEN: Implement MemoryStorage class in src/doit/storage/memory.py
- [X] T028 [US1] REFACTOR: Review MemoryStorage for type hints, Protocol compliance, edge cases

### Task Service (RED → GREEN → REFACTOR)

- [X] T029 [US1] RED: Write test_task_service_create_task in tests/unit/test_task_service.py
- [X] T030 [US1] RED: Write test_task_service_get_all_tasks in tests/unit/test_task_service.py
- [X] T031 [US1] RED: Write test_task_service_create_validates_title in tests/unit/test_task_service.py
- [X] T032 [US1] GREEN: Implement TaskService in src/doit/services/task_service.py with create and get_all methods
- [X] T033 [US1] REFACTOR: Review TaskService for separation of concerns and error handling

### CLI Commands: Add & List (RED → GREEN → REFACTOR)

- [X] T034 [US1] RED: Write test_cli_add_command_success in tests/integration/test_cli_commands.py
- [X] T035 [US1] RED: Write test_cli_add_command_empty_title_error in tests/integration/test_cli_commands.py
- [X] T036 [US1] RED: Write test_cli_list_command_with_tasks in tests/integration/test_cli_commands.py
- [X] T037 [US1] RED: Write test_cli_list_command_empty in tests/integration/test_cli_commands.py
- [X] T038 [US1] GREEN: Create Typer app in src/doit/cli/main.py with entry point
- [X] T039 [US1] GREEN: Implement add command in src/doit/cli/commands.py with Rich formatting
- [X] T040 [US1] GREEN: Implement list command in src/doit/cli/commands.py with Rich Table
- [X] T041 [US1] REFACTOR: Review CLI commands for Rich formatting, error messages, help text

### US1 Integration & Verification

- [X] T042 [US1] Run full test suite for US1: pytest tests/unit tests/integration -k "US1 or task_model or memory_storage or task_service"
- [X] T043 [US1] Manual test: Add 3 tasks via CLI and verify list displays correctly
- [X] T044 [US1] Verify acceptance scenarios 1-4 from spec.md are satisfied
- [X] T045 [US1] Run quality gates: ruff check && ruff format && mypy src/ && pytest --cov=src/doit --cov-report=term-missing

**US1 Completion Criteria**:
- ✅ All 31 tasks (T015-T045) completed
- ✅ Users can add tasks with title and optional description
- ✅ Users can view all tasks in formatted table
- ✅ Empty task list shows friendly message
- ✅ Visual status indicators (○ Pending) displayed
- ✅ Test coverage ≥90% for US1 code
- ✅ All acceptance scenarios pass

**US1 Parallel Opportunities**: Tests can be written in parallel (T015-T020, T023-T026, T029-T031, T034-T037)

---

## Phase 4: User Story 2 - Mark Tasks as Complete (P2)

**Story Goal**: Users can mark tasks as complete or incomplete to track progress

**Independent Test**: Add tasks, mark some complete, verify status changes persist and display correctly in list.

**Dependencies**: Requires US1 (need to create and view tasks first)

### Task Model Extensions (RED → GREEN → REFACTOR)

- [X] T046 [US2] RED: Write test_task_complete_status_toggle in tests/unit/test_task_model.py
- [X] T047 [US2] GREEN: Verify Task.completed field works with True/False (should already exist from US1)
- [X] T048 [US2] REFACTOR: Add convenience methods if needed (mark_complete, mark_incomplete)

### Storage Extensions (RED → GREEN → REFACTOR)

- [X] T049 [US2] RED: Write test_memory_storage_update_task in tests/unit/test_memory_storage.py
- [X] T050 [US2] RED: Write test_memory_storage_update_nonexistent_raises_error in tests/unit/test_memory_storage.py
- [X] T051 [US2] GREEN: Implement update method in src/doit/storage/memory.py
- [X] T052 [US2] REFACTOR: Review update method for error handling and type safety

### Service Extensions (RED → GREEN → REFACTOR)

- [X] T053 [US2] RED: Write test_task_service_complete_task in tests/unit/test_task_service.py
- [X] T054 [US2] RED: Write test_task_service_uncomplete_task in tests/unit/test_task_service.py
- [X] T055 [US2] RED: Write test_task_service_complete_nonexistent_raises_error in tests/unit/test_task_service.py
- [X] T056 [US2] GREEN: Implement complete_task and uncomplete_task in src/doit/services/task_service.py
- [X] T057 [US2] REFACTOR: Review service methods for DRY principle and error messages

### CLI Commands: Complete & Uncomplete (RED → GREEN → REFACTOR)

- [X] T058 [US2] RED: Write test_cli_complete_command_success in tests/integration/test_cli_commands.py
- [X] T059 [US2] RED: Write test_cli_complete_command_not_found in tests/integration/test_cli_commands.py
- [X] T060 [US2] RED: Write test_cli_uncomplete_command_success in tests/integration/test_cli_commands.py
- [X] T061 [US2] RED: Write test_cli_list_shows_completed_status in tests/integration/test_cli_commands.py
- [X] T062 [US2] GREEN: Implement complete command in src/doit/cli/commands.py
- [X] T063 [US2] GREEN: Implement uncomplete command in src/doit/cli/commands.py
- [X] T064 [US2] GREEN: Update list command to show ✓ Done vs ○ Pending status
- [X] T065 [US2] REFACTOR: Review complete/uncomplete commands for consistent formatting and messages

### US2 Integration & Verification

- [X] T066 [US2] Run test suite for US2: pytest -k "US2"
- [X] T067 [US2] Manual test: Add tasks, mark complete/incomplete, verify display
- [X] T068 [US2] Verify acceptance scenarios 1-4 from spec.md User Story 2 are satisfied
- [X] T069 [US2] Run quality gates: ruff check && ruff format && mypy src/ && pytest --cov

**US2 Completion Criteria**:
- ✅ All 24 tasks (T046-T069) completed
- ✅ Users can mark tasks complete by ID
- ✅ Users can mark tasks incomplete by ID
- ✅ List command shows visual distinction (✓ Done vs ○ Pending)
- ✅ Error messages for non-existent IDs
- ✅ Test coverage ≥90% maintained
- ✅ All acceptance scenarios pass

**US2 Parallel Opportunities**: Test writing (T046, T049-T050, T053-T055, T058-T061)

---

## Phase 5: User Story 3 - Update Task Information (P3)

**Story Goal**: Users can modify task title and/or description

**Independent Test**: Create task, update title only, verify. Update description only, verify. Update both, verify.

**Dependencies**: Requires US1 (need to create tasks first)

### Service Extensions (RED → GREEN → REFACTOR)

- [X] T070 [US3] RED: Write test_task_service_update_task_title in tests/unit/test_task_service.py
- [X] T071 [US3] RED: Write test_task_service_update_task_description in tests/unit/test_task_service.py
- [X] T072 [US3] RED: Write test_task_service_update_task_both_fields in tests/unit/test_task_service.py
- [X] T073 [US3] RED: Write test_task_service_update_validates_title in tests/unit/test_task_service.py
- [X] T074 [US3] RED: Write test_task_service_update_nonexistent_raises_error in tests/unit/test_task_service.py
- [X] T075 [US3] GREEN: Implement update_task method in src/doit/services/task_service.py
- [X] T076 [US3] REFACTOR: Review update logic for validation and partial updates

### CLI Command: Update (RED → GREEN → REFACTOR)

- [X] T077 [US3] RED: Write test_cli_update_command_title_only in tests/integration/test_cli_commands.py
- [X] T078 [US3] RED: Write test_cli_update_command_description_only in tests/integration/test_cli_commands.py
- [X] T079 [US3] RED: Write test_cli_update_command_both_fields in tests/integration/test_cli_commands.py
- [X] T080 [US3] RED: Write test_cli_update_command_not_found in tests/integration/test_cli_commands.py
- [X] T081 [US3] RED: Write test_cli_update_command_no_changes in tests/integration/test_cli_commands.py
- [X] T082 [US3] GREEN: Implement update command in src/doit/cli/commands.py with --title and --description options
- [X] T083 [US3] REFACTOR: Review update command for option validation and error messages

### US3 Integration & Verification

- [X] T084 [US3] Run test suite for US3: pytest -k "US3"
- [X] T085 [US3] Manual test: Update title, description, and both; verify changes persist
- [X] T086 [US3] Verify acceptance scenarios 1-4 from spec.md User Story 3 are satisfied
- [X] T087 [US3] Run quality gates: ruff check && ruff format && mypy src/ && pytest --cov

**US3 Completion Criteria**:
- ✅ All 18 tasks (T070-T087) completed
- ✅ Users can update task title by ID
- ✅ Users can update task description by ID
- ✅ Users can update both title and description
- ✅ Validation enforced (non-empty title)
- ✅ Error messages for non-existent IDs and no changes
- ✅ Test coverage ≥90% maintained
- ✅ All acceptance scenarios pass

**US3 Parallel Opportunities**: Test writing (T070-T074, T077-T081)

---

## Phase 6: User Story 4 - Delete Tasks (P3)

**Story Goal**: Users can remove tasks from the list

**Independent Test**: Create multiple tasks, delete one by ID, verify it's gone and others remain.

**Dependencies**: Requires US1 (need to create tasks first)

### Storage Extensions (RED → GREEN → REFACTOR)

- [X] T088 [US4] RED: Write test_memory_storage_delete_task in tests/unit/test_memory_storage.py
- [X] T089 [US4] RED: Write test_memory_storage_delete_nonexistent_returns_false in tests/unit/test_memory_storage.py
- [X] T090 [US4] GREEN: Verify delete method in src/doit/storage/memory.py (should already exist from data model)
- [X] T091 [US4] REFACTOR: Review delete method for return value semantics

### Service Extensions (RED → GREEN → REFACTOR)

- [X] T092 [US4] RED: Write test_task_service_delete_task in tests/unit/test_task_service.py
- [X] T093 [US4] RED: Write test_task_service_delete_nonexistent_raises_error in tests/unit/test_task_service.py
- [X] T094 [US4] GREEN: Implement delete_task method in src/doit/services/task_service.py
- [X] T095 [US4] REFACTOR: Review delete logic for error handling

### CLI Command: Delete (RED → GREEN → REFACTOR)

- [X] T096 [US4] RED: Write test_cli_delete_command_success in tests/integration/test_cli_commands.py
- [X] T097 [US4] RED: Write test_cli_delete_command_not_found in tests/integration/test_cli_commands.py
- [X] T098 [US4] RED: Write test_cli_delete_preserves_other_tasks in tests/integration/test_cli_commands.py
- [X] T099 [US4] GREEN: Implement delete command in src/doit/cli/commands.py
- [X] T100 [US4] REFACTOR: Review delete command for confirmation message

### US4 Integration & Verification

- [X] T101 [US4] Run test suite for US4: pytest -k "US4"
- [X] T102 [US4] Manual test: Delete tasks by ID, verify removal and list accuracy
- [X] T103 [US4] Verify acceptance scenarios 1-4 from spec.md User Story 4 are satisfied
- [X] T104 [US4] Run quality gates: ruff check && ruff format && mypy src/ && pytest --cov

**US4 Completion Criteria**:
- ✅ All 17 tasks (T088-T104) completed
- ✅ Users can delete tasks by ID
- ✅ Deleted tasks don't appear in list
- ✅ Other tasks preserved after deletion
- ✅ Error messages for non-existent IDs
- ✅ Test coverage ≥90% maintained
- ✅ All acceptance scenarios pass

**US4 Parallel Opportunities**: Test writing (T088-T089, T092-T093, T096-T098)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Final quality improvements, documentation, and edge case handling

### Documentation

- [X] T105 [P] Create README.md with project overview, installation, and usage examples
- [X] T106 [P] Add docstrings to all public functions/classes that are missing them
- [X] T107 [P] Update quickstart.md with actual installation steps if needed

### Edge Cases & Error Handling

- [X] T108 Test and handle task ID edge cases (negative, zero, very large numbers)
- [X] T109 Test and handle very long titles (exactly 500 chars, 501 chars)
- [X] T110 Test and handle unicode edge cases (emoji, RTL text, combining characters)
- [X] T111 Add --help text improvements based on manual testing feedback

### Performance & Scale

- [X] T112 Performance test: Add 1,000 tasks and verify list command completes in <2 seconds
- [X] T113 Verify all operations complete in <10 seconds per success criterion SC-001

### Final Verification

- [X] T114 Run full test suite: pytest tests/ -v
- [X] T115 Verify test coverage ≥90%: pytest --cov=src/doit --cov-report=term-missing --cov-fail-under=90
- [X] T116 Run all quality gates: ruff check . && ruff format . && mypy src/
- [X] T117 Manual acceptance test: Walk through all 4 user stories end-to-end
- [X] T118 Verify all 8 success criteria from spec.md are met (SC-001 through SC-008)

**Phase 7 Completion Criteria**:
- ✅ All 14 tasks (T105-T118) completed
- ✅ Documentation complete
- ✅ All edge cases handled
- ✅ Performance targets met
- ✅ 90% test coverage achieved
- ✅ All quality gates passing
- ✅ All success criteria satisfied

---

## Dependencies & Execution Order

### User Story Dependencies

```
Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3 - MVP)
                                              ↓
                                         US2 (Phase 4) [depends on US1]
                                         US3 (Phase 5) [depends on US1]
                                         US4 (Phase 6) [depends on US1]
                                              ↓
                                         Polish (Phase 7)
```

**Critical Path**: Setup → Foundational → US1 → Polish (for MVP)

**Parallel Phases**: US2, US3, US4 can be implemented in any order after US1

### Task Dependencies Within User Stories

**US1 (Create and View Tasks)**:
1. Task Model (T015-T022) - Foundation
2. Storage (T023-T028) - Requires Task Model
3. Service (T029-T033) - Requires Storage
4. CLI (T034-T041) - Requires Service
5. Integration (T042-T045) - Requires all above

**US2 (Mark Complete)**: Extends US1 components (Model → Storage → Service → CLI)

**US3 (Update)**: Extends US1 Service and CLI layers

**US4 (Delete)**: Extends US1 Storage, Service, and CLI layers

### Parallel Execution Opportunities

**Within Each User Story** (same pattern for US1-US4):
- ✅ **Test Writing**: All RED phase tests can be written in parallel
- ✅ **Documentation**: Docstrings and README can be written anytime
- ✅ **Configuration**: Tool configs (T006-T008) can be done in parallel

**Example US1 Parallel Execution**:
```bash
# Developer A: Write all Task model tests (T015-T020)
# Developer B: Write all Storage tests (T023-T026)
# Developer C: Write all Service tests (T029-T031)
# Developer D: Write all CLI tests (T034-T037)

# Then sequentially:
# Developer A: Implement Task model (T021-T022)
# Developer B: Implement Storage (T027-T028) - after Task model done
# Developer C: Implement Service (T032-T033) - after Storage done
# Developer D: Implement CLI (T038-T041) - after Service done
```

---

## MVP Delivery Strategy

**Minimum Viable Product = User Story 1 Only**

**MVP Tasks**: T001-T045 (45 tasks)

**MVP Delivers**:
- ✅ Users can add tasks with title and description
- ✅ Users can view all tasks in a formatted table
- ✅ Core value delivered: capture and view tasks

**Post-MVP Increments**:
- **Increment 1**: Add US2 (T046-T069) - Mark complete/incomplete
- **Increment 2**: Add US3 (T070-T087) - Update task information
- **Increment 3**: Add US4 (T088-T104) - Delete tasks
- **Final Polish**: Complete Phase 7 (T105-T118)

**MVP Validation**:
Run after T045 completes:
```bash
# Add 3 tasks
doit add "Buy groceries" -d "Milk, eggs, bread"
doit add "Write documentation"
doit add "Review PR" -d "Check tests and code quality"

# View tasks
doit list

# Expected output: Table with 3 tasks, all pending status, sequential IDs
```

If this works, MVP is complete and delivers core value!

---

## Testing Strategy Summary

**Test Types**:
1. **Unit Tests**: Models, Storage, Services (isolated, fast)
2. **Integration Tests**: CLI commands end-to-end (uses CliRunner)
3. **Manual Tests**: Acceptance scenarios from spec.md

**Coverage Target**: ≥90% per constitution

**TDD Workflow** (per constitution):
1. **RED**: Write failing test first
2. **GREEN**: Implement minimal code to pass
3. **REFACTOR**: Improve code while keeping tests green

**Test Organization**:
- tests/unit/test_task_model.py - Task validation
- tests/unit/test_memory_storage.py - CRUD operations
- tests/unit/test_task_service.py - Business logic
- tests/integration/test_cli_commands.py - All CLI commands

---

## Quality Gates (Run Before Each Commit)

```bash
# 1. Linting
ruff check .

# 2. Formatting
ruff format .

# 3. Type checking
mypy src/

# 4. Tests with coverage
pytest --cov=src/doit --cov-report=term-missing --cov-fail-under=90

# 5. All together (commit only if all pass)
ruff check . && ruff format . && mypy src/ && pytest --cov=src/doit --cov-fail-under=90
```

---

## Task Execution Checklist

**Before Starting Any Task**:
- [ ] Read acceptance scenarios for the user story
- [ ] Understand what "done" looks like
- [ ] Check if any dependencies are incomplete

**During Task Execution**:
- [ ] Follow TDD: RED → GREEN → REFACTOR
- [ ] Run tests frequently (`pytest -k "test_name"`)
- [ ] Keep changes small and focused
- [ ] Add type hints to all new code
- [ ] Write docstrings for public APIs

**After Completing Task**:
- [ ] Run quality gates (linting, formatting, type checking, tests)
- [ ] Verify task completion criteria from this document
- [ ] Mark checkbox complete in tasks.md
- [ ] Commit with descriptive message

**After Completing User Story**:
- [ ] Run full test suite for that story
- [ ] Manual test all acceptance scenarios
- [ ] Verify independent test criteria
- [ ] Run quality gates
- [ ] Verify test coverage ≥90%

---

## Notes

**File Paths**: All paths are relative to repository root unless specified

**Task IDs**: Sequential (T001-T118) to track progress and reference in commits

**[P] Marker**: Indicates task can be parallelized (different files, no dependencies)

**[US#] Label**: Maps task to user story (US1-US4) for traceability

**TDD Required**: Constitution mandates test-first development - all tests must be written before implementation

**Independent Stories**: US2, US3, US4 can be implemented in any order after US1 completes
