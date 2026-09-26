# ComplianceIQ UI Review

Frontend-only review copy of the ComplianceIQ platform for teammate validation.

This repository is separate from the original `MIKASIA04/Compliance-Iq` repository. The current review build is deployed at [repo-review-hazel.vercel.app](https://repo-review-hazel.vercel.app).

## Run locally

```bash
npm install
npm run dev
```

The frontend expects the ComplianceIQ backend at `http://localhost:8000` when the backend is available. It has a safe demo fallback for UI review when the backend is unavailable. Demo values, seeded alerts, and fallback screening responses are interface placeholders—not measured research results.

## Validation scope

- Dashboard statistics, recent alerts, and alert-status summary chart
- Transaction screening, including KYC-verified demo flow
- Alert investigation details and role-specific controls
- SHAP feature-importance view with optional feature explanations
- Admin user management and audit logs
- Compliance assistant UI
- Session and role-based route protection

The Compliance analytics view is intentionally unchanged from the source review work.
