#!/bin/bash
# docs/*.md → 단일 HTML 파일 (브라우저에서 열고 Cmd+P로 PDF 저장 가능)
set -e
cd "$(dirname "$0")"
OUT="CareerDock-기획서.html"

{
  cat <<'HEAD'
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CareerDock 기획서</title>
<style>
  :root { --ink:#1C1917; --sub:#57534E; --line:#E7E5E4; --bg:#FAFAF9; --accent:#4F5BD5; }
  * { box-sizing: border-box; }
  body {
    font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
                 "Malgun Gothic", "Noto Sans KR", sans-serif;
    max-width: 880px; margin: 0 auto; padding: 48px 24px;
    color: var(--ink); line-height: 1.7; font-size: 15px; background: #fff;
  }
  h1 { font-size: 30px; font-weight: 700; letter-spacing: -0.02em;
       margin: 56px 0 20px; padding-bottom: 12px; border-bottom: 2px solid var(--ink); }
  h1:first-child { margin-top: 0; }
  h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.01em;
       margin: 40px 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--line); }
  h3 { font-size: 17px; font-weight: 600; margin: 28px 0 10px; }
  h4 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; color: var(--sub); }
  p, li { font-size: 15px; }
  a { color: var(--accent); }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
         font-size: 13px; background: #F5F5F4; padding: 2px 5px; border-radius: 4px; }
  pre { background: var(--bg); border: 1px solid var(--line); border-radius: 10px;
        padding: 16px; overflow-x: auto; line-height: 1.5; }
  pre code { background: none; padding: 0; font-size: 12px; white-space: pre; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; }
  th, td { border: 1px solid var(--line); padding: 9px 12px; text-align: left;
           vertical-align: top; }
  th { background: var(--bg); font-weight: 600; }
  blockquote { margin: 16px 0; padding: 12px 18px; border-left: 3px solid var(--accent);
               background: var(--bg); border-radius: 0 8px 8px 0; }
  blockquote p { margin: 0; }
  hr { border: none; border-top: 1px solid var(--line); margin: 40px 0; }
  ul, ol { padding-left: 22px; }
  li { margin: 4px 0; }
  .cover { text-align: center; padding: 100px 0 80px; border-bottom: 1px solid var(--line);
           margin-bottom: 40px; }
  .cover h1 { font-size: 44px; border: none; margin: 0 0 12px; padding: 0; }
  .cover p { color: var(--sub); margin: 4px 0; }
  .doc { page-break-before: always; }
  @media print {
    body { padding: 0; font-size: 11pt; max-width: none; }
    pre code { font-size: 8.5pt; }
    pre { white-space: pre-wrap; word-break: break-all; }
    table { font-size: 9.5pt; }
    h1, h2, h3 { page-break-after: avoid; }
    pre, table, blockquote { page-break-inside: avoid; }
    a { color: var(--ink); text-decoration: none; }
    .cover { padding: 200px 0; page-break-after: always; border: none; }
  }
</style>
</head>
<body>
<div class="cover">
  <h1>CareerDock</h1>
  <p>2주 개발 계획 &amp; UX/UI 디자인 기획서</p>
  <p>v1.0 · 2026.08.01</p>
  <p>권예준 · 송주영</p>
</div>
HEAD

  for f in 01-2주-역할분담.md 02-ux-ui-design-spec.md; do
    echo '<div class="doc">'
    npx --yes marked --gfm < "$f"
    echo '</div>'
  done

  echo '</body></html>'
} > "$OUT"

echo "생성 완료: $(pwd)/$OUT"
