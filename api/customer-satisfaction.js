const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");
const copy = require("../js/customer-satisfaction-copy");
const recipients = [
  "marketing@ichikara.co.id",
  "edukasi@ichikara.co.id",
  "translate@ichikara.co.id",
  "it@ichikara.co.id",
];
const table = "ichikara_web_customer_feedback";
function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw Error("invalid");
  const data = {};
  for (const key of [
    "company",
    "name",
    "interpreter",
    "criticism",
    "suggestions",
  ]) {
    if (
      typeof body[key] !== "string" ||
      !body[key].trim() ||
      body[key].length >
        (["criticism", "suggestions"].includes(key) ? 4000 : 160)
    )
      throw Error("invalid");
    data[key] = body[key].trim();
  }
  if (
    !["id", "ja", "en"].includes(body.locale) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.assignmentDate) ||
    new Date(body.assignmentDate + "T00:00:00Z").toISOString().slice(0, 10) !==
      body.assignmentDate
  )
    throw Error("invalid");
  if (
    !Array.isArray(body.scores) ||
    body.scores.length !== 6 ||
    body.scores.some((n) => !Number.isInteger(n) || n < 1 || n > 4) ||
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5 ||
    !/^([a-f0-9]{8}-){1}[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      body.submissionId || "",
    )
  )
    throw Error("invalid");
  return {
    ...data,
    locale: body.locale,
    assignmentDate: body.assignmentDate,
    scores: body.scores,
    rating: body.rating,
    submissionId: body.submissionId,
  };
}
function emailHtml(data) {
  const c = copy.id;
  const rows = [
    [c.fields[0], data.company],
    [c.fields[1], data.name],
    [c.fields[2], data.interpreter],
    [c.fields[3], data.assignmentDate],
    ...c.aspects.map((label, i) => [label, data.scores[i] + " / 4"]),
    [c.fields[4], data.criticism],
    [c.fields[5], data.suggestions],
    [c.fields[6], data.rating + " / 5"],
    ["Bahasa form", data.locale],
  ];
  return (
    '<h2>Feedback Customer PT. Ichikara</h2><table style="border-collapse:collapse">' +
    rows
      .map(
        ([label, value]) =>
          '<tr><th style="text-align:left;padding:10px;border:1px solid #ddd">' +
          escape(label) +
          '</th><td style="padding:10px;border:1px solid #ddd;white-space:pre-wrap">' +
          escape(value) +
          "</td></tr>",
      )
      .join("") +
    "</table>"
  );
}
async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  if (req.body && req.body.website) return res.status(200).json({ ok: true });
  let data;
  try {
    data = validate(req.body);
  } catch (_) {
    return res.status(400).json({ error: "Invalid form data" });
  }
  try {
    if (
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.RESEND_API_KEY ||
      !process.env.CAREER_FROM_EMAIL
    )
      throw Error("missing_configuration");
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );
    const row = {
      id: data.submissionId,
      company: data.company,
      respondent_name: data.name,
      interpreter_name: data.interpreter,
      assignment_date: data.assignmentDate,
      locale: data.locale,
      scores: data.scores,
      rating: data.rating,
      criticism: data.criticism,
      suggestions: data.suggestions,
    };
    const saved = await sb.from(table).insert(row);
    if (saved.error) {
      if (saved.error.code === "23505")
        return res.status(200).json({ ok: true });
      throw saved.error;
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          const r = await resend.emails.send(
            {
              from: process.env.CAREER_FROM_EMAIL,
              to,
              subject:
                "Feedback Customer: " + data.company.replace(/[\r\n]/g, " "),
              html: emailHtml(data),
            },
            { idempotencyKey: "feedback/" + data.submissionId + "/" + to },
          );
          return {
            to,
            id: r.data?.id || null,
            status: r.error ? "failed" : "accepted",
          };
        } catch (_) {
          return { to, status: "failed" };
        }
      }),
    );
    const update = await sb
      .from(table)
      .update({
        email_results: results,
        email_status: results.every((r) => r.status === "accepted")
          ? "accepted"
          : "partial_failure",
      })
      .eq("id", data.submissionId);
    if (update.error) console.error("feedback email status update failed");
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("customer-satisfaction", error.code || "submission_failed");
    return res.status(500).json({ error: "Submission failed" });
  }
}
module.exports = handler;
module.exports.config = { api: { bodyParser: { sizeLimit: "24kb" } } };
module.exports._internals = { validate, emailHtml, recipients };
