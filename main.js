// GitHub Pages / 現在のドメインに応じて index.json の絶対 URL を決定
const repoJsonUrl = new URL("index.json", window.location.href).href;
const repoInput = document.getElementById("repo-url");
const vccButton = document.getElementById("vcc-button");
const copyBtn = document.getElementById("copy-btn");
const copyBtnText = document.getElementById("copy-btn-text");
const toast = document.getElementById("toast");

if (repoInput) repoInput.value = repoJsonUrl;
if (vccButton) vccButton.href = "vcc://vpm/addRepo?url=" + encodeURIComponent(repoJsonUrl);

// コピー機能とフィードバック
async function copyRepoUrl() {
  try {
    await navigator.clipboard.writeText(repoJsonUrl);
  } catch (err) {
    if (repoInput) {
      repoInput.select();
      document.execCommand("copy");
    }
  }

  if (copyBtn && copyBtnText && toast) {
    copyBtn.classList.add("copied");
    copyBtnText.textContent = "Copied!";
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);

    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtnText.textContent = "Copy URL";
    }, 2800);
  }
}

// onclick ハンドラ用に window にもバインド
window.copyRepoUrl = copyRepoUrl;

// index.json からパッケージ一覧を動的反映
async function syncPackages() {
  try {
    const response = await fetch("index.json");
    if (!response.ok) return;
    const data = await response.json();
    if (!data.packages) return;

    const packageListContainer = document.getElementById("package-list");
    if (!packageListContainer) return;
    const fragment = document.createDocumentFragment();

    for (const [pkgId, pkgData] of Object.entries(data.packages)) {
      const versions = Object.keys(pkgData.versions || {});
      if (versions.length === 0) continue;

      const latestVersionKey = versions[versions.length - 1];
      const latestInfo = pkgData.versions[latestVersionKey];

      const card = document.createElement("div");
      card.className = "package-card";

      const authorName = typeof latestInfo.author === "object" ? latestInfo.author.name : (latestInfo.author || data.author || "");
      const authorUrl = typeof latestInfo.author === "object" ? latestInfo.author.url : (data.url || "#");
      const unityVer = latestInfo.unity ? `<span class="badge">Unity ${latestInfo.unity}</span>` : "";

      card.innerHTML = `
        <div class="package-top">
          <div class="package-title-group">
            <div class="package-name">${latestInfo.displayName || latestInfo.name || pkgId}</div>
            <div class="package-id">${latestInfo.name || pkgId}</div>
          </div>
          <div style="display: flex; gap: 6px;">
            ${unityVer}
            <span class="badge">v${latestInfo.version || latestVersionKey}</span>
          </div>
        </div>
        <p class="package-desc">
          ${latestInfo.description || "説明はありません。"}
        </p>
        <div class="package-actions">
          <span>Author: ${authorName}</span>
          ${authorUrl ? `<a class="package-link" href="${authorUrl}" target="_blank" rel="noopener noreferrer">詳細 ↗</a>` : ""}
        </div>
      `;
      fragment.appendChild(card);
    }

    if (fragment.children.length > 0) {
      packageListContainer.innerHTML = "";
      packageListContainer.appendChild(fragment);
    }
  } catch (e) {
    console.info("Using static package list fallback:", e);
  }
}

syncPackages();

// Organic Ambient Canvas Background Effect (inspired by dennoko.com)
(function initAmbientCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  let t = 0;
  function draw() {
    t += 0.003;
    ctx.clearRect(0, 0, width, height);

    // Center ambient soft white/gray glow
    const cx = width * 0.5 + Math.sin(t * 0.7) * (width * 0.05);
    const cy = height * 0.28 + Math.cos(t * 0.5) * (height * 0.04);
    const radius = Math.max(width, height) * 0.55;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.045)");
    grad.addColorStop(0.35, "rgba(255, 255, 255, 0.018)");
    grad.addColorStop(0.7, "rgba(255, 255, 255, 0.003)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(draw);
  }
  draw();
})();
