# Frontend

React 19 + Vite client for the Registration & Login System.

| | |
| :--- | :--- |
| Framework | React 19 (`react`, `react-dom`) |
| Build tool | Vite 8 (`vite`, `@vitejs/plugin-react`) |
| Linter | Oxlint (`oxlint`) |
| Dev server | http://localhost:5173 |

---

## Getting started

```powershell
npm install
npm run dev
```

The app calls the Spring Boot backend on **http://localhost:8080**.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server with hot module replacement on port 5173. |
| `npm run build` | Builds the production bundle into `dist/`. |
| `npm run preview` | Serves the built bundle locally for a final check. |
| `npm run lint` | Runs Oxlint over the source tree. |

---

## Project layout

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx        # Protected dashboard (profile + account details)
│   │   ├── Login.jsx            # Sign-in form
│   │   ├── Navbar.jsx           # Responsive header
│   │   ├── Register.jsx         # Sign-up form with live password checklist
│   │   ├── ForgotPassword.jsx   # Requests the 6-digit reset OTP
│   │   ├── VerifyOtp.jsx        # OTP verification, yields the single-use reset token
│   │   ├── ResetPassword.jsx    # Sets a new password using the reset token
│   │   └── ChangePassword.jsx   # Sets a new password while authenticated
│   ├── constants/
│   │   └── passwordPolicy.js    # Shared password complexity rule, messages and checklist
│   ├── services/
│   │   └── api.js               # Fetch client, token storage, global 401 handling
│   ├── App.jsx                  # Application state and view routing
│   ├── App.css                  # Custom responsive styles
│   ├── index.css                # Design tokens (colours, spacing, shadows)
│   └── main.jsx                 # React entry point
├── index.html
├── package.json
└── vite.config.js               # Dev server + /api proxy to the backend
```

---

## Session handling

* The JWT is stored in `localStorage` under `auth_token`; the cached profile is stored under
  `auth_user`.
* On startup `App.jsx` calls `GET /profile` to validate the stored token. If the backend answers
  `401` (expired or revoked), the session is cleared and the user is returned to the sign-in view.
* `services/api.js` treats **any** `401` response the same way and notifies the app through the
  unauthorized handler, so a revoked token always returns the user to the login screen.

---

## Password policy

The complexity rule (minimum 8 characters, one uppercase, one lowercase, one digit and one
special character from `@$!%*?&#`) is defined once in
[`src/constants/passwordPolicy.js`](src/constants/passwordPolicy.js) and mirrored on the backend
in `com.example.registrationlogin.util.PasswordPolicy`. Every password field uses the same
placeholder and the same validation message, and the registration form shows a live checklist of
the five rules while the user types.

---

## Proxy configuration

`vite.config.js` proxies `/api` to `http://localhost:8080` during development, so the React app
can use relative URLs and avoid cross-origin requests in the browser.
