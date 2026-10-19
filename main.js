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

// 中央に向かって明るくなる縦向きのグラデーション（正規分布による境界分散＋微細ノイズ）
(function initGradientBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  // 正規分布乱数テーブル（Box-Muller法で事前生成し高速ルックアップ）
  const TABLE_SIZE = 8192;
  const gaussianTable = new Float32Array(TABLE_SIZE);
  for (let i = 0; i < TABLE_SIZE; i += 2) {
    const u1 = Math.max(1e-7, Math.random());
    const u2 = Math.random();
    const r = Math.sqrt(-2.0 * Math.log(u1));
    const theta = 2.0 * Math.PI * u2;
    gaussianTable[i] = r * Math.cos(theta);
    if (i + 1 < TABLE_SIZE) {
      gaussianTable[i + 1] = r * Math.sin(theta);
    }
  }

  let tableIndex = 0;
  function getGaussian() {
    const val = gaussianTable[tableIndex];
    tableIndex = (tableIndex + 1) % TABLE_SIZE;
    return val;
  }

  function render() {
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    if (width === 0 || height === 0) return;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const centerX = width * 0.5;
    const maxDist = width * 0.5;

    // 画面端の色（ベースの暗部）: #09090b
    const edgeR = 9;
    const edgeG = 9;
    const edgeB = 11;

    // 中央ピーク時の加算輝度（少しトーンを目立たせた上品な明るさ）
    const deltaR = 24;
    const deltaG = 24;
    const deltaB = 32;

    // 階調境界を正規分布で分散させるジッターの標準偏差（幅の約 2%）
    const jitterSigma = Math.max(12, width * 0.02);

    // 背景全体になじませる微細ノイズの標準偏差
    const noiseSigma = 1.35;

    let idx = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // 幅方向の境界位置を正規分布でジッター（カラーバンディングの境界線を分散）
        const jitteredX = x + getGaussian() * jitterSigma;
        const normDist = Math.min(1, Math.max(0, Math.abs(jitteredX - centerX) / maxDist));

        // コサインカーブによる滑らかなグラデーション係数（中央: 1.0 -> 端: 0.0）
        const factor = 0.5 * (1 + Math.cos(normDist * Math.PI));

        // 微細なディザリング用ガウスノイズ
        const noise = getGaussian() * noiseSigma;

        data[idx] = Math.min(255, Math.max(0, (edgeR + deltaR * factor + noise + 0.5) | 0));
        data[idx + 1] = Math.min(255, Math.max(0, (edgeG + deltaG * factor + noise + 0.5) | 0));
        data[idx + 2] = Math.min(255, Math.max(0, (edgeB + deltaB * factor + noise + 0.5) | 0));
        data[idx + 3] = 255;
        idx += 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // 初回描画とリサイズ時のデバウンス更新
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 80);
  });

  render();
})();
