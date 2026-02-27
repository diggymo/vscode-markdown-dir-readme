import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// Markdownリンクの正規表現: [text](link) — ただし画像 ![alt](src) は除外
const MARKDOWN_LINK_PATTERN = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;

/**
 * ディレクトリリンクを_.mdに解決するDocumentLinkProvider
 */
class DirectoryReadmeLinkProvider implements vscode.DocumentLinkProvider {
  async provideDocumentLinks(
    document: vscode.TextDocument
  ): Promise<vscode.DocumentLink[]> {
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();
    const docDir = path.dirname(document.uri.fsPath);

    let match: RegExpExecArray | null;
    // 毎回lastIndexをリセットするためにregexを再作成
    const regex = new RegExp(MARKDOWN_LINK_PATTERN.source, "g");

    while ((match = regex.exec(text)) !== null) {
      const linkText = match[2];

      // 外部URL、アンカー、特殊スキームはスキップ
      if (
        linkText.startsWith("http://") ||
        linkText.startsWith("https://") ||
        linkText.startsWith("#") ||
        linkText.startsWith("mailto:") ||
        linkText.includes("://")
      ) {
        continue;
      }

      // リンク部分（フラグメント・クエリを除去）
      const linkPath = linkText.split("#")[0].split("?")[0];
      if (!linkPath) continue;

      const absolutePath = path.resolve(docDir, linkPath);

      try {
        const stat = await vscode.workspace.fs.stat(
          vscode.Uri.file(absolutePath)
        );
        if (stat.type & vscode.FileType.Directory) {
          const readmePath = path.join(absolutePath, "_.md");
          try {
            await vscode.workspace.fs.stat(vscode.Uri.file(readmePath));
          } catch {
            // _.mdが存在しない場合はスキップ
            continue;
          }

          // リンク範囲を計算（括弧内のパス部分）
          const linkStart = match.index + match[0].indexOf("(") + 1;
          const linkEnd = linkStart + match[2].length;
          const startPos = document.positionAt(linkStart);
          const endPos = document.positionAt(linkEnd);
          const range = new vscode.Range(startPos, endPos);

          const link = new vscode.DocumentLink(
            range,
            vscode.Uri.file(readmePath)
          );
          link.tooltip = "Open _.md";
          links.push(link);
        }
      } catch {
        // パスが存在しない場合はスキップ
        continue;
      }
    }

    return links;
  }
}

/**
 * markdown-itプラグイン: プレビュー内のディレクトリリンクを_.mdに書き換え
 */
function markdownItDirectoryReadmePlugin(md: any): void {
  md.core.ruler.push(
    "directory-readme",
    (state: any) => {
      const env = state.env;

      // VSCodeのmarkdownプレビューではenv.currentDocumentにドキュメントURIが入る
      let docDir: string | undefined;
      if (env && env.currentDocument) {
        const uri =
          typeof env.currentDocument === "string"
            ? env.currentDocument
            : env.currentDocument.toString();
        // file:// URIからパスを取得
        try {
          const filePath = uri.startsWith("file://")
            ? decodeURIComponent(uri.replace("file://", ""))
            : uri;
          docDir = path.dirname(filePath);
        } catch {
          return;
        }
      }

      if (!docDir) return;

      const tokens = state.tokens;
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === "inline" && tokens[i].children) {
          const children = tokens[i].children;
          for (let j = 0; j < children.length; j++) {
            if (children[j].type !== "link_open") continue;

            const hrefAttr = children[j].attrGet("href");
            if (!hrefAttr) continue;

            // 外部URL、アンカー、特殊スキームはスキップ
            if (
              hrefAttr.startsWith("http://") ||
              hrefAttr.startsWith("https://") ||
              hrefAttr.startsWith("#") ||
              hrefAttr.startsWith("mailto:") ||
              hrefAttr.includes("://")
            ) {
              continue;
            }

            const linkPath = hrefAttr.split("#")[0].split("?")[0];
            if (!linkPath) continue;

            const absolutePath = path.resolve(docDir, linkPath);

            try {
              const stat = fs.statSync(absolutePath);
              if (stat.isDirectory()) {
                const readmePath = path.join(absolutePath, "_.md");
                if (fs.existsSync(readmePath)) {
                  // hrefを_.mdに書き換え
                  const newHref = hrefAttr.replace(
                    linkPath,
                    linkPath.endsWith("/")
                      ? linkPath + "_.md"
                      : linkPath + "/_.md"
                  );
                  children[j].attrSet("href", newHref);
                }
              }
            } catch {
              // ファイルが存在しない場合はスキップ
            }
          }
        }
      }
    }
  );
}

export function activate(
  context: vscode.ExtensionContext
): { extendMarkdownIt: (md: any) => any } {
  // エディタ側: DocumentLinkProviderを登録
  const selector: vscode.DocumentSelector = { language: "markdown" };
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      selector,
      new DirectoryReadmeLinkProvider()
    )
  );

  // プレビュー側: markdown-itプラグインを返す
  return {
    extendMarkdownIt(md: any) {
      markdownItDirectoryReadmePlugin(md);
      return md;
    },
  };
}

export function deactivate(): void {}
