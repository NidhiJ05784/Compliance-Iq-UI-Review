# ComplianceIQ UI Review

Frontend-only review copy of the ComplianceIQ platform for teammate validation.

This repository is separate from the original `MIKASIA04/Compliance-Iq` repository. No deployment is included.

## Run locally

```bash
npm install
npm run dev
```

The frontend expects the ComplianceIQ backend at `http://localhost:8000` when the backend is available. It has a safe demo fallback for UI review when the backend is unavailable.

## Validation scope

- Dashboard and alerts monitoring
- Transaction screening
- Alert investigation details and role-specific controls
- Admin user management and audit logs
- Compliance assistant UI
- Session and role-based route protection

The Compliance analytics view is intentionally unchanged from the source review work.
