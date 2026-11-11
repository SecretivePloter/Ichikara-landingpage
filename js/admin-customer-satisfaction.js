(function () {
  "use strict";
  const sb = supabase.createClient(
      "https://pfvlxlfykdabrwijqqxa.supabase.co",
      "sb_publishable_C8EWE-TOsXBqzbH2aIjzcg_30Jx8Ove",
    ),
    el = (id) => document.getElementById(id),
    esc = (v) =>
      String(v ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  let offset = 0;
  async function load(reset = true) {
    if (reset) {
      offset = 0;
      el("results").replaceChildren();
    }
    el("notice").textContent = "Memuat…";
    const r = await sb
      .from("ichikara_web_customer_feedback")
      .select("*")
      .order("submitted_at", { ascending: false })
      .order("id")
      .range(offset, offset + 99);
    if (r.error) {
      el("notice").textContent =
        "Data belum tersedia atau akun tidak memiliki akses.";
      return;
    }
    r.data.forEach((row) => {
      const detail = document.createElement("details");
      detail.className = "message";
      const c = CustomerSatisfactionCopy.id;
      detail.innerHTML =
        "<summary>" +
        esc(row.company) +
        " · " +
        esc(row.respondent_name) +
        " · " +
        esc(row.rating) +
        "/5</summary><p>" +
        esc(new Date(row.submitted_at).toLocaleString("id-ID")) +
        " · " +
        esc(row.locale) +
        "</p><p>Interpreter: " +
        esc(row.interpreter_name) +
        "<br>Periode tugas: " +
        esc(row.assignment_date) +
        "</p>" +
        c.aspects
          .map(
            (name, i) =>
              "<p>" +
              esc(name) +
              ": <strong>" +
              esc(row.scores[i]) +
              "/4</strong></p>",
          )
          .join("") +
        '<h3>Kritik</h3><p style="white-space:pre-wrap">' +
        esc(row.criticism) +
        '</p><h3>Saran</h3><p style="white-space:pre-wrap">' +
        esc(row.suggestions) +
        "</p><p>Status email: " +
        esc(row.email_status) +
        "</p><ul>" +
        (row.email_results || [])
          .map((r) => "<li>" + esc(r.to) + ": " + esc(r.status) + "</li>")
          .join("") +
        "</ul>";
      el("results").appendChild(detail);
    });
    offset += r.data.length;
    el("more").hidden = r.data.length < 100;
    el("notice").textContent = offset + " respons ditampilkan.";
  }
  async function show(session) {
    el("login").hidden = !!session;
    el("dashboard").hidden = !session;
    el("logout").hidden = !session;
    if (session) {
      const allowed = await sb
        .from("ichikara_web_feedback_admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (allowed.error || !allowed.data) {
        el("dashboard").hidden = true;
        el("notice").textContent =
          "Akun ini belum memiliki akses feedback customer.";
        return;
      }
      await load();
    }
  }
  el("login").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      r = await sb.auth.signInWithPassword({
        email: f.get("email"),
        password: f.get("password"),
      });
    if (r.error) {
      el("notice").textContent = "Login gagal.";
      return;
    }
    e.target.reset();
    await show(r.data.session);
  };
  el("refresh").onclick = () => load();
  el("more").onclick = () => load(false);
  el("logout").onclick = async () => {
    await sb.auth.signOut();
    el("results").replaceChildren();
    el("notice").textContent = "";
    await show(null);
  };
  sb.auth.getSession().then((r) => show(r.data.session));
})();
