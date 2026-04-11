'use strict';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createHtml({ name, url }) {
  const escapedName = escapeHtml(name);
  const escapedUrl = escapeHtml(url);
  const nextHref = '/?r=' + Date.now();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapedName}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5efe6;
        --card: #fffaf3;
        --text: #1e1b18;
        --muted: #6e6257;
        --accent: #b3472f;
        --accent-soft: rgba(179, 71, 47, 0.1);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Georgia, "Times New Roman", serif;
        background:
          radial-gradient(circle at top, rgba(179, 71, 47, 0.16), transparent 30%),
          linear-gradient(180deg, #f8f1e7 0%, var(--bg) 100%);
        color: var(--text);
      }

      main {
        width: min(920px, 100%);
        background: var(--card);
        border: 1px solid rgba(30, 27, 24, 0.08);
        border-radius: 20px;
        padding: 32px;
        box-shadow: 0 18px 50px rgba(30, 27, 24, 0.08);
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 5vw, 3.5rem);
        line-height: 1;
        white-space: nowrap;
      }

      p {
        margin: 0 0 16px;
        color: var(--muted);
        font-size: 1.05rem;
      }

      a {
        color: var(--accent);
        word-break: break-all;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 12px;
      }

      .button {
        display: inline-block;
        padding: 10px 16px;
        border-radius: 999px;
        border: 1px solid rgba(179, 71, 47, 0.24);
        text-decoration: none;
        font-weight: 700;
        color: var(--accent);
        background: transparent;
        cursor: pointer;
        font: inherit;
      }

      .button-stop {
        background: var(--accent-soft);
      }

      .status {
        min-height: 1.2em;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="status" id="status">Redirecting in 4 seconds.</p>
      <h1 id="movie-title">${escapedName}</h1>
      <p><a href="${escapedUrl}" rel="noreferrer">${escapedUrl}</a></p>
      <div class="actions">
        <a class="button" href="${nextHref}">Next</a>
        <button class="button button-stop" id="stop-button" type="button">Stop</button>
      </div>
    </main>
    <script>
      const targetUrl = ${JSON.stringify(url)};
      const status = document.getElementById('status');
      const title = document.getElementById('movie-title');
      const stopButton = document.getElementById('stop-button');
      const minTitleFontSize = 20;

      function fitTitleToSingleLine() {
        title.style.fontSize = '';

        let fontSize = parseFloat(window.getComputedStyle(title).fontSize);
        title.style.fontSize = fontSize + 'px';

        while (title.scrollWidth > title.clientWidth && fontSize > minTitleFontSize) {
          fontSize -= 1;
          title.style.fontSize = fontSize + 'px';
        }
      }

      fitTitleToSingleLine();
      window.addEventListener('resize', fitTitleToSingleLine);

      let redirectTimer = window.setTimeout(function redirectToUrl() {
        window.location.href = targetUrl;
      }, 4000);

      stopButton.addEventListener('click', function stopRedirect() {
        if (redirectTimer !== null) {
          window.clearTimeout(redirectTimer);
          redirectTimer = null;
        }

        status.textContent = 'Redirect stopped.';
        stopButton.disabled = true;
      });
    </script>
  </body>
</html>`;
}

module.exports = {
  createHtml
};
