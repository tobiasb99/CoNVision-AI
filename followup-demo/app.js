const app = document.getElementById("app");

const demoInput = "../assets/demo-input.png";
const isAutoPlay = true;
const AUTO_CONNECT_CODE = "384219";
const AUTO_CONNECT_DOB = "1992-05-14";
const AUTO_CONNECT_PIN = "1234";
const initialScreen = "connect";
const initialCode = AUTO_CONNECT_CODE;
const initialDob = AUTO_CONNECT_DOB;
const initialPin = AUTO_CONNECT_PIN;
const AUTO_CONNECT_DELAY_MS = 3400;

const state = {
  screen: initialScreen,
  clinicCode: initialCode,
  dob: initialDob,
  pin: initialPin,
  consent: false,
  selectedEyes: "",
  eyeQueue: [],
  captureIndex: 0,
  captures: [],
  currentDraft: null,
  flash: false,
  qualityResult: null,
  sendProgress: 0,
  autoConnectStarted: false,
};

function setScreen(screen) {
  state.screen = screen;
  render();
}

function primaryButton(text, id, disabled = false) {
  return `<button class="btn full" id="${id}" ${disabled ? "disabled" : ""}>${text}</button>`;
}

function renderInvite() {
  app.innerHTML = `
    <section class="stack">
      <div class="brand">
        <img src="../assets/conv-logo.svg" alt="CoNVision AI logo" />
        <span>CoNVision AI</span>
      </div>
      <h1>Secure clinic follow-up</h1>
      <div class="card stack">
        <p class="caption">SMS / Email message</p>
        <p><strong>Your eye follow-up is ready.</strong> Use this secure link to submit today's photo.</p>
      </div>
      ${primaryButton("Open secure follow-up", "openFollowup")}
    </section>
  `;
  document.getElementById("openFollowup").addEventListener("click", () => setScreen("connect"));
}

function renderConnect() {
  if (isAutoPlay && !state.autoConnectStarted) {
    state.clinicCode = AUTO_CONNECT_CODE;
    state.dob = AUTO_CONNECT_DOB;
    state.pin = AUTO_CONNECT_PIN;
  }
  const canContinue = Boolean(state.clinicCode && state.dob);
  const autoPending = isAutoPlay && !state.autoConnectStarted;
  const connectButtonText = autoPending ? "Continuing..." : "Continue";
  app.innerHTML = `
    <section class="stack">
      <h2>Connect to your clinic</h2>
      <div class="card stack">
        <div class="field">
          <label for="codeInput">Clinic code (6-digit)</label>
          <input id="codeInput" type="text" maxlength="6" inputmode="numeric" value="${state.clinicCode}" ${autoPending ? "readonly" : ""} />
        </div>
        <div class="field">
          <label for="dobInput">Confirm date of birth</label>
          <input id="dobInput" type="date" value="${state.dob}" ${autoPending ? "readonly" : ""} />
        </div>
        <div class="field">
          <label for="pinInput">Optional 4-digit PIN for future follow-ups</label>
          <input id="pinInput" type="password" maxlength="4" inputmode="numeric" value="${state.pin}" ${autoPending ? "readonly" : ""} />
        </div>
        <p class="caption">Your images are shared only with your care team.${autoPending ? " Auto-demo is continuing in a few seconds." : ""}</p>
      </div>
      ${primaryButton(connectButtonText, "continueConnect", autoPending || !canContinue)}
    </section>
  `;

  document.getElementById("codeInput").addEventListener("input", (e) => {
    state.clinicCode = e.target.value.replace(/\D/g, "").slice(0, 6);
    renderConnect();
  });
  document.getElementById("dobInput").addEventListener("change", (e) => {
    state.dob = e.target.value;
    renderConnect();
  });
  document.getElementById("pinInput").addEventListener("input", (e) => {
    state.pin = e.target.value.replace(/\D/g, "").slice(0, 4);
    renderConnect();
  });
  const btn = document.getElementById("continueConnect");
  if (btn) btn.addEventListener("click", () => setScreen("consent"));
  if (autoPending) {
    state.autoConnectStarted = true;
    setTimeout(() => setScreen("consent"), AUTO_CONNECT_DELAY_MS);
  }
}

function renderConsent() {
  app.innerHTML = `
    <section class="stack">
      <h2>Before you start</h2>
      <div class="card icon-list">
        <div class="icon-row"><span class="icon">1</span><span>Find a bright room (facing a window)</span></div>
        <div class="icon-row"><span class="icon">2</span><span>Remove contact lenses (if applicable)</span></div>
        <div class="icon-row"><span class="icon">3</span><span>Ask someone to help if possible</span></div>
      </div>
      <label class="card">
        <input id="consentCheck" type="checkbox" ${state.consent ? "checked" : ""} />
        I consent to share images with my doctor
      </label>
      ${primaryButton("Start capture", "startCapture", !state.consent)}
    </section>
  `;
  document.getElementById("consentCheck").addEventListener("change", (e) => {
    state.consent = e.target.checked;
    renderConsent();
  });
  const btn = document.getElementById("startCapture");
  if (btn) btn.addEventListener("click", () => setScreen("whichEye"));
}

function renderWhichEye() {
  const options = [
    { id: "left", label: "Left eye" },
    { id: "right", label: "Right eye" },
    { id: "both", label: "Both (recommended)" },
  ];
  app.innerHTML = `
    <section class="stack">
      <h2>Which eye are you photographing?</h2>
      <div class="option-grid">
        ${options
          .map(
            (opt) => `
          <button type="button" class="option-btn ${state.selectedEyes === opt.id ? "selected" : ""}" data-eye="${opt.id}">
            ${opt.label}
          </button>
        `
          )
          .join("")}
      </div>
      ${primaryButton("Continue", "continueEye", !state.selectedEyes)}
    </section>
  `;
  document.querySelectorAll("[data-eye]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedEyes = btn.dataset.eye;
      renderWhichEye();
    });
  });
  const next = document.getElementById("continueEye");
  if (!next) return;
  next.addEventListener("click", () => {
    state.eyeQueue = state.selectedEyes === "both" ? ["Left eye", "Right eye"] : [state.selectedEyes === "left" ? "Left eye" : "Right eye"];
    state.captureIndex = 0;
    state.captures = [];
    state.currentDraft = null;
    setScreen("capture");
  });
}

function renderCapture() {
  const eye = state.eyeQueue[state.captureIndex] || "Eye";
  const lighting = state.flash ? "Good light" : "Too dark";
  const distance = Math.random() > 0.4 ? "Move closer" : "Hold still";
  const focus = Math.random() > 0.3 ? "In focus" : "Out of focus";
  app.innerHTML = `
    <section class="stack">
      <h2>Capture: ${eye}</h2>
      <p class="progress-text">Photo ${state.captureIndex + 1} of ${state.eyeQueue.length}</p>
      <div class="camera">
        <div class="viewfinder">
          <div class="align-circle"></div>
        </div>
        <div class="camera-status">
          <div class="status-chip"><span>Lighting</span><strong>${lighting}</strong></div>
          <div class="status-chip"><span>Position</span><strong>${distance}</strong></div>
          <div class="status-chip"><span>Focus</span><strong>${focus}</strong></div>
        </div>
      </div>
      <div class="stack">
        ${primaryButton("Take photo", "takePhoto")}
        <button class="btn ghost full" id="toggleFlash">Flash: ${state.flash ? "On" : "Off"}</button>
        <button class="btn soft full" id="needHelp">Need help?</button>
      </div>
    </section>
  `;
  document.getElementById("takePhoto").addEventListener("click", () => {
    state.currentDraft = demoInput;
    setScreen("review");
  });
  document.getElementById("toggleFlash").addEventListener("click", () => {
    state.flash = !state.flash;
    renderCapture();
  });
  document.getElementById("needHelp").addEventListener("click", () => {
    alert("Center the eye in the circle, hold phone steady, and use bright window light.");
  });
}

function renderReview() {
  const eye = state.eyeQueue[state.captureIndex] || "Eye";
  const src = state.currentDraft || demoInput;
  app.innerHTML = `
    <section class="stack">
      <h2>Review photo</h2>
      <p class="progress-text">${eye} - ${state.captureIndex + 1} of ${state.eyeQueue.length}</p>
      <img class="photo" src="${src}" alt="Captured eye photo" />
      <div class="stack">
        ${primaryButton("Use photo", "usePhoto")}
        <button class="btn ghost full" id="retake">Retake</button>
      </div>
    </section>
  `;
  document.getElementById("usePhoto").addEventListener("click", () => {
    state.captures[state.captureIndex] = src;
    state.captureIndex += 1;
    if (state.captureIndex < state.eyeQueue.length) {
      state.currentDraft = null;
      setScreen("capture");
      return;
    }
    state.qualityResult = null;
    setScreen("quality");
    startQualityCheck();
  });
  document.getElementById("retake").addEventListener("click", () => {
    state.currentDraft = null;
    setScreen("capture");
  });
}

function renderQualityChecking() {
  app.innerHTML = `
    <section class="stack">
      <h2>Checking image quality...</h2>
      <div class="card stack" style="justify-items:center; text-align:center;">
        <div class="spinner"></div>
        <p class="caption">Analyzing lighting, focus, and eye alignment</p>
      </div>
    </section>
  `;
}

function renderQualityResult() {
  if (state.qualityResult === "ok") {
    app.innerHTML = `
      <section class="stack">
        <h2>Great - this image is usable.</h2>
        <div class="card stack">
          <p class="ok">Lighting: OK</p>
          <p class="ok">Focus: OK</p>
          <p class="ok">Eye centered: OK</p>
        </div>
        ${primaryButton("Send to clinic", "sendToClinic")}
      </section>
    `;
    document.getElementById("sendToClinic").addEventListener("click", () => {
      setScreen("sending");
      startSend();
    });
    return;
  }

  const reasons = ["Too blurry", "Too dark", "Eye not centered"];
  const selected = reasons.sort(() => Math.random() - 0.5).slice(0, 2);
  app.innerHTML = `
    <section class="stack">
      <h2>We can't use this image reliably.</h2>
      <div class="card stack">
        ${selected.map((r) => `<p class="warn">${r}</p>`).join("")}
      </div>
      ${primaryButton("Retake photo", "retakeAfterFail")}
      <button class="btn ghost full" id="contactClinic">Contact clinic / Request appointment</button>
    </section>
  `;
  document.getElementById("retakeAfterFail").addEventListener("click", () => {
    state.captureIndex = 0;
    state.captures = [];
    state.currentDraft = null;
    setScreen("capture");
  });
  document.getElementById("contactClinic").addEventListener("click", () => {
    alert("Clinic contact request sent.");
  });
}

function startQualityCheck() {
  const delay = 2000 + Math.floor(Math.random() * 1000);
  setTimeout(() => {
    state.qualityResult = Math.random() > 0.22 ? "ok" : "fail";
    render();
  }, delay);
}

function renderSending() {
  app.innerHTML = `
    <section class="stack">
      <h2>Sending securely...</h2>
      <div class="card stack">
        <p class="caption">Encrypted upload</p>
        <div class="bar"><span id="sendFill" style="width:${state.sendProgress}%;"></span></div>
        <p class="progress-text">${state.sendProgress}%</p>
      </div>
    </section>
  `;
}

function startSend() {
  state.sendProgress = 0;
  const total = 2000 + Math.floor(Math.random() * 3000);
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / total, 1);
    state.sendProgress = Math.round(progress * 100);
    renderSending();
    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }
    setScreen("sent");
  }
  requestAnimationFrame(tick);
}

function renderSent() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  state.latestTime = `${hh}:${mm}`;
  app.innerHTML = `
    <section class="stack">
      <h2>Sent to your doctor</h2>
      <p class="caption">Your care team will review and decide if an in-office visit is needed.</p>
      ${primaryButton("Done", "doneBtn")}
      <button class="btn ghost full" id="addSymptoms">Add symptoms</button>
    </section>
  `;
  document.getElementById("doneBtn").addEventListener("click", () => setScreen("status"));
  document.getElementById("addSymptoms").addEventListener("click", () => {
    alert("Symptoms capture can be added in the next iteration.");
  });
}

function renderStatus() {
  app.innerHTML = `
    <section class="stack">
      <h2>Follow-up status</h2>
      <div class="card stack">
        <p><strong>Latest submission:</strong> Today ${state.latestTime || "--:--"}</p>
        <p><strong>Status:</strong> Received</p>
        <p><strong>Next step:</strong> Review by clinic</p>
        <div class="hr"></div>
        <p class="danger">If symptoms worsen, contact the clinic.</p>
      </div>
      ${primaryButton("Start new follow-up", "restart")}
    </section>
  `;
  document.getElementById("restart").addEventListener("click", () => {
    state.selectedEyes = "";
    state.eyeQueue = [];
    state.captureIndex = 0;
    state.captures = [];
    state.currentDraft = null;
    state.qualityResult = null;
    state.sendProgress = 0;
    setScreen("invite");
  });
}

function renderQuality() {
  if (!state.qualityResult) {
    renderQualityChecking();
    return;
  }
  renderQualityResult();
}

function render() {
  switch (state.screen) {
    case "invite":
      renderInvite();
      break;
    case "connect":
      renderConnect();
      break;
    case "consent":
      renderConsent();
      break;
    case "whichEye":
      renderWhichEye();
      break;
    case "capture":
      renderCapture();
      break;
    case "review":
      renderReview();
      break;
    case "quality":
      renderQuality();
      break;
    case "sending":
      renderSending();
      break;
    case "sent":
      renderSent();
      break;
    case "status":
      renderStatus();
      break;
    default:
      renderInvite();
  }
}

render();
