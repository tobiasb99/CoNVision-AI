const demoTabs = document.querySelectorAll(".demo-tab");
const demoPanels = document.querySelectorAll(".demo-panel");
const demoResets = document.querySelectorAll(".demo-reset");
let followupBootstrapped = false;

function activatePanel(panelId) {
  demoTabs.forEach((tab) => {
    const active = tab.dataset.target === panelId;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  demoPanels.forEach((panel) => {
    panel.hidden = panel.id !== panelId;
  });

  if (panelId === "followup-panel" && !followupBootstrapped) {
    const followupFrame = document.getElementById("followup-frame");
    if (followupFrame) {
      const baseSrc = followupFrame.dataset.baseSrc || followupFrame.getAttribute("src");
      const joiner = baseSrc.includes("?") ? "&" : "?";
      followupFrame.setAttribute("src", `${baseSrc}${joiner}boot=${Date.now()}`);
      followupBootstrapped = true;
    }
  }
}

demoTabs.forEach((tab) => {
  tab.addEventListener("click", () => activatePanel(tab.dataset.target));
});

demoResets.forEach((btn) => {
  btn.addEventListener("click", () => {
    const frame = document.getElementById(btn.dataset.frame);
    if (!frame) return;
    const baseSrc = frame.dataset.baseSrc || frame.getAttribute("src");
    const joiner = baseSrc.includes("?") ? "&" : "?";
    frame.setAttribute("src", `${baseSrc}${joiner}refresh=${Date.now()}`);
  });
});
