const DEMO_PAIR_INPUT = "../assets/correctPairs/Demo Pair/input.png";
const DEMO_PAIR_OUTPUT = "../assets/correctPairs/Demo Pair/output.png";
const DEMO_UPLOAD_LOCKED = true;

function pairPaths(number) {
  return {
    input: `../assets/correctPairs/Pair ${number}/input.png`,
    output: `../assets/correctPairs/Pair ${number}/output.png`,
  };
}

const patients = [
  {
    id: "PT-1048",
    name: "Elena Morales",
    dob: "1987-06-11",
    lastVisit: "2026-01-12",
    status: "Stable",
    visits: [
      { date: "2025-08-10", score: 0.16, ...pairPaths(1) },
      { date: "2026-01-12", score: 0.18, ...pairPaths(2) },
    ],
  },
  {
    id: "PT-1103",
    name: "David Chen",
    dob: "1979-09-02",
    lastVisit: "2025-12-18",
    status: "Improving",
    visits: [
      { date: "2025-05-01", score: 0.27, ...pairPaths(3) },
      { date: "2025-12-18", score: 0.22, ...pairPaths(4) },
    ],
  },
  {
    id: "PT-1151",
    name: "Marina Foster",
    dob: "1994-01-19",
    lastVisit: "2026-02-03",
    status: "Progressing",
    visits: [
      { date: "2025-10-21", score: 0.31, ...pairPaths(5) },
      { date: "2026-02-03", score: 0.37, ...pairPaths(6) },
    ],
  },
  {
    id: "PT-1170",
    name: "Lucas Weber",
    dob: "1982-03-25",
    lastVisit: "2026-01-28",
    status: "Stable",
    visits: [
      { date: "2025-09-16", score: 0.20, ...pairPaths(7) },
      { date: "2026-01-28", score: 0.21, ...pairPaths(8) },
    ],
  },
];

const state = {
  route: { screen: "list", patientId: null },
  pendingUpload: null,
  pendingMetrics: null,
};

const app = document.getElementById("app");

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status) {
  return status.toLowerCase();
}

function getPatient() {
  return patients.find((p) => p.id === state.route.patientId);
}

function setRoute(screen, patientId = null) {
  state.route = { screen, patientId };
  render();
}

function renderPatientList() {
  app.innerHTML = `
    <section class="panel hero">
      <div>
        <h1>CoNVision AI</h1>
        <p>Track corneal neovascularization history, run scan analysis, and keep quantified results in one place.</p>
      </div>
      <button class="btn ghost" type="button" id="addPatientPlaceholder"><span class="plus-icon" aria-hidden="true">+</span>Add new patient</button>
    </section>
    <section class="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Last Visit</th>
            <th>Scans</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${patients
            .map(
              (p) => `
            <tr>
              <td><strong>${p.name}</strong><br /><span class="meta">${p.id}</span></td>
              <td>${formatDate(p.lastVisit)}</td>
              <td>${p.visits.length}</td>
              <td><span class="tag ${statusClass(p.status)}">${p.status}</span></td>
              <td><button class="btn" data-open="${p.id}">Open</button></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => setRoute("detail", btn.dataset.open));
  });
  document.getElementById("addPatientPlaceholder").addEventListener("click", () => {});
}

function renderPatientDetail() {
  const patient = getPatient();
  if (!patient) {
    setRoute("list");
    return;
  }

  app.innerHTML = `
    <section class="panel">
      <div class="header-row">
        <div>
          <h2>${patient.name}</h2>
          <p class="meta">ID: ${patient.id} • DOB: ${formatDate(patient.dob)} • Last scan: ${formatDate(patient.lastVisit)}</p>
        </div>
        <div class="row">
          <button class="btn ghost" id="backToList">Back to patients</button>
          <button class="btn accent" id="addScan">Add new scan</button>
        </div>
      </div>
      <div class="history-list">
        ${patient.visits
          .slice()
          .reverse()
          .map(
            (visit) => `
          <article class="visit-card">
            <div class="visit-images">
              <img src="${visit.input}" alt="Visit input" />
              <img src="${visit.output}" alt="Visit output" />
            </div>
            <div>
              <strong>${formatDate(visit.date)}</strong>
              <p class="visit-note">CoNV Score: ${visit.score.toFixed(2)}</p>
              <p class="visit-note">Input and AI output shown side by side</p>
            </div>
            <span class="tag ${statusClass(patient.status)}">${patient.status}</span>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;

  document.getElementById("backToList").addEventListener("click", () => setRoute("list"));
  document.getElementById("addScan").addEventListener("click", () => setRoute("upload", patient.id));
}

function renderUpload() {
  const patient = getPatient();
  if (!patient) {
    setRoute("list");
    return;
  }
  const uploadLocked = DEMO_UPLOAD_LOCKED;

  app.innerHTML = `
    <section class="panel">
      <div class="header-row">
        <div>
          <h2>Upload New Scan</h2>
          <p class="meta">${patient.name} (${patient.id})</p>
        </div>
        <button class="btn ghost" id="cancelUpload">Cancel</button>
      </div>
      <div class="upload-wrap">
        <div class="dropzone ${uploadLocked ? "upload-disabled" : ""}" id="dropzone">
          <p><strong>Drag & drop slit-lamp image here</strong></p>
          <p class="subtle">or browse files below</p>
        </div>
        <div class="row">
          <input type="file" id="fileInput" accept="image/*" ${uploadLocked ? "disabled" : ""} />
          <label class="meta" for="eyeSelect">Eye:</label>
          <select id="eyeSelect">
            <option value="Left">Left</option>
            <option value="Right">Right</option>
          </select>
        </div>
        ${
          uploadLocked
            ? `<p class="upload-lock-note">Demo mode: uploading personal images is disabled. Please use the <strong>Use demo image</strong> button below.</p>`
            : ""
        }
        <img id="preview" class="preview" alt="Image preview" style="display:none" />
        <div class="row">
          <button class="btn accent" id="startAnalysis" disabled>Start analysis</button>
          <button class="btn ghost" id="useDemo">Use demo image</button>
        </div>
      </div>
    </section>
  `;

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const startBtn = document.getElementById("startAnalysis");
  const eyeSelect = document.getElementById("eyeSelect");

  function setPreview(src) {
    state.pendingUpload = { src, eye: eyeSelect.value };
    preview.src = src;
    preview.style.display = "block";
    startBtn.disabled = false;
  }

  eyeSelect.addEventListener("change", () => {
    if (state.pendingUpload) state.pendingUpload.eye = eyeSelect.value;
  });

  if (!uploadLocked) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    });

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    });
  } else {
    dropzone.addEventListener("dragover", (e) => e.preventDefault());
    dropzone.addEventListener("drop", (e) => e.preventDefault());
  }

  document.getElementById("useDemo").addEventListener("click", () => {
    setPreview(DEMO_PAIR_INPUT);
  });

  document.getElementById("startAnalysis").addEventListener("click", () => {
    if (!state.pendingUpload) return;
    setRoute("analysis", patient.id);
  });

  document.getElementById("cancelUpload").addEventListener("click", () => setRoute("detail", patient.id));
}

function renderAnalysis() {
  const patient = getPatient();
  if (!patient || !state.pendingUpload) {
    setRoute("detail", state.route.patientId);
    return;
  }

  app.innerHTML = `
    <section class="panel analysis">
      <div class="spinner" aria-hidden="true"></div>
      <h2>Analyzing corneal neovascularization...</h2>
      <p class="subtle">Detecting vessels • Quantifying area • Comparing to history</p>
      <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
      <p class="subtle" id="progressText">0%</p>
    </section>
  `;

  const duration = 9000 + Math.floor(Math.random() * 2000);
  const start = performance.now();
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const percent = Math.round(progress * 100);
    fill.style.width = `${percent}%`;
    text.textContent = `${percent}%`;
    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }
    buildMetrics(patient);
    setRoute("results", patient.id);
  }

  requestAnimationFrame(tick);
}

function buildMetrics(patient) {
  const last = patient.visits[patient.visits.length - 1];
  const shift = (Math.random() * 0.1 - 0.01).toFixed(2);
  const score = Math.max(0.08, Math.min(0.72, last.score + Number(shift)));
  const delta = (score - last.score).toFixed(2);
  const vesselArea = (score * 29 + 4).toFixed(1);
  const invasionLength = (score * 5.3 + 0.8).toFixed(2);
  const progression = Number(delta) > 0;

  state.pendingMetrics = {
    score: Number(score),
    vesselArea,
    invasionLength,
    delta: Number(delta),
    trendLabel: progression ? "Progression" : "Improvement",
    trendClass: progression ? "warn" : "good",
  };
}

function renderResults() {
  const patient = getPatient();
  if (!patient || !state.pendingUpload || !state.pendingMetrics) {
    setRoute("detail", state.route.patientId);
    return;
  }

  const m = state.pendingMetrics;
  const signedDelta = `${m.delta >= 0 ? "+" : ""}${m.delta.toFixed(2)}`;

  app.innerHTML = `
    <section class="panel results">
      <div class="header-row" style="padding: 0 0 14px;">
        <div>
          <h2>AI Result</h2>
          <p class="meta">${patient.name} • Eye: ${state.pendingUpload.eye || "Left"}</p>
        </div>
      </div>

      <div class="compare-grid">
        <article class="img-panel">
          <h3 style="font-size:1.05rem;">Original</h3>
          <img src="${DEMO_PAIR_INPUT}" alt="MVP input image" />
        </article>
        <article class="img-panel">
          <h3 style="font-size:1.05rem;">AI Overlay Output</h3>
          <img src="${DEMO_PAIR_OUTPUT}" alt="MVP output image" />
        </article>
      </div>

      <div class="stats">
        <article class="stat-card">
          <p class="stat-label">Vessel area %</p>
          <p class="stat-value">${m.vesselArea}%</p>
        </article>
        <article class="stat-card">
          <p class="stat-label">Invasion length (mm)</p>
          <p class="stat-value">${m.invasionLength}</p>
        </article>
        <article class="stat-card">
          <p class="stat-label">CoNV Score</p>
          <p class="stat-value">${m.score.toFixed(2)}</p>
        </article>
      </div>

      <p class="trend ${m.trendClass}">Change since last scan: ${signedDelta} (${m.trendLabel})</p>

      <div class="toolbar">
        <button class="btn accent" id="saveResult">Save to patient record</button>
        <button class="btn ghost" id="backHistory">Back to history</button>
      </div>
    </section>
  `;

  document.getElementById("saveResult").addEventListener("click", () => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    patient.visits.push({
      date: iso,
      score: m.score,
      input: DEMO_PAIR_INPUT,
      output: DEMO_PAIR_OUTPUT,
    });
    patient.lastVisit = iso;
    patient.status = m.delta > 0.03 ? "Progressing" : m.delta < -0.03 ? "Improving" : "Stable";
    state.pendingUpload = null;
    state.pendingMetrics = null;
    setRoute("detail", patient.id);
  });

  document.getElementById("backHistory").addEventListener("click", () => {
    state.pendingUpload = null;
    state.pendingMetrics = null;
    setRoute("detail", patient.id);
  });
}

function render() {
  switch (state.route.screen) {
    case "list":
      renderPatientList();
      break;
    case "detail":
      renderPatientDetail();
      break;
    case "upload":
      renderUpload();
      break;
    case "analysis":
      renderAnalysis();
      break;
    case "results":
      renderResults();
      break;
    default:
      setRoute("list");
  }
}

const homeBrand = document.getElementById("homeBrand");
if (homeBrand) {
  homeBrand.addEventListener("click", () => {
    state.pendingUpload = null;
    state.pendingMetrics = null;
    setRoute("list");
  });
}

render();
