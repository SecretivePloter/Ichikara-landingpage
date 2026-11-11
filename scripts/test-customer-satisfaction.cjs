const assert = require("node:assert/strict");
const { validate, emailHtml, recipients } =
  require("../api/customer-satisfaction")._internals;
const crypto = require("crypto");
const input = {
  submissionId: crypto.randomUUID(),
  locale: "ja",
  company: "TEST <company>",
  name: "Test",
  interpreter: "Interpreter",
  assignmentDate: "2026-11-11",
  scores: [1, 2, 3, 4, 2, 3],
  rating: 5,
  criticism: "Test criticism",
  suggestions: "Test suggestions",
};
assert.equal(validate(input).rating, 5);
for (const patch of [
  { scores: [1, 2, 3, 4, 5, 1] },
  { scores: [1, 2] },
  { rating: 0 },
  { rating: "5" },
  { company: "" },
  { assignmentDate: "2026-02-30" },
  { locale: "fr" },
  { submissionId: "bad" },
  { criticism: "a".repeat(4001) },
])
  assert.throws(() => validate({ ...input, ...patch }));
assert.ok(emailHtml(input).includes("&lt;company&gt;"));
assert.deepEqual(recipients, [
  "marketing@ichikara.co.id",
  "edukasi@ichikara.co.id",
  "translate@ichikara.co.id",
  "it@ichikara.co.id",
]);
for (const lang of ["id", "en", "ja"]) {
  const c = require("../js/customer-satisfaction-copy")[lang];
  assert.equal(c.aspects.length, 6);
  assert.equal(c.fields.length, 7);
}
console.log(
  "PASS validation, bounds, dates, escaping, recipients, translations",
);
