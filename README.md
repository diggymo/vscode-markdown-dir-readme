# Markdown Directory README Opener

Markdownのディレクトリリンクをクリックすると、自動的にそのディレクトリの `README.md` を開くVSCode拡張機能です。

## 機能

- **エディタ**: `Cmd+Click`（Windows: `Ctrl+Click`）でディレクトリリンクをクリック → `README.md` が開く
- **プレビュー**: Markdownプレビュー内のディレクトリリンクをクリック → `README.md` が開く
- `README.md` が存在しないディレクトリリンクはデフォルト動作のまま

## インストール

[Releases](https://github.com/diggymo/vscode-markdown-dir-readme/releases) から `.vsix` ファイルをダウンロードし、VSCodeでインストール:

1. `Cmd+Shift+P`（Windows: `Ctrl+Shift+P`）でコマンドパレットを開く
2. **Extensions: Install from VSIX...** を選択
3. ダウンロードした `.vsix` ファイルを選択

## 開発

```sh
pnpm install
pnpm run compile
```

`F5` でExtension Development Hostを起動してデバッグできます。

### パッケージ作成

```sh
pnpm exec vsce package
```
