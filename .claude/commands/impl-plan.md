# Implementation Plan from GitHub Issue

Generate a detailed, codebase-aware implementation plan for a GitHub issue.

## Inputs

The user provides: **$ARGUMENTS**

This should include a GitHub issue URL and optionally any comments, context, constraints, or priorities.

If no GitHub issue URL is found in the arguments, use AskUserQuestion to ask the user for the issue link.

## Workflow

### Step 1: Fetch the issue

Extract the issue number and repo from the URL. Fetch the full issue:

```bash
gh issue view <number> --repo <owner/repo> --json title,body,labels,assignees,comments,milestone
```

Read the title, description, labels, and discussion comments. If the issue references other issues or PRs, fetch those too for context.

### Step 2: Analyze the issue

Before touching the codebase, break down what the issue is actually asking for:

- **Type**: Feature, bug fix, refactor, docs, or infrastructure change?
- **Scope**: What user-facing or system behavior changes?
- **Acceptance criteria**: What does "done" look like? Extract explicit criteria from the issue body. If none exist, draft them.
- **Dependencies**: Does this depend on or block other issues?

Present this analysis to the user with AskUserQuestion and confirm your understanding is correct. This avoids wasting time exploring the codebase in the wrong direction.

### Step 3: Interview the user

Use AskUserQuestion to fill gaps that the issue description leaves open. Good questions to consider (skip ones the issue or user context already answers):

- Are there existing patterns in the codebase you want me to follow or deliberately break from?
- Any technical constraints or preferences (specific libraries, no new dependencies, performance targets)?
- What's the priority — speed of implementation, code quality, or minimal diff?
- Are there related features planned that this should be designed to accommodate?
- Should this include tests? What kind (unit, integration, e2e)?
- Any parts of the codebase you already know need changing?

Ask 2-4 focused questions per round. Don't over-interview — if the issue is well-specified, one round is enough. Two rounds maximum.

### Step 4: Explore the codebase

Use the Explore agent for broad discovery and Grep/Glob/Read for targeted lookups.

For each aspect of the issue, identify:
- **Which files** need to change — exact file paths and line ranges
- **What existing patterns** to follow — find similar features already implemented
- **What shared code** can be reused — services, utilities, types
- **What new files** need to be created, if any

Pay attention to:
- The project's CLAUDE.md for architecture, conventions, and path aliases
- Existing similar features as implementation references
- Shared types/interfaces in `libs/` directories
- Test patterns used in nearby test files
- Route definitions and lazy loading patterns
- How i18n, auth, and other cross-cutting concerns are handled

### Step 5: Generate the plan

Enter plan mode and produce a structured implementation plan:

---

#### Issue Summary
One paragraph restating the issue in your own words, incorporating what you learned from the user interview.

#### Acceptance Criteria
Bullet list of what "done" means — merged from the issue body, user interview, and your analysis.

#### Implementation Steps
Numbered steps, each containing:
- **What**: Clear description of the change
- **Where**: Exact file path(s) and approximate line ranges
- **How**: Specific approach — what to add/modify/remove, which patterns to follow
- **Reference**: Link to similar existing code in the codebase when applicable
- **Why**: Brief justification connecting this step to the acceptance criteria

Order steps by dependency — things that must happen first come first. Group tightly coupled changes together.

#### New Files
List any files that need to be created, with their purpose and which existing file to use as a template.

#### Testing Strategy
What tests to write, what to test, and which existing test files to reference as patterns.

#### Risks and Open Questions
Anything noticed during exploration that might complicate implementation — edge cases, unclear requirements, potential breaking changes, performance concerns.

---

### Step 6: Confirm with user

Present the plan and ask the user if they want to:
- Approve and start implementation
- Adjust any steps
- Add or remove scope
- Get more detail on a specific step

## Guidelines

- Be concrete and specific. "Update the service" is useless. "Add a `getAnalysis()` method to `apps/api/src/app/ai/ai.service.ts` following the pattern of `getSuggestions()` at line 45" is useful.
- Don't pad the plan with obvious steps unless they're genuinely needed.
- If the issue is small (< 3 files to change), keep the plan proportionally short.
- If the issue is large, suggest breaking it into smaller PRs and explain the split.
- Reference the CLAUDE.md for project-specific patterns and conventions.
