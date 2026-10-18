# dennokoworks VPM Repository

dennokoworks 製 Unity / VRChat 向けツールの VPM (VRChat Creator Companion) パッケージ配信リポジトリです。

- **Web ページ (Add to VCC)**: [https://dennoko.github.io/vpm-repos/](https://dennoko.github.io/vpm-repos/)
- **リポジトリ定義 (index.json)**: `https://dennoko.github.io/vpm-repos/index.json`

---

## 📁 ディレクトリ構成

```text
vpm-repos/
├── index.html       # 「Add to VCC」ボタンやパッケージ一覧を表示するランディングページ
├── index.json       # VPMリポジトリメタデータ（VCCが参照）
├── README.md        # 本ドキュメント
└── .nojekyll        # GitHub PagesでJekyll処理を無効化する設定
```

---

## 📦 パッケージの更新・追加手順

新しいバージョンや新しいツールを追加する際の手順です。

### 1. パッケージ開発リポジトリ側での作業

1. **パッケージ zip の作成**
   - パッケージフォルダ直下のファイル群（`package.json`, `Editor/`, `Docs/`, `LICENSE.txt` 等）を含む zip ファイルを作成します。
   - 例: `com.dennokoworks.tool-importer-0.1.0.zip`

2. **SHA256 ハッシュ値の計算 (PowerShell)**
   ```powershell
   (Get-FileHash -Algorithm SHA256 "com.dennokoworks.tool-importer-0.1.0.zip").Hash.ToLower()
   ```

3. **GitHub Releases にアップロード**
   - パッケージ開発リポジトリ（例: `com.dennokoworks.tool-importer`）の GitHub Releases でタグ（例: `0.1.0`）を作成し、作成した zip ファイルをアセットとして添付・公開します。

### 2. 本リポジトリ (`vpm-repos`) 側での作業

1. **`index.json` の更新**
   - `packages.<packageId>.versions` に新バージョンのエントリを追加します。
   - `url` に GitHub Releases の zip ダイレクトダウンロード URL を設定します。
   - `zipSHA256` に先ほど計算した SHA256 ハッシュ値（小文字64文字）を設定します。

2. **コミット & プッシュ**
   ```bash
   git add index.json
   git commit -m "feat: add com.dennokoworks.tool-importer v0.1.0"
   git push origin main
   ```
   GitHub Pages に反映されると、VCC 側および Web ページ側のパッケージ情報が自動的に更新されます。

---

## ⚙️ 初回セットアップ (GitHub Pages)

1. リポジトリ設定（**Settings** ＞ **Pages**）を開く。
2. **Build and deployment** の Source で **Deploy from a branch** を選択。
3. Branch を `main`（または `master`）、フォルダを `/ (root)` に設定して保存。
4. 数分後に `https://dennoko.github.io/vpm-repos/` でアクセス可能になります。
