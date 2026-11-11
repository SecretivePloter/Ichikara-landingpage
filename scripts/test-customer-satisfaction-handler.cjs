// Exercise complete handler persistence and four-recipient dispatch without sending test mail.
const Module = require("module"),
  assert = require("node:assert/strict"),
  crypto = require("crypto");
let inserted = [],
  sent = [],
  updates = [],
  duplicate = false,
  failMail = false;
const original = Module._load;
Module._load = function (name, parent, isMain) {
  if (name === "@supabase/supabase-js")
    return {
      createClient: () => ({
        from: () => ({
          insert: async (row) => {
            inserted.push(row);
            return { error: duplicate ? { code: "23505" } : null };
          },
          update: (row) => ({
            eq: async () => {
              updates.push(row);
              return { error: null };
            },
          }),
        }),
      }),
    };
  if (name === "resend")
    return {
      Resend: class {
        constructor() {
          this.emails = {
            send: async (message) => {
              sent.push(message);
              return failMail
                ? { error: { message: "test failure" } }
                : { data: { id: crypto.randomUUID() } };
            },
          };
        }
      },
    };
  return original.apply(this, arguments);
};
const handler = require("../api/customer-satisfaction");
Module._load = original;
for (const key of [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "CAREER_FROM_EMAIL",
])
  process.env[key] = "test-only";
const data = {
  submissionId: crypto.randomUUID(),
  locale: "en",
  company: "TEST ONLY",
  name: "Test",
  interpreter: "Test",
  assignmentDate: "2026-11-11",
  scores: [1, 2, 3, 4, 1, 2],
  rating: 5,
  criticism: "Test",
  suggestions: "Test",
};
async function request(body, method = "POST") {
  const res = {
    setHeader() {},
    status(n) {
      this.statusCode = n;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await handler({ method, body }, res);
  return res;
}
(async () => {
  assert.equal((await request(data)).statusCode, 201);
  assert.equal(inserted.length, 1);
  assert.equal(sent.length, 4);
  assert.equal(updates[0].email_status, "accepted");
  assert.equal((await request({ ...data, rating: 8 })).statusCode, 400);
  assert.equal(sent.length, 4);
  duplicate = true;
  assert.equal((await request(data)).statusCode, 200);
  assert.equal(sent.length, 4);
  duplicate = false;
  failMail = true;
  assert.equal(
    (await request({ ...data, submissionId: crypto.randomUUID() })).statusCode,
    201,
  );
  assert.equal(updates[1].email_status, "partial_failure");
  assert.equal((await request({}, "GET")).statusCode, 405);
  console.log(
    "PASS handler storage, recipient routing, invalid input, duplicates, email failure tracking, method restriction",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
