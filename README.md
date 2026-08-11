# loki-articles

`~/projects` 配下のアプリ開発や TryHackMe の学習記録から、Zenn / Qiita 向けの技術記事を
作成・管理するためのリポジトリ。

## できること

- Zenn: 記事をMarkdownで書いて、GitHubリポジトリと連携させれば `git push` だけで公開できる
  (Zenn公式のCLI「zenn-cli」を使用)。
- Qiita: API経由で投稿するスクリプトを用意している(`scripts/post-qiita.mjs`)。

**どちらも、下書きができた段階でチャット上で公開の可否を確認してから実行する運用にしている。**
自動で下書きが作られることはあっても、確認なしで世の中に公開されることはない。

## セットアップ(初回のみ)

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Zennと連携する(Zenn側の設定)

1. [Zenn](https://zenn.dev/) にGitHubアカウントでログインする。
2. Zennのダッシュボード(「デプロイ」タブなど)から、このリポジトリをGitHub連携する。
   ※ 連携には、このリポジトリがGitHub上に存在している必要がある。まだ作っていなければ、
   先にGitHubリポジトリを作成してpushしておく。
3. 連携後は、`articles/` 配下のMarkdownファイルで `published: true` になっているものが、
   pushするたびに自動的にZennへ反映される。

### 3. Qiitaと連携する(トークンの発行)

1. [Qiitaの個人用アクセストークン発行ページ](https://qiita.com/settings/tokens/new)を開く。
2. スコープで `read_qiita` と `write_qiita` にチェックを入れて発行する。
3. 発行されたトークンをコピーし、このリポジトリのルートに `.env` ファイルを作って
   直接書き込む(`.env.example` を参考にする)。**トークンはチャットに貼らず、
   ファイルに直接書き込むこと。**

```
QIITA_TOKEN=（発行されたトークン）
```

## 記事を書く(Zenn)

```bash
npm run new:article   # articles/ に新しいMarkdownファイルが作られる
npm run preview       # http://localhost:8000 でプレビュー
```

`published: true` にしてから `git push` すると、Zenn連携が済んでいれば自動で公開される。

## 記事を投稿する(Qiita)

```bash
# 確認だけ(実際には投稿しない)
npm run post:qiita -- articles/xxxxx.md

# 内容に問題なければ、--confirm を付けて再実行
npm run post:qiita -- articles/xxxxx.md --confirm
```

## ディレクトリ構成

```
articles/     Zenn形式の記事本体(zenn-cliで管理)
books/        Zennの「本」機能用(今のところ未使用)
templates/    記事の下書きテンプレート
scripts/      Qiita投稿スクリプトなど
```
