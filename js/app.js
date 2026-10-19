// Funzioni di supporto per formattare ed etichettare il periodo
function formatPeriodLabel(period) {
  if (period === "S1") return "Semester 1";
  if (period === "S2") return "Semester 2";
  if (period === "A") return "Full Year";
  return "Flexible";
}

function getPeriodBadge(period) {
  const p = (period || "Any").toUpperCase();
  let cssClass = "badge-any";
  if (p === "S1") cssClass = "badge-s1";
  else if (p === "S2") cssClass = "badge-s2";
  else if (p === "A") cssClass = "badge-a";

  return `<span class="badge-period ${cssClass}">${p} (${formatPeriodLabel(p)})</span>`;
}

// 1. Renderizzazione del Passo 1 (Mandatory + Soft Skills)
function updateTrackUI() {
  const track = state.rulesData[state.cohort].curricula[state.trackKey];
  state.mandatory = [...track.mandatory];

  const list = document.getElementById("mandatory-list");
  list.innerHTML = "";
  track.mandatory.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        <strong>${m.name}</strong> [${m.ssd}]
        ${getPeriodBadge(m.period)}
      </span>
      <span>${m.cfu} CFU</span>
    `;
    list.appendChild(li);
  });

  const softDiv = document.getElementById("soft-skills-container");
  softDiv.innerHTML = "";
  const softOptions = state.rulesData[state.cohort].soft_skills.options;
  softOptions.forEach(s => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="radio" name="soft_skill" value="${s.code}">
      <span><strong>${s.name}</strong> (${s.cfu} CFU) ${getPeriodBadge(s.period)}</span>
    `;
    softDiv.appendChild(label);
  });

  softDiv.querySelectorAll("input").forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.selectedSoftSkill = softOptions.find(o => o.code === e.target.value);
    });
  });
}

// 2. Renderizzazione del Passo 2 (Core Courses)
function renderCoreStep() {
  const track = state.rulesData[state.cohort].curricula[state.trackKey];
  const container = document.getElementById("core-container");
  container.innerHTML = "";
  state.selectedCore = [];

  document.getElementById("core-instruction").textContent =
    `Select ${track.core_rules.required_count} core course(s) from the following list:`;

  track.core_rules.options.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${c.code}">
      <span>
        <strong>${c.name}</strong> [${c.ssd}] - ${c.cfu} CFU (Year ${c.year})
        ${getPeriodBadge(c.period)}
      </span>
    `;
    container.appendChild(label);
  });

  container.querySelectorAll("input").forEach(cb => {
    cb.addEventListener("change", () => {
      state.selectedCore = Array.from(container.querySelectorAll("input:checked")).map(el => {
        return track.core_rules.options.find(c => c.code === el.value);
      });
    });
  });
}

// 3. Renderizzazione del Passo 3 (Integrative Courses)
function renderIntegrativeStep() {
  const track = state.rulesData[state.cohort].curricula[state.trackKey];
  const container = document.getElementById("integrative-container");
  container.innerHTML = "";
  state.selectedIntegrative = [];

  const selectedCoreCodes = state.selectedCore.map(c => c.code);

  track.integrative_rules.forEach((ruleGroup) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "section-block";
    groupDiv.innerHTML = `<h4>${ruleGroup.title}</h4>`;

    const availableOptions = ruleGroup.options.filter(c => !selectedCoreCodes.includes(c.code));

    availableOptions.forEach(c => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" data-group="${ruleGroup.group_id}" value="${c.code}">
        <span>
          <strong>${c.name}</strong> [${c.ssd}] - ${c.cfu} CFU (Year ${c.year || 1})
          ${getPeriodBadge(c.period)}
        </span>
      `;
      groupDiv.appendChild(label);
    });

    container.appendChild(groupDiv);
  });

  container.querySelectorAll("input").forEach(cb => {
    cb.addEventListener("change", () => {
      state.selectedIntegrative = Array.from(container.querySelectorAll("input:checked")).map(el => {
        for (const rg of track.integrative_rules) {
          const match = rg.options.find(o => o.code === el.value);
          if (match) return match;
        }
      });
    });
  });
}

// 4. Renderizzazione del Passo 4 (Electives)
function renderElectivesStep() {
  const container = document.getElementById("electives-container");
  container.innerHTML = "";
  state.selectedElectives = [];

  const alreadyChosen = new Set([
    ...state.mandatory.map(c => c.code),
    ...state.selectedCore.map(c => c.code),
    ...state.selectedIntegrative.map(c => c.code)
  ]);

  const trackData = state.rulesData[state.cohort].curricula;
  const pool = new Map();

  for (const tKey in trackData) {
    const tr = trackData[tKey];
    tr.mandatory.forEach(c => pool.set(c.code, c));
    tr.core_rules.options.forEach(c => pool.set(c.code, c));
    tr.integrative_rules.forEach(g => g.options.forEach(c => pool.set(c.code, c)));
  }

  const electivesList = Array.from(pool.values()).filter(c => !alreadyChosen.has(c.code) && c.cfu === 6);

  electivesList.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${c.code}">
      <span>
        <strong>${c.name}</strong> [${c.ssd}] - ${c.cfu} CFU
        ${getPeriodBadge(c.period)}
      </span>
    `;
    container.appendChild(label);
  });

  container.querySelectorAll("input").forEach(cb => {
    cb.addEventListener("change", () => {
      state.selectedElectives = Array.from(container.querySelectorAll("input:checked")).map(el => {
        return pool.get(el.value);
      });
    });
  });
}

// 5. Renderizzazione del Passo 5 (Riepilogo riorganizzato in 4 blocchi semestrali)
function renderSummaryStep() {
  const fixed = state.rulesData[state.cohort].fixed_activities;

  const allItems = [
    ...state.mandatory.map(c => ({ ...c, type: "Mandatory" })),
    ...state.selectedCore.map(c => ({ ...c, type: "Core" })),
    ...state.selectedIntegrative.map(c => ({ ...c, type: "Integrative" })),
    ...state.selectedElectives.map(c => ({ ...c, type: "Elective" })),
    { ...state.selectedSoftSkill, type: "Soft Skill" },
    ...fixed.map(c => ({ ...c, type: "Fixed Activity" }))
  ];

  // Calcolo totali e crediti di legge
  let totalCfu = 0;
  let coreCfu = 0;
  let integrativeCfu = 0;

  allItems.forEach(item => {
    totalCfu += item.cfu;
    if (["ING-INF/02", "ING-INF/03"].includes(item.ssd) && item.type !== "Elective") {
      coreCfu += item.cfu;
    }
    if (["MAT/09", "MAT/03", "FIS/03", "FIS/07", "ING-INF/05", "ING-INF/04", "ING-INF/01", "ING-INF/07", "BIO/11", "BIO/09", "MED/01", "ING-IND/34"].includes(item.ssd) && item.type !== "Elective") {
      integrativeCfu += item.cfu;
    }
  });

  // Validazione
  const validationDiv = document.getElementById("validation-report");
  const isLegalTotal = totalCfu >= 120 && totalCfu <= 126;
  const isLegalCore = coreCfu >= 45 && coreCfu <= 69;
  const isLegalIntegrative = integrativeCfu >= 15 && integrativeCfu <= 30;
  const valid = isLegalTotal && isLegalCore && isLegalIntegrative;

  validationDiv.className = `validation-box ${valid ? "valid-status" : "invalid-status"}`;
  validationDiv.innerHTML = `
    <h4>${valid ? "Study Plan Compliant (ASP Validated)" : "Study Plan Requires Attention (Deviations Detected)"}</h4>
    <ul>
      <li>Total Credits: <strong>${totalCfu} CFU</strong> (Range: 120 - 126 CFU)</li>
      <li>Core Credits (ING-INF/02 & ING-INF/03): <strong>${coreCfu} CFU</strong> (Range: 45 - 69 CFU)</li>
      <li>Integrative Credits: <strong>${integrativeCfu} CFU</strong> (Range: 15 - 30 CFU)</li>
    </ul>
    ${valid ? "<p>All national and departmental constraints are fulfilled. You can safely confirm this as an Automatic Study Plan on UniWeb.</p>"
            : "<p>Warning: This configuration does not satisfy ASP limits and will require evaluation as a Proposed Study Plan (PSP).</p>"}
  `;

  // Ripartizione nei 4 blocchi semestrali + attività flessibili del secondo anno
  const blocks = {
    y1s1: { title: "Year 1 - Semester 1 (Autumn)", classHeader: "year-1", items: [], cfu: 0 },
    y1s2: { title: "Year 1 - Semester 2 (Spring)", classHeader: "year-1", items: [], cfu: 0 },
    y2s1: { title: "Year 2 - Semester 1 (Autumn)", classHeader: "year-2", items: [], cfu: 0 },
    y2s2: { title: "Year 2 - Semester 2 (Spring)", classHeader: "year-2", items: [], cfu: 0 },
    flexible: { title: "Year 2 - Degree Completion & Final Activities", classHeader: "flexible", items: [], cfu: 0 }
  };

  allItems.forEach(item => {
    const yr = item.year || 1;
    const period = (item.period || "S1").toUpperCase();

    if (item.code === "TRAIN" || item.code === "THESIS") {
      blocks.flexible.items.push(item);
      blocks.flexible.cfu += item.cfu;
    } else if (yr === 1) {
      if (period === "S1" || period === "A") {
        blocks.y1s1.items.push(item);
        blocks.y1s1.cfu += item.cfu;
      } else {
        blocks.y1s2.items.push(item);
        blocks.y1s2.cfu += item.cfu;
      }
    } else {
      if (period === "S1") {
        blocks.y2s1.items.push(item);
        blocks.y2s1.cfu += item.cfu;
      } else {
        blocks.y2s2.items.push(item);
        blocks.y2s2.cfu += item.cfu;
      }
    }
  });

  // Generazione del markup a card per i blocchi semestrali
  const summaryContainer = document.querySelector(".summary-tables");
  summaryContainer.innerHTML = "<h3>Study Plan Schedule by Semester</h3>";

  const gridDiv = document.createElement("div");
  gridDiv.className = "semester-block-grid";

  Object.values(blocks).forEach(block => {
    if (block.items.length === 0) return;

    const card = document.createElement("div");
    card.className = "semester-card";

    let tableRows = "";
    block.items.forEach(c => {
      tableRows += `
        <tr>
          <td>
            <strong>${c.name}</strong>
            <small style="color:var(--text-muted)">(${c.type})</small>
            ${getPeriodBadge(c.period)}
          </td>
          <td style="text-align:right; white-space:nowrap;"><strong>${c.cfu} CFU</strong></td>
        </tr>
      `;
    });

    card.innerHTML = `
      <div class="semester-card-header ${block.classHeader}">
        <span>${block.title}</span>
        <span>${block.cfu} CFU</span>
      </div>
      <div class="semester-card-body">
        <table class="semester-table">
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
    gridDiv.appendChild(card);
  });

  summaryContainer.appendChild(gridDiv);
}