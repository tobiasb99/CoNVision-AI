const revealItems = document.querySelectorAll(".reveal");
const countItems = document.querySelectorAll("[data-num]");
let counted = false;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => observer.observe(item));

function animateCounts() {
  if (counted) return;
  counted = true;
  countItems.forEach((item) => {
    const target = Number(item.dataset.num);
    const duration = 900;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.round(target * progress);
      item.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

const firstMetric = document.querySelector(".hero-metrics");
if (firstMetric) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounts();
          counterObserver.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  counterObserver.observe(firstMetric);
}
