# myGameLog — Technical Architecture Analysis

This document is a code-level technical review of the myGameLog project, a social game-logging
application (a "Letterboxd for video games"). It is written to support a university thesis: it
describes the system as it actually exists in the repository, backs every claim with concrete file
references, and closes with a prioritized set of improvements suitable for a "future work" section.

Scope reviewed: the Express/Mongoose API under `api/` and the React/Vite client under `client/`.
All references use `path:line` form relative to the repository root.

---

## Executive summary

| Dimension | Assessment |
|-----------|------------|
| Overall architecture | Layered MERN split into `api/` and `client/`, deployed as a Vercel serverless function. Sound at the macro level; weakened by dead boilerplate and an inconsistent client data layer. |
| Separation of concerns | Good on the server: routes -> controllers -> services -> models. The score-aggregation service layer is the strongest design decision in the codebase. |
| API design | RESTful and mostly consistent, but authentication uses a non-standard custom `token` header and error response shapes vary between `{ error }` and `{ message }`. |
| Data model | Reasonable use of refs; several denormalized counters and relationship arrays with no transactional protection and no cascade-on-delete, creating integrity risk. |
| Error handling | Per-controller `try/catch` is uniform, but there is no global error middleware, error shapes are inconsistent, and internal error objects leak to clients in places. |
| Client structure | Clean atomic-ish organization (views/components/contexts/hooks), but the HTTP layer is split between an authenticated Axios instance and raw `axios` calls, and several hooks/components target endpoints that do not exist. |
| Testing / CI | Zero automated tests in either tier; no CI; no `.env.example`. |

The project demonstrates solid instincts (server-side API-key proxying, O(1) score aggregation,
regex escaping, serverless connection caching) undermined by accumulated inconsistency and dead
code typical of an iteratively-built student project.

---

## 1. Architecture quality

### 1.1 Macro structure

The system is a two-tier MERN application:

- `api/` — Express 4.21 + Mongoose 8.8 (`api/package.json:14`), ES modules (`"type": "module"`, `api/package.json:5`).
- `client/` — React 18.3 + Vite 5.4 + Sass (`client/package.json`).

The server is deliberately structured for **Vercel serverless deployment**. `api/vercel.json`
routes every request (`/(.*)`) to `index.js`, which re-exports the Express app
(`api/index.js:1-3`). The app only opens a listening socket when running outside Vercel:

```
if (!process.env.VERCEL) { app.listen(port, ...) }   // api/app.js:45-50
export default app;                                  // api/app.js:52
```

This is the correct pattern for serverless Express and was recently fixed (the app is always
exported, and `app.listen` is gated). Locally it runs under `nodemon app.js`
(`api/package.json:9`).

### 1.2 Server layering and separation of concerns

The server follows a clean, conventional layering:

```
routes/*         HTTP surface + middleware wiring
  -> controllers/*   request/response handling, validation, authz checks
    -> services/*      domain logic (score aggregation)
      -> models/*        Mongoose schemas
```

Routes are thin and declarative (e.g. `api/routes/postRoutes.js`,
`api/routes/playlistRoutes.js`) and are aggregated through a barrel file
(`api/routes/index.js`) then mounted in `api/app.js:39-44`.

The standout architectural decision is the **`gameScoreService`** (`api/services/gameScoreService.js`).
Instead of recomputing a game's average rating by scanning all posts, it maintains an aggregate
`GameScore` document with `scoreSum` / `totalReviews` and mutates it incrementally on review
create/update/delete:

```
onReviewCreated -> $inc totalReviews, scoreSum ; recompute average   // gameScoreService.js:5-13
onReviewUpdated -> scoreSum - old + new                              // gameScoreService.js:15-22
onReviewDeleted -> decrement with Math.max(0, ...) floors           // gameScoreService.js:24-31
```

The post controller calls these hooks after each mutation (`api/controllers/postController.js:10,46,63`).
This is genuinely good design: O(1) read/write instead of O(n) aggregation, and it keeps the
domain rule (how a score is derived) out of the controller. Its weakness is discussed in
Sections 4 and 5 (no transaction linking the `Post` write to the `GameScore` write).

### 1.3 Serverless connection management

Database connectivity is handled by a cached-connection helper (`api/db/mongoose.js`) invoked by a
per-request middleware (`api/app.js:24-31`). The connection promise is memoized on
`global.mongoose` so warm serverless invocations reuse the socket, and `bufferCommands: false`
prevents queries from silently queueing against a dead connection:

```
let cached = global.mongoose ?? { conn: null, promise: null };   // db/mongoose.js:3-7
if (cached.conn) return cached.conn;                             // db/mongoose.js:10
```

This is the recommended Mongoose-on-serverless pattern and is implemented correctly.

### 1.4 Coupling points

- **Controllers -> external API.** `gameController` couples directly to RAWG via Axios
  (`api/controllers/gameController.js:7,26,48`). Acceptable, but there is no service abstraction,
  no caching, and no timeout, so RAWG latency/outages propagate straight to the client.
- **Controller -> service -> model** coupling for scoring is clean and one-directional.
- **Cross-model coupling by manual array maintenance.** Follow/unfollow and favorites mutate two
  documents by hand (`api/controllers/users_controller.js:291-295, 315-319`) with no transaction —
  a coupling that is invisible in the type system and only enforced by convention.

### 1.5 Dead code and boilerplate (a recurring theme)

The repository carries a substantial amount of inherited kanban-template code that is never used
by the product:

- `/projects` and `/tasks` routers are still mounted (`api/app.js:43-44`) and backed by
  `projects_controller.js` / `tasks_controller.js` and `models/projects.js` / `models/tasks.js`
  (`api/controllers/projects_controller.js:1-2`).
- `chat_routes.js`, `messages_routes.js`, `randomRoutes.js` exist; `randomRoutes` is even exported
  from the barrel (`api/routes/index.js:6`) but **never mounted** in `app.js`. `chat`/`messages`
  routers are neither mounted nor exported.
- The root route still identifies the app as a kanban leftover: `res.send("kanban database")`
  (`api/app.js:37`).
- `api/services/userService.js` is a **misplaced client-side file inside the server**: it uses
  `import.meta.env.VITE_API_URL` (`api/services/userService.js:3`), a Vite-only construct, and
  references an undefined `api` object (`api/services/userService.js:25`). It is dead and would
  throw if ever imported by the server.

Dead code inflates the attack surface (the `/projects` and `/tasks` endpoints are live and
unauthenticated) and misleads any reader trying to understand the system.

---

## 2. Component structure (client)

### 2.1 Organization

The client uses a clear, scalable folder taxonomy under `client/src`:

- `views/` — page-level components (Home, Feed, Login, Register, GameDetails, Profile, Protected, App).
- `components/` — reusable UI (Navbar, Review, Modal, Loader, Favorite, plus feature modals like
  `FollowersModal`, `AddToPlaylistModal`, `PlaylistDetailModal`, `ProfileEditModal`).
- `contexts/` — `AuthContext`.
- `hooks/` — one custom hook per API interaction.
- `api/` — the shared Axios instance.

Components and views each live in their own `index.jsx` folder, and a barrel re-exports the public
component set (`client/src/components/index.js`). Path aliasing (`@/...`) is used consistently
(`client/src/main.jsx:5-7`). Styling is SCSS, imported once globally (`import "@/styles/index.scss"`,
`client/src/main.jsx:7`) using BEM-style class names (e.g. `navbar__search__result`,
`client/src/components/Navbar/index.jsx:67`). There is no CSS-in-JS and no component-scoped styling.

### 2.2 Routing and route protection

Routing is declared centrally in the `App` view (`client/src/views/App/index.jsx:23-34`). Protected
routes are wrapped by a `Protected` layout route that renders an `Outlet` or redirects to `/login`
based on the presence of the auth token (`client/src/views/Protected/index.jsx:6-11`):

```
return authenticated.token ? <Outlet /> : <Navigate to="/login" />;
```

**Weaknesses:**
- Protection is presence-only. It checks that *a* token exists in context; it does not verify
  expiry or validity. An expired token still passes the client gate (the server will reject it, but
  the UX is a failed request rather than a redirect).
- Only `/profile/:id` and `/profile/username/:username` are protected. `/game-details` and the
  review-writing UI are outside the protected tree; server-side `verificarToken` is the only real
  guard.
- `/game-details` takes its id from a query string (`navigate(\`/game-details?id=${id}\`)`,
  `client/src/components/Favorite/index.jsx:20`) rather than a path param, which is inconsistent
  with the rest of the routing scheme.

### 2.3 State management via context

Global auth state lives in `AuthContext` (`client/src/contexts/AuthContext.jsx`). It decodes the
JWT from the `jwToken` cookie and exposes `{ user, setUser, auth, logoutUser }`.

Two real issues here:

1. **Non-reactive effect dependency.** The provider re-derives the user inside a `useEffect` whose
   dependency array is `[Cookies.get("jwToken")]` (`client/src/contexts/AuthContext.jsx:22`).
   Cookies are not reactive, so this reads the cookie at render time and does not reliably re-run on
   login/logout. Login works only because `useLogin` imperatively calls `setUser` after setting the
   cookie (`client/src/hooks/useLogin.jsx:35-41`) — the context effect is effectively decorative.
   The author even flags this with an inline comment ("aunque cookies no sea reactiva...").
2. **Duplicated auth logic.** A second, standalone `useAuth` hook (`client/src/hooks/useAuth.jsx`)
   decodes the same cookie independently and uses the **default** `jwt-decode` import, whereas
   `AuthContext` uses the **named** `{ jwtDecode }` import (`client/src/contexts/AuthContext.jsx:2`
   vs `client/src/hooks/useAuth.jsx:1`). Two sources of truth for "who is logged in."

### 2.4 The custom-hooks data pattern

The dominant client pattern is **one hook per endpoint**, each returning a small state machine
`{ state: idle|loading|success|error, data, error, <action> }` (e.g.
`client/src/hooks/usePostReview.jsx:12-47`, `client/src/hooks/useGetGames.jsx:4-33`). This is
consistent and readable, and it keeps components declarative.

However, the pattern is applied **inconsistently at the transport layer**, which is the single
biggest structural problem on the client:

- Some hooks use the shared authenticated Axios instance `@/api/axiosInstance`, which injects the
  `token` header via a request interceptor (`client/src/api/axiosInstance.js:8-14`). Examples:
  `usePostReview.jsx:2`, `useToggleLike.jsx:2`, `useFollowUser.jsx:1`.
- Other hooks import raw `axios` and hand-build the URL from `import.meta.env.VITE_API_URL` with
  **no auth header at all**: `useGetGames.jsx:2,15`, `useLogin.jsx:3,21`,
  `useGetUser.jsx`, `useGetReviews.jsx`, etc.

For public reads (game search, login) the raw calls are harmless. But the inconsistency has already
produced **broken, unreachable features**:

- `useGetFollowers` reads the cookie under the wrong name (`cookies.get("jwtToken")`, actual name is
  `jwToken`), sends `Authorization: Bearer <token>` (the server reads the custom `token` header, not
  `Authorization`), and calls `GET /users/:userId/followers` — an endpoint that **does not exist**
  in `users_routes.js` (`client/src/hooks/useGetFollowers.jsx:17-19`). Triply broken.
- The `Favorite` component POSTs to `/users/favorite` (singular) with no token
  (`client/src/components/Favorite/index.jsx:27-38`), but the real route is `POST /users/favorites`
  (plural) behind `verificarToken` (`api/routes/users_routes.js:26`). The working favorites flow
  goes through a different hook; this component's toggle is dead.

There is no React Query / SWR, so there is no request caching, deduplication, or
retry, or background revalidation; every hook re-fetches from scratch and manages its own loading flags.

---

## 3. API design

### 3.1 Resource modeling and route organization

The API models resources REST-fully and groups them by mount prefix (`api/app.js:39-44`):

| Prefix | Resource | Router |
|--------|----------|--------|
| `/users` | users, auth, follows, favorites, images | `routes/users_routes.js` |
| `/posts` | reviews, likes, scores | `routes/postRoutes.js` |
| `/games` | RAWG proxy (search/detail/random) | `routes/gameRoutes.js` |
| `/playlists` | playlists and their games | `routes/playlistRoutes.js` |
| `/projects`, `/tasks` | dead kanban boilerplate | `routes/projects.js`, `routes/tasks.js` |

Route ordering is handled carefully where it matters: in `postRoutes.js` the static paths
(`/latest`, `/user/:userId`, `/score/:gameId`) are declared **before** the catch-all `/:gameId`
(`api/routes/postRoutes.js:19-26`) to avoid the dynamic segment shadowing them. The playlist router
is neatly aligned and models sub-resources correctly (`POST /:id/games`,
`DELETE /:id/games/:gameId`, `api/routes/playlistRoutes.js:20-21`).

**Inconsistencies:**
- Verb/URL conventions drift. Users are fetched via `GET /users/find/:userId` and
  `GET /users/find/username/:username` (`api/routes/users_routes.js:12-13`) rather than
  `GET /users/:userId`. Mutations use verb-in-path style: `PUT /users/update/:userId`,
  `POST /users/change-password/:userId`, `POST /users/follow/:id`
  (`api/routes/users_routes.js:22-25`). This mixes RESTful and RPC-ish styles.
- Follow/unfollow use `POST` for both directions (`follow`/`unfollow`) where a single toggle or a
  `DELETE` would be more idiomatic.

### 3.2 Authentication scheme

Auth is a custom JWT scheme:

- Login signs a JWT embedding a `usuario` claim and returns it in the body
  (`api/controllers/users_controller.js:125-139`).
- The client stores it in a **cookie** via `js-cookie` with a 3-day expiry
  (`client/src/hooks/useLogin.jsx:29`) — a non-HttpOnly, JS-readable cookie.
- Protected requests carry the token in a **custom `token` header**, not the standard
  `Authorization: Bearer` header. The middleware reads `req.get('token')`, verifies it against
  `process.env.SEED`, and attaches `req.usuario` (`api/middlewares/auth.js:5-19`). CORS explicitly
  allow-lists the `token` header (`api/app.js:19`).

**Assessment.** The mechanism works, but it departs from conventions in ways that create the exact
bugs seen in Section 2.4 (client code that assumes `Authorization: Bearer`). Because the JWT is
stored in a JS-readable cookie and also decoded client-side for display
(`AuthContext.jsx:15-21`), it is exposed to XSS; an HttpOnly cookie plus a `/me` endpoint would be
safer. Authorization checks are done ad hoc inside controllers by comparing
`req.usuario._id` to the target id (e.g. `api/controllers/users_controller.js:168`,
`api/controllers/postController.js:35,59`, `api/controllers/playlistController.js:43`) — correct,
but repeated in every handler rather than centralized.

### 3.3 Status codes and response shapes

Status-code usage is mostly correct and thoughtful:

- `201` on resource creation (`postController.js:11`, `playlistController.js:14`).
- `400` for validation, `401` for auth failure, `403` for authorization failure, `404` for missing,
  `409` for unique-constraint conflicts (`postController.js:14`, `users_controller.js:190`),
  `500` for unexpected errors.

The main weakness is **inconsistent success/error envelopes**:

- Error bodies alternate between `{ error: "..." }` (`postController.js`, `gameController.js`) and
  `{ message: "..." }` (`playlistController.js`, parts of `users_controller.js`). Some send both
  (`{ error, msj }`, `users_controller.js:117`).
- Success bodies vary: sometimes a bare document (`res.json(newPost)`, `postController.js:11`),
  sometimes a wrapper (`{ user: userData }`, `users_controller.js:99`), sometimes a mixed payload
  (`{ message, imageUrl, user }`, `users_controller.js:227-231`).

A client cannot rely on a single field to read an error message, which is why client error handling
(Section 5) is shallow.

### 3.4 The RAWG proxy pattern

The `/games` endpoints proxy RAWG server-side so the API key never reaches the browser. The key is
read from `process.env.API_KEY` and attached as a query param on the server
(`api/controllers/gameController.js:8,29,50`). This is the correct place to keep a third-party
secret and is one of the better decisions in the codebase.

Gaps: no request timeout, no retry, no caching (identical searches hit RAWG every time), and
`getRandomGamesController` derives a random page from a hardcoded `maxPages = 100`
(`gameController.js:44`) with no guard against RAWG returning fewer pages.

---

## 4. MongoDB schemas

Five active models: `Users`, `Post`, `Playlist`, `GameScore` (plus the dead `projects`/`tasks`).

### 4.1 `Users` (`api/models/users_model.js`)

```
email    String  required unique lowercase
username String  required unique lowercase
name     String  required
password String  required            (bcrypt hash, users_controller.js:93)
imagen / bannerImage / bio (bio maxlength 160)
followers [ObjectId -> Users]
following [ObjectId -> Users]
favorites [ObjectId -> Post]
```

- Good: uniqueness + lowercasing on `email`/`username` prevents duplicate-casing accounts; `bio`
  length is validated at the schema level (`users_model.js:35`).
- Relationships are modeled as **ref arrays**. `followers`/`following` are bidirectional and must be
  kept in sync manually across two saves (`users_controller.js:291-295`). There is no transaction,
  so a crash between the two `save()` calls leaves an asymmetric graph (A follows B, but B has no
  follower A).
- `followersCount`/`followingCount` are **not stored**; they are computed on read from array length
  (`users_controller.js:38-39`). Correct, but it means every profile read populates and counts the
  full arrays — fine at small scale, unbounded at large scale.
- No timestamps on the user schema (unlike Playlist/GameScore).

### 4.2 `Post` (reviews) (`api/models/Post.js`)

```
gameId String required          (RAWG id, stored as string)
gameName / imageUrl String required
userId ObjectId -> Users required
content String required
rating Number min 0 max 10
likes [ObjectId -> Users]
createdAt Date default now
unique index { userId: 1, gameId: 1 }   // Post.js:38
```

- Excellent: the compound unique index enforces the core product rule "one review per user per game"
  at the database level, and the controller translates the resulting `11000` error into a friendly
  `409` (`postController.js:13-15`).
- `rating` is optional (no `required`), so a review can be saved with `rating: undefined`; the score
  service compensates with `rating ?? 0` (`postController.js:10`), but a missing rating still counts
  as a review of value 0 in the aggregate, skewing averages.
- `likes` is an unbounded embedded array of user ids. Toggling a like rewrites the whole array and
  saves the document (`postController.js:88-94`); under concurrency this is a lost-update hazard
  (read-modify-write without atomic `$addToSet`/`$pull`).
- `gameName`/`imageUrl` are **denormalized copies** of RAWG data frozen at review time. If RAWG
  updates cover art or a title, reviews keep the stale value.

### 4.3 `Playlist` (`api/models/Playlist.js`)

```
userId ObjectId -> Users required
name String required maxlength 50
description String maxlength 200
games [ gameItemSchema { gameId, gameName, imageUrl, addedAt } ]  (_id: false)
timestamps: true
```

- Good modeling: games are **embedded** subdocuments (`_id: false`), appropriate because a
  playlist entry has no identity outside its playlist. Duplicate prevention is enforced in the
  controller (`playlistController.js:84-86`).
- The embedded `games` array is unbounded and, like `likes`, mutated by read-modify-write
  (`playlistController.js:88-89, 103`), so concurrent adds can race.

### 4.4 `GameScore` (`api/models/GameScore.js`)

```
gameId String required unique
averageScore / totalReviews / scoreSum Number default 0
timestamps: true
```

- The aggregate design (Section 1.2) is the schema's strength: `scoreSum` makes average maintenance
  O(1). The `unique` index on `gameId` plus `upsert` on create is correct
  (`gameScoreService.js:6-10`).
- The integrity risk is that `GameScore` is only ever mutated through the service hooks. There is
  **no transaction** binding a `Post` insert to the `GameScore` `$inc`. If `onReviewCreated` fails
  after the post is saved (`postController.js:9-10`), the review exists but is not reflected in the
  aggregate, and the two stores drift with no reconciliation job to heal them.

### 4.5 Cross-cutting data-integrity concerns

- **No cascade on delete.** Deleting a `Post` does not remove that post id from any user's
  `favorites` array (`postController.js:54-64`) -> orphaned favorite references. There is no user
  deletion path at all, but if one were added, it would strand posts, playlists, follower entries,
  and scores.
- **No transactions anywhere.** Every multi-document mutation (follow, unfollow, review+score,
  favorite toggle) is a sequence of independent writes. Mongo supports multi-document transactions
  on replica sets; none are used.
- **`gameId` as `String`.** All game references are RAWG string ids, so `.populate('gameId', ...)`
  in `showPostsById` (`postController.js:73`) is a no-op — `gameId` is not a ref and cannot be
  populated; that populate silently returns the raw string.

---

## 5. Error handling

### 5.1 Server pattern

Every controller wraps its body in `try/catch` and responds with a status + JSON on failure. The
pattern is applied uniformly (see any handler in `postController.js`, `playlistController.js`,
`users_controller.js`). Validation guards run before the DB work (`users_controller.js:76-87`,
`playlistController.js:6`), and the unique-constraint `11000` code is caught and mapped to `409`
in two places (`postController.js:13`, `users_controller.js:189`). That is a good, deliberate touch.

**Weaknesses:**

1. **No global error handler.** Express supports a 4-arg error middleware `(err, req, res, next)`;
   there is none registered in `api/app.js`. The connection middleware forwards failures with
   `next(error)` (`api/app.js:29`), but with no terminal error handler those fall through to
   Express's default HTML error page instead of a JSON response — a client expecting JSON gets HTML
   on DB-connection failure.
2. **Inconsistent error envelopes** (already covered in 3.3): `{ error }` vs `{ message }` vs
   `{ error, msj }`.
3. **Internal detail leakage.** Several handlers return the raw error object to the client:
   `res.status(400).json({ error })` (`users_controller.js:43`),
   `res.status(500).json({ message: "...", error })` (`users_controller.js:354`,
   `postController.js:76`), and login concatenates the error into the response string
   `'server error' + err` (`users_controller.js:141`). This can expose stack/DB internals.
4. **Repetition.** The same authz-check-and-`try/catch` skeleton is copy-pasted across ~30 handlers.
   A shared `asyncHandler` wrapper plus centralized error middleware would remove all of it.
5. **Logging is `console.log`/`console.error` only** (`auth.js:8`, `gameController.js:13`, etc.) —
   no structured logging, no levels, no correlation ids.

### 5.2 Client pattern

Client error handling is shallow and inconsistent:

- The state-machine hooks capture the error into state and stop: `catch (error) { setX({ state:
  "error", error }) }` (`useGetGames.jsx:22`, `useLogin.jsx:44`). Whether that error is ever shown
  to the user depends on each view; there is no shared error toast/boundary.
- Some hooks only `console.error` and swallow (`Favorite/index.jsx:41-43`,
  `useGetFollowers.jsx:29`).
- Because server error shapes are inconsistent (3.3), no hook can reliably extract a human message;
  they surface the raw Axios error instead.
- There is **no React error boundary** anywhere in the tree (`main.jsx`, `App/index.jsx`), so a
  render-time exception blanks the whole app.

---

## 6. Prioritized improvement recommendations

Ranked P0 (do first / correctness & security) -> P2 (polish). Effort is rough
(S < 0.5 day, M ~1-2 days, L > 2 days). This section is written to double as a thesis "future work"
roadmap.

### P0 — correctness, integrity, security

| # | Recommendation | Rationale / evidence | Effort | Impact |
|---|----------------|----------------------|--------|--------|
| P0-1 | **Remove dead kanban code and unmount `/projects` & `/tasks`.** Delete the boilerplate controllers/models/routes, unmount them in `app.js:43-44`, drop `chat`/`messages`/`random` routers and the misplaced `api/services/userService.js`, and fix the root route string (`app.js:37`). | Live, unauthenticated endpoints and dead files enlarge attack/maintenance surface and mislead readers. | S | High |
| P0-2 | **Add a global Express error middleware + normalize the error envelope.** One terminal `(err, req, res, next)` handler returning `{ error: { code, message } }`, plus an `asyncHandler` wrapper. Stop leaking raw error objects (`users_controller.js:43,141,354`). | No terminal handler means `next(error)` from `app.js:29` yields HTML; inconsistent shapes break client parsing. | M | High |
| P0-3 | **Make review + score updates transactional (or reconcilable).** Wrap `Post` write and `GameScore` `$inc` in a Mongo transaction, or add a reconciliation job. Same for follow/unfollow (`users_controller.js:291-319`) and favorite toggles. | Multi-doc writes with no transaction drift permanently on partial failure (Sections 4.4/4.5). | M | High |
| P0-4 | **Fix the broken client auth/data paths.** Repair `useGetFollowers` (wrong cookie name, `Authorization` vs `token`, nonexistent endpoint) and the `Favorite` component (`/users/favorite` vs `/users/favorites`, missing token). Route **all** authenticated calls through `@/api/axiosInstance`. | These features are silently dead (Section 2.4); the split transport layer is the root cause. | M | High |
| P0-5 | **Harden the token.** Move the JWT to an HttpOnly cookie and add a `GET /users/me` endpoint instead of decoding the token in the browser (`AuthContext.jsx:15-21`). Fail the `Protected` guard on expiry, not just presence. | JS-readable token + client-side decode is XSS-exposed; presence-only guard lets expired sessions through (Sections 2.2/3.2). | M | High |

### P1 — consistency, robustness, maintainability

| # | Recommendation | Rationale / evidence | Effort | Impact |
|---|----------------|----------------------|--------|--------|
| P1-1 | **Introduce automated tests + CI.** Start with Jest/Vitest + Supertest on the API (auth, one-review-per-game index, score math) and React Testing Library on key hooks. Add a CI workflow. | Zero tests today (`api/package.json:8`); the score service and unique index are exactly the invariants worth locking down. | L | High |
| P1-2 | **Centralize authorization.** Replace the repeated `req.usuario._id === target` checks with an `authorizeOwner` middleware. | Ownership logic is duplicated across ~10 handlers (`postController.js:35,59`, `playlistController.js:43,63`, `users_controller.js:168,203`). | M | Medium |
| P1-3 | **Make array mutations atomic.** Use `$addToSet`/`$pull` for `likes`, `followers/following`, and `favorites` instead of read-modify-write-save (`postController.js:88-94`, `users_controller.js:338-346`). | Removes lost-update races on concurrent likes/follows. | S | Medium |
| P1-4 | **Standardize REST verbs/URLs.** Normalize to `GET /users/:id`, `PUT /users/:id`, and use a single toggle or `DELETE` for follows. | Current mix of `/find/...`, `/update/...`, dual `POST` follow/unfollow is inconsistent (Section 3.1). | M | Medium |
| P1-5 | **Adopt React Query (or SWR) on the client.** Replace the ~20 hand-rolled `{state,data,error}` hooks with cached, deduplicated queries/mutations. | Eliminates duplicated boilerplate and the authenticated/raw-axios split, and adds caching/retry the app currently lacks. | L | Medium |
| P1-6 | **Fix `AuthContext` reactivity and de-duplicate auth.** Drive auth state from an explicit signal (state/event), not `[Cookies.get(...)]` (`AuthContext.jsx:22`), and remove the parallel `useAuth` hook. | Two sources of truth + a non-reactive effect are latent bugs (Section 2.3). | S | Medium |
| P1-7 | **Harden the RAWG proxy.** Add Axios `timeout`, a small retry, and short-TTL caching for search/detail; guard `maxPages` (`gameController.js:44`). | Removes single-point latency/outage coupling and cuts redundant external calls (Section 3.4). | M | Medium |

### P2 — polish and hardening

| # | Recommendation | Rationale / evidence | Effort | Impact |
|---|----------------|----------------------|--------|--------|
| P2-1 | **Add `.env.example` + config validation.** Document `MONGO_URI`, `SEED`, `EXPIRATION`, `API_KEY`, `CLOUDINARY_*`, `VITE_API_URL`; validate on boot. | No env template exists; secrets are discoverable only by reading code. | S | Medium |
| P2-2 | **Require `rating` on reviews or exclude null ratings from the aggregate.** | Optional `rating` (`Post.js:25`) lets `?? 0` skew averages (Section 4.2). | S | Medium |
| P2-3 | **Add a React error boundary + a shared error/toast surface.** | A render exception currently blanks the app; hook errors are inconsistently shown (Section 5.2). | S | Medium |
| P2-4 | **Add structured logging.** Replace `console.*` with a leveled logger and drop noisy logs (`auth.js:8`). | Improves observability on serverless. | S | Low |
| P2-5 | **Add pagination.** Feed is hardcoded to the latest 10 (`postController.js:104-106`); search users to 10 (`users_controller.js:158`). | Fixed limits will not scale as data grows. | M | Low |
| P2-6 | **Add DB indexes for hot queries.** Index `Post.gameId`, `Post.userId`, `Post.createdAt` (feed sort), and `Playlist.userId`. | These fields drive every list query and are currently unindexed except the compound unique. | S | Medium |

---

## Appendix — key file map

| Concern | File(s) |
|---------|---------|
| App entry / serverless | `api/index.js`, `api/app.js`, `api/vercel.json` |
| DB connection | `api/db/mongoose.js` |
| Auth | `api/middlewares/auth.js`, `client/src/contexts/AuthContext.jsx`, `client/src/api/axiosInstance.js` |
| Score aggregation | `api/services/gameScoreService.js`, `api/models/GameScore.js`, `api/controllers/postController.js` |
| RAWG proxy | `api/controllers/gameController.js`, `api/routes/gameRoutes.js` |
| Models | `api/models/{users_model,Post,Playlist,GameScore}.js` |
| Client routing | `client/src/views/App/index.jsx`, `client/src/views/Protected/index.jsx` |
| Dead code | `api/controllers/{projects_controller,tasks_controller}.js`, `api/routes/{projects,tasks,chat_routes,messages_routes,randomRoutes}.js`, `api/services/userService.js` |
