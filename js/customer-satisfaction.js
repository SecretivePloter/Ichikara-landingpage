(function () {
  "use strict";
  const lang = document.documentElement.lang,
    c = window.CustomerSatisfactionCopy[lang],
    form = document.getElementById("survey"),
    root = document.getElementById("survey-fields");
  document.querySelector(".intro").textContent = c.intro;
  document.querySelector(".note").textContent = c.required;
  document.getElementById("send").textContent = c.submit;
  function field(name, label, type) {
    const l = document.createElement("label");
    l.textContent = label;
    const input = document.createElement(
      type === "textarea" ? "textarea" : "input",
    );
    input.name = name;
    if (type !== "textarea") input.type = type;
    input.required = true;
    if (type !== "date") input.maxLength = type === "textarea" ? 4000 : 160;
    l.appendChild(input);
    return l;
  }
  const grid = document.createElement("div");
  grid.className = "fields";
  grid.append(
    field("company", c.fields[0], "text"),
    field("name", c.fields[1], "text"),
  );
  root.appendChild(grid);
  const heading = document.createElement("h2");
  heading.textContent = c.section;
  root.appendChild(heading);
  const details = document.createElement("div");
  details.className = "fields";
  details.append(
    field("interpreter", c.fields[2], "text"),
    field("assignmentDate", c.fields[3], "date"),
  );
  root.appendChild(details);
  function scale(name, label, max) {
    const set = document.createElement("fieldset");
    set.className = "aspect";
    const legend = document.createElement("legend");
    legend.textContent = label;
    set.appendChild(legend);
    const choices = document.createElement("div");
    choices.className = "choices";
    for (let i = 1; i <= max; i++) {
      const l = document.createElement("label");
      l.className = "choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = i;
      input.required = true;
      l.append(input, document.createTextNode(String(i)));
      choices.appendChild(l);
    }
    set.appendChild(choices);
    root.appendChild(set);
  }
  c.aspects.forEach((label, i) => scale("score" + i, label, 4));
  root.append(
    field("criticism", c.fields[4], "textarea"),
    document.createElement("br"),
    field("suggestions", c.fields[5], "textarea"),
  );
  scale("rating", c.fields[6], 5);
  let submissionId = crypto.randomUUID();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const button = document.getElementById("send"),
      message = document.getElementById("message");
    button.disabled = true;
    button.textContent = c.sending;
    message.hidden = true;
    const fd = new FormData(form),
      body = Object.fromEntries(fd);
    body.locale = lang;
    body.submissionId = submissionId;
    body.scores = Array.from({ length: 6 }, (_, i) =>
      Number(fd.get("score" + i)),
    );
    body.rating = Number(fd.get("rating"));
    try {
      const response = await fetch("/api/customer-satisfaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw Error("submit");
      message.textContent = c.success;
      message.className = "message";
      message.hidden = false;
      form
        .querySelectorAll("input,textarea,button")
        .forEach((x) => (x.disabled = true));
      message.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (_) {
      message.textContent = c.error;
      message.className = "message error";
      message.hidden = false;
      button.disabled = false;
      button.textContent = c.submit;
    }
  });
})();
