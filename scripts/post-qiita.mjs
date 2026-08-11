// Qiitaへ記事を投稿するスクリプト。
// 使い方: npm run post:qiita -- articles/xxxxx.md --confirm
// --confirm を付けない限り、実際には投稿せず内容を表示するだけ(ドライラン)。
import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';

const QIITA_API_BASE = 'https://qiita.com/api/v2';

function parseArgs(argv) {
  const args = argv.slice(2);
  const confirm = args.includes('--confirm');
  const filePath = args.find((a) => !a.startsWith('--'));
  return { filePath, confirm };
}

async function main() {
  const { filePath, confirm } = parseArgs(process.argv);
  if (!filePath) {
    console.error('使い方: npm run post:qiita -- <articles/xxxx.md> [--confirm]');
    process.exit(1);
  }

  const token = process.env.QIITA_TOKEN;
  if (!token) {
    console.error('QIITA_TOKEN が .env に設定されていません。');
    process.exit(1);
  }

  const raw = await readFile(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  const payload = {
    title: frontmatter.title ?? '(無題)',
    body: content.trim(),
    tags: (frontmatter.topics ?? []).map((name) => ({ name })),
    private: frontmatter.private ?? false,
  };

  console.log('--- 投稿内容(確認) ---');
  console.log('タイトル:', payload.title);
  console.log('タグ:', payload.tags.map((t) => t.name).join(', '));
  console.log('本文の文字数:', payload.body.length);
  console.log('-----------------------');

  if (!confirm) {
    console.log('ドライランのため投稿していません。内容に問題なければ --confirm を付けて再実行してください。');
    return;
  }

  const res = await fetch(`${QIITA_API_BASE}/items`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`投稿に失敗しました (${res.status}): ${text}`);
    process.exit(1);
  }

  const result = await res.json();
  console.log('投稿しました:', result.url);
}

main();
