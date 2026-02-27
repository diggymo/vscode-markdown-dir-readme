# Markdown Directory README Opener

VSCodeのMarkdownでは `[link](./some-dir/)` のようなディレクトリへのリンクをクリックしても何も起きません。

この拡張機能は、ディレクトリリンクをクリックした際にそのディレクトリ内の `_.md` を自動的に開きます。

```
project/
├── docs/
│   └── _.md        ← これが開かれる
├── notes/
│   └── _.md        ← これが開かれる
└── README.md        [docs](./docs/) をクリック → docs/_.md が開く
```

## 対応箇所

- **エディタ**: `Cmd+Click`（Windows: `Ctrl+Click`）でディレクトリリンクをフォロー
- **Markdownプレビュー**: プレビュー内のリンクをクリック
- `_.md` が存在しないディレクトリリンクはデフォルト動作のまま

## インストール

1. このリポジトリをクローンしてビルド:

```sh
git clone https://github.com/diggymo/vscode-markdown-dir-readme.git
cd vscode-markdown-dir-readme
pnpm install
pnpm exec vsce package
```

2. 生成された `.vsix` ファイルをVSCodeでインストール:
   - `Cmd+Shift+P`（Windows: `Ctrl+Shift+P`）でコマンドパレットを開く
   - **Extensions: Install from VSIX...** を選択
   - `markdown-dir-readme-0.0.1.vsix` を選択

## 開発

```sh
pnpm install
pnpm run compile
```

`F5` でExtension Development Hostを起動してデバッグできます。
