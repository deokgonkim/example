#!/usr/bin/env python3
"""Generated with chatgpt
"""

import os
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, request, render_template_string
from werkzeug.utils import secure_filename

APP_TITLE = "Send to Linux"
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "inbox"          # 모든 수신물 저장 루트
TEXT_DIR = DATA_DIR / "texts"          # 텍스트 저장
FILE_DIR = DATA_DIR / "files"          # 파일 저장
META_DIR = DATA_DIR / "meta"           # 메타데이터 저장

MAX_CONTENT_LENGTH = 512 * 1024 * 1024  # 512MB (필요하면 줄이세요)

for d in (DATA_DIR, TEXT_DIR, FILE_DIR, META_DIR):
    d.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

PAGE = """<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="color-scheme" content="light dark" />
  <title>{{ title }}</title>
  <style>
    :root{
      --bg: #0b0b0c;
      --card: rgba(255,255,255,0.06);
      --text: #f3f3f4;
      --muted: rgba(255,255,255,0.65);
      --border: rgba(255,255,255,0.12);
      --accent: #4da3ff;
      --danger: #ff5d5d;
      --ok: #39d98a;
      --shadow: 0 12px 40px rgba(0,0,0,0.35);
    }
    @media (prefers-color-scheme: light) {
      :root{
        --bg: #f6f7fb;
        --card: rgba(0,0,0,0.04);
        --text: #101114;
        --muted: rgba(0,0,0,0.60);
        --border: rgba(0,0,0,0.10);
        --shadow: 0 12px 40px rgba(0,0,0,0.10);
      }
    }
    * { box-sizing: border-box; }
    body{
      margin:0;
      padding: 18px 16px 28px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    .wrap{
      max-width: 720px;
      margin: 0 auto;
    }
    .header{
      display:flex;
      align-items:flex-end;
      justify-content:space-between;
      gap: 12px;
      margin-bottom: 14px;
    }
    h1{
      font-size: 22px;
      line-height: 1.1;
      margin: 0;
      letter-spacing: -0.2px;
    }
    .sub{
      font-size: 13px;
      color: var(--muted);
      margin-top: 6px;
    }
    .pill{
      font-size: 12px;
      padding: 6px 10px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--muted);
      white-space: nowrap;
    }
    .card{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 14px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(8px);
    }
    label{
      display:block;
      margin: 12px 2px 8px;
      font-size: 13px;
      color: var(--muted);
    }
    textarea, input[type="text"], input[type="file"]{
      width: 100%;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 12px;
      background: rgba(255,255,255,0.06);
      color: var(--text);
      outline: none;
      font-size: 16px; /* iOS 자동 확대 방지 */
    }
    textarea{
      min-height: 160px;
      resize: vertical;
      line-height: 1.35;
    }
    .row{
      display:flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    button{
      flex: 1 1 160px;
      border: none;
      border-radius: 14px;
      padding: 12px 14px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
    }
    .send{
      background: var(--accent);
      color: #081018;
    }
    .clear{
      background: transparent;
      color: var(--muted);
      border: 1px solid var(--border);
      font-weight: 600;
    }
    .hint{
      margin-top: 12px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.35;
    }
    .msg{
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid var(--border);
      font-size: 13px;
      line-height: 1.35;
    }
    .ok{ border-color: rgba(57,217,138,0.35); }
    .bad{ border-color: rgba(255,93,93,0.35); }
    code{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <h1>{{ title }}</h1>
        <div class="sub">iOS → Linux 로컬 전송 (텍스트/파일)</div>
      </div>
      <div class="pill">저장 위치: <code>./inbox/</code></div>
    </div>

    <div class="card">
      <form method="post" enctype="multipart/form-data">
        <label for="note">텍스트 (선택)</label>
        <textarea id="note" name="note" placeholder="여기에 붙여넣기/작성..."></textarea>

        <label for="file">파일 (선택)</label>
        <input id="file" type="file" name="file" />

        <label for="tag">태그/메모 (선택)</label>
        <input id="tag" type="text" name="tag" placeholder="예: receipts / temp / misc" />

        <div class="row">
          <button class="send" type="submit">Send</button>
          <button class="clear" type="reset">Clear</button>
        </div>
      </form>

      {% if message %}
        <div class="msg {{ 'ok' if ok else 'bad' }}">{{ message|safe }}</div>
      {% endif %}

      <div class="hint">
        • 텍스트만 보내도 되고, 파일만 보내도 됩니다.<br>
        • 파일은 자동으로 안전한 이름으로 저장됩니다.<br>
        • 같은 Wi-Fi(또는 같은 네트워크)에 있어야 접속됩니다.
      </div>
    </div>
  </div>
</body>
</html>
"""

def nowstamp():
    # 파일명에 쓸 타임스탬프 (로컬 시간 기준)
    return datetime.now().strftime("%Y%m%d-%H%M%S")

def utc_iso():
    return datetime.now(timezone.utc).isoformat()

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template_string(PAGE, title=APP_TITLE, message=None, ok=True)

    note = (request.form.get("note") or "").strip()
    tag = (request.form.get("tag") or "").strip()
    up = request.files.get("file")

    if not note and (not up or up.filename == ""):
        return render_template_string(
            PAGE, title=APP_TITLE, ok=False,
            message="보낼 내용이 없습니다. 텍스트 또는 파일 중 하나를 넣어주세요."
        )

    # 하나의 전송 단위를 묶는 ID
    transfer_id = uuid.uuid4().hex
    ts = nowstamp()

    saved_text_path = None
    saved_file_path = None

    # 1) 텍스트 저장
    if note:
        saved_text_path = TEXT_DIR / f"{ts}-{transfer_id}.txt"
        saved_text_path.write_text(note, encoding="utf-8")

    # 2) 파일 저장
    if up and up.filename:
        # 경로 traversal 방지 + 파일명 정리
        original = up.filename
        safe = secure_filename(original) or f"upload-{transfer_id}"
        # 같은 이름 충돌 방지: prefix로 ts+id를 붙임
        saved_file_path = FILE_DIR / f"{ts}-{transfer_id}-{safe}"
        up.save(saved_file_path)

    # 3) 메타데이터 저장 (무엇을 받았는지 기록)
    meta = {
        "transfer_id": transfer_id,
        "received_at_utc": utc_iso(),
        "tag": tag,
        "text_saved": str(saved_text_path) if saved_text_path else None,
        "file_saved": str(saved_file_path) if saved_file_path else None,
        "remote_addr": request.headers.get("X-Forwarded-For", request.remote_addr),
        "user_agent": request.headers.get("User-Agent"),
    }
    (META_DIR / f"{ts}-{transfer_id}.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    parts = []
    if saved_text_path:
        parts.append(f"✅ 텍스트 저장: <code>{saved_text_path}</code>")
    if saved_file_path:
        parts.append(f"✅ 파일 저장: <code>{saved_file_path}</code>")
    if tag:
        parts.append(f"🏷️ 태그: <code>{tag}</code>")

    return render_template_string(
        PAGE, title=APP_TITLE, ok=True,
        message="<br>".join(parts)
    )

if __name__ == "__main__":
    # 0.0.0.0: 같은 네트워크의 iOS가 접속할 수 있게 함
    app.run(host="0.0.0.0", port=8000, debug=False)

