# BlazePlus — Static Portfolio Demo

This is a fully static (HTML/CSS/JS, no backend) conversion of the original
PHP/MySQL BlazePlus app, built for a live portfolio demo.

## How state works here
- App state (login, directory, admin approval queue, transfers, contact
  requests, complaints) lives in `localStorage`, so the demo behaves
  coherently as you click around and even across browser tabs.
- **Chat and announcement messages are never persisted anywhere.** They live
  only in a page-level JS array, so refreshing a chat room wipes it back to
  the seed conversation — exactly like a disposable live demo should.

## Quick start
Open `login.html`. Use the one-click "Log in as Employee / Manager / Senior"
buttons, or any seeded account (`assets/js/demo.js` → `SEED_USERS`, all
passwords are `demo123`). Admin console is at `admin/login.html`
(`admin` / `Admin@123`).

There's also a "Reset demo data" link on the login page if state gets messy
during a demo session.

## What's simulated vs. real
- Signup → verify → admin-approval flow genuinely works end-to-end (admin
  actions taken in `admin/dashboard.html` — even in another tab — are
  reflected back on the waiting screen because both read the same
  `localStorage`). The wait window is shortened to 90s (auto-approves after
  ~18s) so visitors aren't stuck waiting 5 minutes like the real app.
- Image uploads in chat/announcements are read client-side into a data URL
  for preview only — nothing is uploaded anywhere.
- PDF "uploads" in announcements just show the filename (no real file
  handling, since there's no backend).

## Structure
Mirrors the original PHP app's engine/wrapper pattern: `chatroom.html` and
`announcements.html` are the shared "engines"; files like `it.html` or
`hr_announcements.html` are tiny redirects into them with the right
room/department — same idea as the original `include 'chatroom_engine.php'`
wrappers, just done client-side.
