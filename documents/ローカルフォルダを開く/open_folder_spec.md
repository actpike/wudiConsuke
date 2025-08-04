# Chrome拡張連携によるローカルフォルダオープン機能 仕様書

## 📌 概要

- Chrome拡張のオプション画面等から、ユーザーのローカルPC上の特定フォルダを**エクスプローラで開く**処理を行う。  
- セキュリティ上、拡張機能から直接 `.bat` を実行することはできないため、**Native Messaging API** を用いてローカルの `.bat` スクリプトを呼び出す。
- 本機能は通常非表示状態とし、オプションから「追加機能を解放」を行いユーザの承諾を得てから表示される
---

## 🧩 構成要素

### 1. Chrome拡張（拡張ID: 任意）

- **オプションページまたはUIボタン**
  - ユーザー操作により「特定フォルダを開く」アクションを起動
- **background.js（もしくは service_worker.js）**
  - `chrome.runtime.sendNativeMessage()` にて、Nativeアプリを呼び出す

### 2. Native Messaging ホスト定義ファイル（JSON）

- Windowsの以下パスに設置：
  - `%LocalAppData%\Google\Chrome\User Data\NativeMessagingHosts\open-folder.json`
- 例：

```json
{
  "name": "com.example.openfolder",
  "description": "Open a local folder via bat",
  "path": "C:\\Users\\User\\AppData\\Local\\OpenFolder\\open_folder.bat",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://<拡張ID>/"
  ]
}
```

### 3. バッチスクリプト（`open_folder.bat`）

- 内容例：

```bat
@echo off
setlocal

REM 引数（フォルダパス）を受け取って開く
set /p folderPath=

start "" "%folderPath%"
```

---

## 🔁 処理フロー

1. Chrome拡張から `chrome.runtime.sendNativeMessage("com.example.openfolder", { path: "C:\\My\\Folder" })` を送信
2. Native Messaging が `.bat` を呼び出す
3. `.bat` は標準入力からパスを受け取り、 `explorer` で該当フォルダを開く
4. 完了

---

## ⚠️ 注意点

- `.bat` を直接 Chrome 拡張から実行することは不可能。**Native Messaging 経由が必須**
- `.bat` スクリプトは **標準入力（stdin）でパスを受け取れるようにする**
- ユーザーPCに `.bat` と `manifest.json` を**正しく配置**する導入手順が必要
- `.bat` は警告が出る可能性があるため、配布時に注意喚起を記載すること

---

## 🛠 想定配布構成

```
📦 installer_package/
├─ open_folder.bat              バッチ本体
├─ com.example.openfolder.json Native Messaging用JSON
└─ README.txt                   導入手順書（ユーザー向け）
```

---

### 4. 開くフォルダについて
- 本機能は通常非表示状態とし、オプションから「追加機能を解放」を行いユーザの承諾を得てから表示される
- 初期設定として、ルートフォルダの設定や、追加機能説明を行う
- 初期設定では、指定したフォルダに対して、全作品のフォルダを作成する
- フォルダ構成
	<root>
	└ <作品No(00)>_<作品タイトル>
		※60作品であれば、60個のフォルダが作成される
- Chrome拡張側で、各フォルダへのパスを保持する
- 各作品のフォルダアイコンをクリックすると、batに作品Noを引数として渡し、該当のフォルダをエクスプローラで開く
