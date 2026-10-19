// Stato globale dell'applicazione
const state = {
  cohort: "2026",
  trackKey: null,
  rulesData: null,
  mandatory: [],
  selectedSoftSkill: null,
  selectedCore: [],
  selectedIntegrative: [],
  selectedElectives: []
};

// Inizializzazione e caricamento delle regole JSON
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("data/rules_mime.json");
    state.rulesData = await res.json();
    initApp();
  } catch (err) {
    console.error("Failed to load rules JSON:", err);
  }
});

function initApp() {
  setupNavigation();
  setupCohort();
}

function setupNavigation() {
  document.querySelectorAll(".btn-prev").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetStep = parseInt(btn.dataset.target, 10);
      goToStep(targetStep);
    });
  });

  document.getElementById("btn-step-0-next").addEventListener("click", () => {
    renderTrackOptions();
    goToStep(1);
  });

  document.getElementById("btn-step-1-next").addEventListener("click", () => {
    if (!state.selectedSoftSkill) {
      alert("Please select one Soft Skill activity.");
      return;
    }
    renderCoreStep();
    goToStep(2);
  });

  document.getElementById("btn-step-2-next").addEventListener("click", () => {
    const track = state.rulesData[state.cohort].curricula[state.trackKey];
    const req = track.core_rules.required_count;
    if (state.selectedCore.length !== req) {
      alert(`You must select exactly ${req} core courses.`);
      return;
    }
    renderIntegrativeStep();
    goToStep(3);
  });

  document.getElementById("btn-step-3-next").addEventListener("click", () => {
    const track = state.rulesData[state.cohort].curricula[state.trackKey];
    let totalReq = 0;
    track.integrative_rules.forEach(r => totalReq += r.required_count);
    if (state.selectedIntegrative.length !== totalReq) {
      alert(`Please satisfy all integrative course requirements (${totalReq} courses required).`);
      return;
    }
    renderElectivesStep();
    goToStep(4);
  });

  document.getElementById("btn-step-4-next").addEventListener("click", () => {
    const electiveCfu = state.selectedElectives.reduce((sum, c) => sum + c.cfu, 0);
    if (electiveCfu !== 12) {
      alert(`You must select exactly 12 CFU for elective courses (currently: ${electiveCfu} CFU).`);
      return;
    }
    renderSummaryStep();
    goToStep(5);
  });
}

function goToStep(stepIndex) {
  document.querySelectorAll(".wizard-step").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".step-badge").forEach(b => b.classList.remove("active"));

  document.getElementById(`step-${stepIndex}`).classList.add("active");
  const badge = document.querySelector(`.step-badge[data-step="${stepIndex}"]`);
  if (badge) badge.classList.add("active");
}

function setupCohort() {
  document.getElementById("cohort-select").addEventListener("change", (e) => {
    state.cohort = e.target.value;
  });
}

function renderTrackOptions() {
  const select = document.getElementById("track-select");
  select.innerHTML = "";
  const tracks = state.rulesData[state.cohort].curricula;

  for (const [key, track] of Object.entries(tracks)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${track.name} (${track.code})`;
    select.appendChild(opt);
  }

  state.trackKey = select.value;
  updateTrackUI();

  select.addEventListener("change", (e) => {
    state.trackKey = e.target.value;
    updateTrackUI();
  });
}

function updateTrackUI() {
  const track = state.rulesData[state.cohort].curricula[state.trackKey];
  state.mandatory = [...track.mandatory];

  // Mostra insegnamenti obbligatori
  const list = document.getElementById("mandatory-list");
  list.innerHTML = "";
  track.mandatory.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${m.name}</strong> (${m.ssd})</span><span>${m.cfu} CFU</span>`;
    list.appendChild(li);
  });

  // Mostra opzioni Soft Skill
  const softDiv = document.getElementById("soft-skills-container");
  softDiv.innerHTML = "";
  const softOptions = state.rulesData[state.cohort].soft_skills.options;
  softOptions.forEach(s => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="radio" name="soft_skill" value="${s.code}">
      <span>${s.name} (${s.cfu} CFU)</span>
    `;
    softDiv.appendChild(label);
  });

  softDiv.querySelectorAll("input").forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.selectedSoftSkill = softOptions.find(o => o.code === e.target.value);
    });
  });
}

function renderCoreStep() {
  const track = state.rulesData[state.cohort].curricula[state.trackKey];
  const container = document.getElementById("core-container");
  container.innerHTML = "";
  state.selectedCore = [];

  document.getElementById("core-instruction").textContent =
    `Select ${track.core_rules.required_count} course(s) from the following options:`;

  track.core_rules.options.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${c.code}">
      <span><strong>${c.name}</strong> [${c.ssd}] - ${c.cfu} CFU (Year ${c.year})</span>
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

function renderIntegrativeStep() {
  const track = state.rulesData[state.cohort].curricula[state.trackKey];
  const container = document.getElementById("integrative-container");
  container.innerHTML = "";
  state.selectedIntegrative = [];

  const selectedCoreCodes = state.selectedCore.map(c => c.code);

  track.integrative_rules.forEach((ruleGroup, idx) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "section-block";
    groupDiv.innerHTML = `<h4>${ruleGroup.title}</h4>`;

    const availableOptions = ruleGroup.options.filter(c => !selectedCoreCodes.includes(c.code));

    availableOptions.forEach(c => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="checkbox" data-group="${ruleGroup.group_id}" value="${c.code}">
        <span><strong>${c.name}</strong> [${c.ssd}] - ${c.cfu} CFU</span>
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

function renderElectivesStep() {
  const container = document.getElementById("electives-container");
  container.innerHTML = "";
  state.selectedElectives = [];

  const alreadyChosen = new Set([
    ...state.mandatory.map(c => c.code),
    ...state.selectedCore.map(c => c.code),
    ...state.selectedIntegrative.map(c => c.code)
  ]);

  // Aggrega tutti i corsi offerti dal MIME per la coorte
  const trackData = state.rulesData[state.cohort].curricula;
  const pool = new Map();

  for (const tKey in trackData) {
    const tr = trackData[tKey];
    tr.mandatory.forEach(c => pool.set(c.code, c));
    tr.core_rules.options.forEach(c => pool.set(c.code, c));
    tr.integrative_rules.forEach(g => g.options.forEach(c => pool.set(c.code, c)));
  }

  // Filtra i corsi non ancora inseriti nel piano
  const electivesList = Array.from(pool.values()).filter(c => !alreadyChosen.has(c.code) && c.cfu === 6);

  electivesList.forEach(c => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${c.code}">
      <span><strong>${c.name}</strong> [${c.ssd}] - ${c.cfu} CFU</span>
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

function renderSummaryStep() {
  const tbody = document.querySelector("#summary-table tbody");
  tbody.innerHTML = "";

  const fixed = state.rulesData[state.cohort].fixed_activities;

  const allItems = [
    ...state.mandatory.map(c => ({ ...c, type: "Mandatory" })),
    ...state.selectedCore.map(c => ({ ...c, type: "Core" })),
    ...state.selectedIntegrative.map(c => ({ ...c, type: "Integrative" })),
    ...state.selectedElectives.map(c => ({ ...c, type: "Elective" })),
    { ...state.selectedSoftSkill, type: "Soft Skill" },
    ...fixed.map(c => ({ ...c, type: "Fixed Activity" }))
  ];

  let totalCfu = 0;
  let coreCfu = 0;
  let integrativeCfu = 0;

  allItems.forEach(item => {
    totalCfu += item.cfu;
    if (["ING-INF/02", "ING-INF/03"].includes(item.ssd) && item.type !== "Elective") {
      coreCfu += item.cfu;
    }
    if (["MAT/09", "MAT/03", "FIS/03", "FIS/07", "ING-INF/05", "ING-INF/04", "ING-INF/01", "ING-INF/07"].includes(item.ssd) && item.type !== "Elective") {
      integrativeCfu += item.cfu;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.type}</td>
      <td>${item.name}</td>
      <td>${item.ssd || "N/A"}</td>
      <td>${item.cfu}</td>
    `;
    tbody.appendChild(tr);
  });

  // Validazione dei vincoli di legge
  const validationDiv = document.getElementById("validation-report");
  const isLegalTotal = totalCfu >= 120 && totalCfu <= 126;
  const isLegalCore = coreCfu >= 45 && coreCfu <= 69;
  const isLegalIntegrative = integrativeCfu >= 15 && integrativeCfu <= 30;

  const valid = isLegalTotal && isLegalCore && isLegalIntegrative;

  validationDiv.className = `validation-box ${valid ? "valid-status" : "invalid-status"}`;
  validationDiv.innerHTML = `
    <h4>${valid ? "Study Plan Compliant (ASP Validated)" : "Study Plan Requires Attention (Deviations Detected)"}</h4>
    <ul>
      <li>Total Credits: <strong>${totalCfu} CFU</strong> (Legal limit: 120 - 126 CFU)</li>
      <li>Core Credits (ING-INF/02 & ING-INF/03): <strong>${coreCfu} CFU</strong> (Legal limit: 45 - 69 CFU)</li>
      <li>Integrative Credits: <strong>${integrativeCfu} CFU</strong> (Legal limit: 15 - 30 CFU)</li>
    </ul>
    ${valid ? "<p>All national and track constraints are fulfilled. You can safely submit this as an Automatic Study Plan on UniWeb.</p>"
            : "<p>Warning: This selection does not fulfill ASP constraints and would require a Proposed Study Plan (PSP) evaluation by the Educational Committee.</p>"}
  `;
}