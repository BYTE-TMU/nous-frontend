# Nous Frontend GitHub Issue Stories

This document contains the core frontend stories for the next implementation cycle. Each story is intentionally outcome-focused. Engineers should break the story into their own subtasks, choose the component structure, and decide the implementation sequence within the stated boundaries.

The stories assume three feature owners:

- Dashboard and mind map
- Insight and node chat
- Authentication and onboarding

Each feature owner is responsible for the API calls, endpoint coordination, request and response types, fixtures, and feature-specific state needed for their own story. The PM coordinates shared decisions and integration between the stories; there is no separate FE 4 foundation implementation assignment.

The import provider is referred to as **Claude** below. The first product scope is ChatGPT and Claude export guidance; the backend parser and supported file formats remain the source of truth for what can be uploaded.

---

## [FE 1 - Mind Map] - Build the dashboard empty state and basic mind map

### Summary

Build the authenticated `/dashboard` route with a clear empty state and a basic data-backed mind map. This story establishes the first dashboard experience and its loading, success, error, and retry states without adding further dashboard functionality.

### Background / Context

Nous is a read-only mirror of a user's thinking. The dashboard should guide a new user toward importing their history or beginning onboarding, then show a basic mind map once data is available.

The current home route is a placeholder in `app/page.tsx`, and `MindMap` is a placeholder in `components/graph/GraphView.tsx`. `GraphView.tsx` should be renamed to `MindMap.tsx`.

### User Story

As a Nous user, I want clear next steps when I have no imported data and a basic mind map when data is available so that I can begin exploring how Nous represents my thinking.

### Scope

#### In Scope

- Implement the authenticated `/dashboard` route.
- Render a base empty state for a user with no available data.
- Include an **Import chat history** button that navigates to the upload flow.
- Include a **Begin onboarding** button that navigates to `/onboarding` (or the onboarding presentation selected by the FE 3 owner).
- Render skeleton loading states for the dashboard and mind map while data is loading.
- Render a basic mind map from API-backed nodes and relationships when data is available.
- Allow a user to click a mind map node and navigate to `/conversation/[id]` using that node's stable identifier.
- Render a successful loaded state when the mind map data is available.
- Render a clear error state with a working retry action when the dashboard or mind map request fails.
- Preserve a usable layout on desktop and mobile widths.

#### Nice to Have

- Add lightweight transitions between dashboard states.

#### Deferred

- Insight feed and insight ranking.
- Interactive graph exploration beyond clicking a node.
- Editing graph nodes or relationships.
- User-created notes, prompts, or journal entries.

#### Excluded / Out of Scope

- Fabricating graph nodes, relationships, or evidence when the API returns no data.
- Building a general-purpose chat input on the dashboard.

### Acceptance Criteria

1. An authenticated user with no available data sees a designed empty state instead of a blank page.
2. The empty state contains an **Import chat history** button that navigates to the upload flow.
3. The empty state contains a **Begin onboarding** button that navigates to `/onboarding` (or the onboarding presentation selected by the FE 3 owner).
4. Dashboard and mind map loading states use skeleton UI rather than a blank page or spinner-only state.
5. A successful dashboard response renders a basic mind map using API-backed nodes and relationships.
6. Each rendered mind map node has a stable identifier and clicking it navigates to `/conversation/[id]` with that identifier.
7. Dashboard and mind map request failures render a clear error state with a working retry action.
8. A successful loaded state is distinguishable from the empty, loading, and error states.
9. The dashboard is usable at mobile and desktop widths without overlapping content or unstable mind map dimensions.
10. The dashboard behavior is covered by tests for empty, skeleton loading, success, error, retry, and node-navigation states.

### Technical Notes

- Use the existing `app/page.tsx` and implement `components/graph/MindMap.tsx` (currently `GraphView`, should be renamed) unless a focused split improves maintainability. The route may be moved or composed with `/dashboard` according to the agreed route map.
- Define and own the request and response types needed by the mind map API calls, using generated backend types where they are available.
- Add the API calls needed to load dashboard and mind map data through the agreed frontend backend boundary.
- Keep graph rendering independent from backend graph-generation business logic.
- Use fixtures or a mock adapter while the backend responses are still being finalized.
- Use stable node identifiers returned by the backend for navigation.

### Dependencies

- `[FE 2 - Chat] - Build the conversation list and conversation UI`
- Backend endpoint for graph data

### Open Questions

- **Tech:** Does the backend return a single graph payload or separate node and relationship responses?
- **Tech:** What is the exact node identifier format expected by `/conversation/[id]`?
- **Design:** Which graph node types receive distinct visual treatment in the basic map?

---

## [FE 2 - Chat] - Build the conversation list and conversation UI

### Summary

Build the UI for `ConversationList` and `Conversation`. The list shows available conversations with the AI about insights, and selecting one opens `/conversation/[id]`. This is a presentation-focused slice using fixtures or placeholder data; it does not require finalized chat data or polished AI behavior.

### Background / Context

Chat in Nous is not a general assistant with open-ended memory. It is a focused conversation about an insight or node. At this stage, the frontend needs to establish the shape and navigation of the experience before real conversation data is available.

There is currently no conversation route. The visual treatment for Beliefs, Goals, Decisions, and Reflections should be represented in a way that allows a future color scheme to be added once the colors are determined.

### User Story

As a Nous user, I want to browse my conversations and open one conversation so that I have a clear place to understand an insight or node when real data becomes available.

### Scope

#### In Scope

- Create the dynamic route `/conversation/[id]`.
- Build a `ConversationList` UI showing the user's available AI conversations.
- Build a `Conversation` UI showing the selected conversation's header, messages, and response area.
- Allow a user to click a conversation in `ConversationList` and navigate to `/conversation/[id]`.
- Use fixtures or placeholder data because finalized conversation data is not required for this story.
- Include a category/type treatment for Beliefs, Goals, Decisions, and Reflections.
- Keep the category treatment ready for a future color scheme without locking in final colors now.
- Render skeleton loading states for both `ConversationList` and `Conversation`.
- Render valid empty, success, error, and retry states for both views.
- Provide navigation back to the dashboard and from the conversation detail view back to the conversation list.

#### Nice to Have

- Add lightweight transitions between the list and detail views.
- Add a temporary fixture switch for previewing each conversation category.

#### Deferred

- Real conversation data or backend chat integration.
- Final category colors or a finalized design-system palette.
- General-purpose conversations unrelated to an insight or node.
- Cross-insight conversations.

#### Excluded / Out of Scope

- User-authored content being added to the Nous graph.
- Polished AI response behavior or evidence correctness, since real data is not part of this story.

### Acceptance Criteria

1. `ConversationList` renders a list of fixture or placeholder conversations with a stable identifier, title, preview, and category.
2. Clicking a conversation in `ConversationList` navigates to `/conversation/[id]` with the selected identifier.
3. `Conversation` renders the selected conversation's header and message layout when the identifier is valid.
4. Beliefs, Goals, Decisions, and Reflections are visually distinguishable through a category token or styling hook, without requiring final production colors.
5. `ConversationList` and `Conversation` use skeleton UI while their content is loading.
6. An empty conversation list renders a designed empty state rather than a blank page.
7. A valid conversation renders a successful loaded state using fixture or placeholder content.
8. List and detail failures render clear error states with working retry actions.
9. A user can navigate from `Conversation` back to `ConversationList` and from the conversation experience back to the dashboard.
10. The list and conversation layouts work on mobile and desktop without overlapping content.
11. Tests cover list loading, list empty, list success, list error and retry, conversation loading, conversation success, invalid conversation identifiers, and navigation.

### Technical Notes

- Create `app/conversation/[id]/page.tsx` and keep the route parameter opaque.
- Use `ConversationList` and `Conversation` as separate UI responsibilities.
- Keep category identity separate from its visual color so the final palette can be decided later.
- Use fixtures or a mock adapter while the backend conversation contract is unavailable.
- Define and own the request and response types and API calls needed when conversation data becomes available.
- Do not imply that placeholder content is a real user conversation.

### Dependencies

- `[FE 1 - Mind Map] - Build the dashboard empty state and basic mind map`
- Future backend conversation endpoint; not required to complete the initial UI slice

### Open Questions

- **Design:** What final colors represent Beliefs, Goals, Decisions, and Reflections?
- **Tech:** Should the initial route be reached from a dashboard node, an insight, or both?
- **Product:** What conversation metadata should appear in each list item once real data is available?

---

## [FE 3 - Authentication] - Implement authentication and first-run onboarding

### Summary

Implement the complete registration-to-onboarding vertical slice, including backend authentication calls, login, logout, session handling, and guided ChatGPT or Claude import onboarding.

### Background / Context

The current login and register routes are placeholders, and the auth client in `lib/auth.ts` has not been implemented. Nous uses self-issued JWT authentication through `nous-backend`, not Firebase. This story is complete only when a new user can register through the backend, establish a session, complete onboarding, and reach the upload or dashboard destination.

New users need a clear first action because the dashboard has no insight data on first launch. Onboarding should explain the value of an import, guide the user through obtaining an export, and hand off to the upload flow without turning the dashboard into a setup wizard.

### User Story

As a new Nous user, I want to create an account and receive clear guidance for importing my ChatGPT or Claude history so that I can reach a useful dashboard instead of an unexplained empty screen.

### Scope

#### In Scope

- Implement the registration UI and backend registration call using the agreed auth contract.
- Implement the login UI and backend login call using the agreed auth contract.
- Implement logout, clear local auth state, and invalidate or discard session credentials according to the backend contract.
- Implement session restoration using the backend refresh or authenticated-user call as required.
- Handle expired or invalid tokens by returning the user to login without exposing protected content.
- Protect authenticated routes, including the dashboard, conversation, account, entries, fingerprint, and upload routes as appropriate.
- Create an `/onboarding` route, or a tutorial based overlay.
- Let users choose whether they are importing ChatGPT or Claude data.
- Provide provider-specific export instructions.
- Provide a clear handoff from onboarding to upload.
- Persist the onboarding choice and completion state using the agreed client or backend mechanism, without storing raw export content in browser storage.
- Allow a user to skip onboarding only when the product decides that skipping is valid, while retaining a way to return to the instructions.
- Include validation, loading, success, and error states for auth forms and onboarding actions.

#### Nice to Have

- Preserve the selected provider when navigating between instruction and upload screens.
- Add a short explanation of what happens during processing after upload.
- Add a completion state that links directly to the dashboard.

#### Deferred

- Google OAuth.
- Password reset UI.
- Multi-account or team workspaces.

#### Excluded / Out of Scope

- Firebase authentication.
- Frontend-issued or frontend-verified JWTs.
- Storing raw export content in browser storage.
- Sending credentials or exports directly to an LLM provider from the frontend.

### Acceptance Criteria

1. A user can submit valid registration details and the frontend sends the expected request to the backend registration endpoint.
2. Invalid registration input is rejected with field-level feedback where possible.
3. A registered user can submit valid login details and the frontend sends the expected request to the backend login endpoint.
4. A successful login creates the expected authenticated client state and routes the user to the intended authenticated destination.
5. A user can log out from the authenticated application, local auth state is cleared, and protected content is no longer accessible.
6. A valid session is restored after a page refresh according to the backend token contract.
7. An expired or invalid session clears the local auth state and redirects the user to login.
8. Unauthenticated users cannot access protected routes directly.
9. A newly registered or logged-in user can enter onboarding and choose ChatGPT or Claude.
10. Each provider option displays accurate export instructions and a clear next action.
11. A user can complete onboarding and reach the upload flow or dashboard destination defined by the product flow.
12. Onboarding preserves the selected provider context through its handoff to upload.
13. Auth and onboarding loading, error, retry, and success states are visible and recoverable.
14. Tests cover backend registration, backend login, logout, session restoration, protected-route behavior, token expiry, provider selection, onboarding completion, and upload handoff.
15. A full happy-path check proves that a new user can register, establish a session, complete onboarding, and reach the next product step without manual auth-state manipulation.

### Technical Notes

- Use `lib/auth.ts` as the single client-side auth abstraction.
- Implement or extend the backend API calls and request and response types needed for registration, login, logout, session restoration, and onboarding.
- Follow the backend's self-issued JWT behavior; do not duplicate token parsing or auth decisions in individual pages.
- Avoid storing raw export files or raw export content in local storage.
- Keep provider instructions separate from upload mechanics so support for another provider does not require rewriting auth.
- Use generated backend types once the auth contract is available, while owning any feature-specific adapter types required by the auth UI.

### Dependencies

- Backend register, login, refresh, and authenticated-user endpoints

### Open Questions

- **Product:** Should every newly registered user be required to complete onboarding, or can they skip directly to the dashboard?
- **Tech:** Where should the access token and refresh token live under the backend's rotation policy?
- **Product:** Are email confirmation and the associated verification screen required for this first frontend milestone?
- **Tech:** If email confirmation is required, which backend verification and resend endpoints should this story consume?
- **Tech:** Does the upload API need the selected provider as a request field?

## [FE 4 - Integration] - Connect onboarding, upload processing, dashboard, and chat

### Summary

Connect the completed feature slices into one complete path from backend-backed account creation through authentication, onboarding, import, processing, dashboard results, and conversation navigation.

### Background / Context

The individual stories are only valuable when the user can complete the full Nous journey. FE 3 now owns the registration, login, session, and onboarding implementation; FE 4 verifies that those pieces connect correctly to upload, dashboard, and conversation routes. It should be completed after the three feature owners have working vertical slices.

### Scope

#### In Scope

- Connect the FE 3 backend registration flow to the authenticated onboarding entry point.
- Connect the FE 3 login and restored-session states to protected routes.
- Connect onboarding completion to upload while preserving the selected provider context.
- Connect upload job status to dashboard processing state.
- Connect completed processing to dashboard insight and graph data.
- Connect dashboard insights and nodes to `/conversation/[id]`.
- Preserve auth state through the complete journey.
- Verify logout removes access to protected routes.
- Verify expired or invalid sessions return the user to login and preserve a recoverable destination when appropriate.
- Apply the FE 3 email-confirmation decision to the integration flow if confirmation is approved for this milestone.
- Verify back navigation and direct-route behavior.
- Verify empty, processing, insufficient-data, ready, and error states across route boundaries.
- Run the end-to-end flow against fixtures and a preview backend.

#### Nice to Have

- Add a guided completion state after the first successful import.
- Add a safe retry path for failed processing jobs.

#### Deferred

- Production analytics and activation funnels.
- External user onboarding infrastructure.
- Advanced graph-to-chat navigation history.

#### Excluded / Out of Scope

- Backend pipeline changes.
- New insight kinds.
- Interactive AI behavior outside the selected insight or node context.

### Acceptance Criteria

1. A new user can submit registration details, receive the expected backend response, establish an authenticated session, and enter onboarding.
2. An existing user can log in through the FE 3 backend call and reach the intended authenticated destination.
3. A valid authenticated session can reach onboarding without an unnecessary login loop after registration or page refresh.
4. A user can select ChatGPT or Claude, complete onboarding, and reach upload with the selected provider context preserved.
5. If email confirmation is approved for the milestone, the integrated flow includes the required verification state before protected access; otherwise, the flow does not block users on an unimplemented confirmation step.
6. A user can upload a supported export and see processing progress without manually refreshing the page.
7. A completed job routes the user to a dashboard state that matches the returned data.
8. A dashboard mind map node can open its corresponding conversation context when supported by the backend.
9. A user can move from a conversation back to the dashboard without losing authentication or encountering a blank state.
10. Logout removes access to protected routes, and expired or invalid sessions return the user to login with a recoverable destination when appropriate.
11. The integration check confirms that each feature owner has supplied and tested the API calls, types, fixtures, and endpoint assumptions required by their story.
12. The integrated flow does not display fabricated graph, message, or evidence content when an API response is empty or incomplete.
13. The complete flow is tested on a desktop viewport and a mobile viewport.
14. A preview deployment demonstrates the complete happy path and the primary failure states.

### Technical Notes

- This story verifies the contracts produced by the three feature owners and coordinates any small compatibility fixes; it does not create a replacement shared foundation.
- FE 3 owns the authentication implementation and backend calls; FE 4 verifies route transitions and end-to-end behavior rather than duplicating auth logic.
- Use test fixtures for deterministic end-to-end state coverage, then validate the happy path against a preview backend.
- Record any backend contract mismatch as a separate issue rather than silently adapting around it in the frontend.

### Dependencies

- `[FE 1 - Mind Map] - Build the dashboard empty state and basic mind map`
- `[FE 2 - Chat] - Build the conversation list and conversation UI`
- `[FE 3 - Authentication] - Implement authentication and first-run onboarding`
- Upload and processing API contract

### Open Questions

- **Tech:** What upload status values and progress fields does the backend expose?
- **Product:** Should users land on the dashboard automatically after processing, or receive a completion screen first?
- **Tech:** Which route destination should be preserved when authentication expires during upload processing?
- **Product:** Does the FE 3 email-confirmation decision require an additional integration checkpoint before protected access?

---

## GitHub Labels

Use these labels across story subtasks and bug fixes. Link each issue to its parent story instead of using an FE-specific label.

| Label                         | Description                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `blocked-backend`             | Blocked by a missing or incorrect backend endpoint, response, auth behavior, or contract |
| `blocked-environment`         | Blocked by a local, preview, deployment, dependency, or tooling issue                    |
| `pending-production-decision` | Waiting for a product or scope decision from the PM or project owner                     |
| `pending-design-decision`     | Waiting for a visual, interaction, content, or accessibility decision                    |
| `in-progress`                 | Work has started and is actively being implemented                                       |
| `ready-for-development`       | Requirements and dependencies are clear enough to begin                                  |

## Assignment

- Engineer 1: `[FE 1 - Mind Map]`
- Engineer 2: `[FE 2 - Chat]`
- Ethan: `[FE 3 - Authentication]`
- Johan: Coordinate `[FE 4 - Integration]`, shared route decisions, backend contract questions, and cross-story reviews

## Definition of Done For Every Story

- The story's acceptance criteria are met.
- The implementation is typed and lint-clean.
- Loading, empty, error, and success states are handled where relevant.
- Focused tests pass.
- The feature is documented enough for the next engineer to use.
- A preview deployment or screenshot is attached to the GitHub issue for visual work.
- The story does not introduce direct frontend calls to `nous-ai` or an LLM provider.
- Each feature owner documents and tests the API calls, endpoint assumptions, request and response types, and fixtures required by their own story.
