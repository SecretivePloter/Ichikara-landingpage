const assert = require('assert');
const { _internals } = require('../api/career-submit');

async function run() {
  assert.deepStrictEqual(_internals.adminRecipients('marketing@ichikara.co.id, HR@ichikara.co.id, marketing@ichikara.co.id'), ['marketing@ichikara.co.id', 'hr@ichikara.co.id']);
  assert.deepStrictEqual(_internals.adminRecipients(''), ['marketing@ichikara.co.id']);
  assert.throws(function () { _internals.adminRecipients('email-tidak-valid'); }, /CAREER_ADMIN_EMAILS/);

  const messages = [];
  const resend = { emails: { send: async function (message) { messages.push(message); return { data: { id: 'email-' + messages.length } }; } } };
  const result = await _internals.sendCareerEmails(resend, {
    from: 'PT. Ichikara <marketing@ichikara.co.id>',
    recipients: ['marketing@ichikara.co.id', 'hr@ichikara.co.id'],
    candidate: { fullName: 'Nama <Kandidat>', email: 'candidate@example.com', phone: '+628123', jlptLevel: 'N2' },
    link: 'https://www.ichikara.co.id/career-access.html?token=test'
  });
  assert.strictEqual(messages.length, 2);
  assert.strictEqual(messages[0].to, 'candidate@example.com');
  assert.deepStrictEqual(messages[1].to, ['marketing@ichikara.co.id', 'hr@ichikara.co.id']);
  assert.strictEqual(messages[1].replyTo, 'candidate@example.com');
  assert.match(messages[1].subject, /Lamaran baru Japanese Interpreter/);
  assert.match(messages[1].html, /Nama &lt;Kandidat&gt;/);
  assert.deepStrictEqual(result, { candidateEmailId: 'email-1', adminEmailId: 'email-2' });
  console.log('PASS career email routing');
}

run().catch(function (error) { console.error(error); process.exit(1); });
