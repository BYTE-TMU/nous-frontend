# GitHub Practices

These are the preferred Git and GitHub practices for the Nous frontend repository.

## Branch Protection

- All feature, bugfix, and improvement work starts from `develop`
- Never create a working branch from `main`
- Never open development pull requests against `main`
- `develop` is the shared integration branch for active work
- `main` is the final tested branch and is treated as sacred
- Only Johan merges changes into `main`
- Changes reach `main` only after Johan has tested and approved them
- Do not push directly to `main`

## Branch Naming

Create each branch from `develop` and include the ticket number and a short kebab-case ticket title

Ticket numbers use the format `FE-<story>.<subtask>` such as `FE-1.1` or `FE-2.2`

| Work type   | Branch format                                | Example                                |
| ----------- | -------------------------------------------- | -------------------------------------- |
| Feature     | `feature/<ticket-number>-<ticket-title>`     | `feature/FE-1.1-dashboard-empty-state` |
| Bug fix     | `bugfix/<ticket-number>-<ticket-title>`      | `bugfix/FE-2.2-login-redirect`         |
| Improvement | `improvement/<ticket-number>-<ticket-title>` | `improvement/FE-3.1-skeleton-loading`  |

Use the branch prefix that matches the primary purpose of the ticket

### Branch Name Examples

```text
feature/FE-1.1-conversation-list
feature/FE-3.2-chat-history-onboarding
bugfix/FE-3.3-expired-session-redirect
bugfix/FE-1.2-mind-map-node-navigation
improvement/FE-3.4-authentication-error-states
improvement/FE-1.3-responsive-dashboard-layout
```

## Keeping A Branch Current

Prefer rebasing onto `develop` to preserve a clean, linear commit history

Do not merge `develop` into a working branch unless the team explicitly agrees that a merge is necessary

From the working branch, update it with the latest changes using this sequence

```bash
git checkout develop
git pull origin develop
git checkout <working-branch>
git rebase develop
```

Resolve conflicts during the rebase, then continue it

```bash
git add <resolved-files>
git rebase --continue
```

To cancel the rebase and return to the previous branch state

```bash
git rebase --abort
```

## Pull Requests

- Open pull requests against `develop`
- A pull request may include multiple tickets when the tickets are directly related
- Link every included ticket in the pull request description
- Identify the primary ticket in the pull request title or summary
- Explain how the related tickets fit together and why they belong in one pull request
- Use separate commits or clearly separated sections when tickets represent distinct changes
- Keep unrelated tickets in separate pull requests
- Rebase before requesting review
- Run the relevant tests, type checks, and lint checks before requesting review
- Include screenshots or a preview link for visual changes
- Do not self-merge protected or security-sensitive work without the required review
- Do not merge feature work directly into `main`

## Commit History

- Prefer small, focused commits
- Format commit messages as `<ticket-number>: <imperative description>`
- Use the imperative mood for the description, which keeps the message direct and action-oriented
- Keep the subject short and describe the primary change
- Use bullet points in the commit body for additional context
- Start each bullet with an action or clear statement
- Use active voice where a sentence describes an actor performing an action
- Avoid past-tense descriptions such as `Created`, `Added`, or `Fixed`
- Avoid merge commits when rebasing can preserve a linear history
- Do not rewrite shared branches
- After rebasing a published branch, push with lease protection

### Commit Format

```text
<ticket-number>: <imperative description>

- <supporting point>
- <supporting point>
```

Keep the subject focused on one primary change and use the body to explain related details, decisions, or validation

### Commit Examples

```text
FE-1.1: Create dashboard empty state

- Add import history action
- Add onboarding navigation
- Cover empty and loading states
```

```text
FE-3.2: Fix login redirect

- Preserve the requested protected route
- Redirect expired sessions to login
- Verify the redirect with an integration test
```

```text
FE-2.4: Improve conversation skeletons

- Add loading placeholders for the conversation list
- Match the conversation layout dimensions
- Keep the layout stable during loading
```

Avoid messages such as `FE-1.1: Created dashboard`, `FE-3.2: Fixed login`, or `FE-2.1: Added stuff`

```bash
git push --force-with-lease
```

## Recommended Workflow

```bash
git checkout develop
git pull
git checkout -b feature/<ticket-number>-<ticket-title>

# Work on the ticket and commit focused changes

git checkout develop
git pull
git checkout feature/<ticket-number>-<ticket-title>
git rebase develop

git push -u origin feature/<ticket-number>-<ticket-title>
```
