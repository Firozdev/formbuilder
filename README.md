# FormBuilder SaaS

A modern, drag-and-drop form builder designed with a SaaS-first architecture. The workspace pairs a real-time form canvas with configurable field settings and a tenant-aware API for persistence.

## Features

- ⚡️ **Interactive drag-and-drop canvas** powered by `@dnd-kit` for snappy field ordering.
- 🎨 **Polished UI** built with Tailwind CSS, animated states, and an Inter-based design system.
- 🧩 **Rich element library** including headings, text fields, dates, dropdowns, and multi-select components.
- 🛠️ **Inline configuration** panel for labels, validation, layouts, and dynamic options.
- 🏢 **SaaS-ready backend** exposing tenant-scoped form persistence with Express and Zod validation.
- 🛡️ **Extensible architecture** using workspaces to separate the front-end app and API service.

## Getting Started

Install dependencies from the repository root:

```bash
npm install
```

Run both the front-end (Vite) and API services simultaneously:

```bash
npm run dev
```

- Front-end: http://localhost:5173
- API service: http://localhost:4000

To build the production assets for the front-end:

```bash
npm run build
```

The API service keeps data in memory for demo purposes. In production, swap the store with a database adapter per tenant.

## SaaS Architecture Notes

- **Tenant context** is generated client-side and sent via the `X-Tenant-ID` header, keeping requests logically isolated.
- **Express service** validates payloads with Zod and can be deployed independently or as a serverless function.
- **Workspace layout** encourages scaling into additional services (analytics, automation) without coupling to the UI.

## Linting

```bash
npm run lint
```

## Version Control

The repository is initialized without a remote by default. To push the code to
your own Git host:

1. Create a new repository (for example on GitHub or GitLab).
2. Run the helper script to configure the remote and push the current branch:

   ```bash
   ./scripts/push.sh <your-repo-url> [branch]
   ```

   - If `[branch]` is omitted the script automatically pushes whichever branch
     you have checked out (for example `work`).
   - The script creates or updates the `origin` remote and sets the upstream so
     future `git push` commands work without extra arguments.

Alternatively, you can run the underlying Git commands manually (`git remote add`
followed by `git push -u origin <branch>`).

## License

MIT
