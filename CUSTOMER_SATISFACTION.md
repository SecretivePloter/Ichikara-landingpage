# Customer Satisfaction

Public routes: `/customer-satisfaction` (ID), `/jp/customer-satisfaction` (JA), `/en/customer-satisfaction` (EN).
Admin: `/admin/customer-satisfaction.html`, linked from dashboard.

Reference: Google Form `1FAIpQLScV91pJaSUlfAVFiqzd6OkcKSuYaTu2Wuh0XTd7UJDOst1kkQ`, inspected 2026-11-11. Original Indonesian labels, order, six 1–4 scales, required text fields and final 1–5 rating retained. Assignment period is a single date, matching source. No extra customer contact field is collected.

## Flow
Browser -> POST `/api/customer-satisfaction` -> server validation -> private Supabase row -> four separate Resend sends -> per-recipient acceptance/failure stored -> confirmation. The UI confirms storage; email provider acceptance does not prove inbox delivery.

Environment uses existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CAREER_FROM_EMAIL`. Recipient list is fixed server-side to marketing, edukasi, translate and it at ichikara.co.id. Browser cannot override recipients.

## Data and authorization
Tables `ichikara_web_customer_feedback` and `ichikara_web_feedback_admins`. RLS enabled; anon has no table read/write. Server uses service role. Admin select requires explicit membership. Initial migration snapshots existing authenticated website accounts because existing website admin authorizes those accounts; newly registered users do not automatically gain access. Grant/revoke membership through a trusted SQL administrator. No changes to attendance tables.

`email_results` stores per-recipient accepted/failed status. `email_status` is pending, accepted or partial_failure. Duplicate submission UUIDs are not reinserted or resent. Failed sends remain visible to admins; no automatic background resend is claimed. Before operational launch, periodically inspect pending/partial_failure results.

## Verification
`node scripts/test-customer-satisfaction.cjs`
Browser check each language and narrow widths. Verify empty/malformed inputs rejected, all 7 scale groups required, 4 choices on first six and 5 on final rating, success UI only after API response. Never submit unmarked fake customer feedback. Test entries must be labelled TEST.

Do not commit production environment values or private feedback exports.
