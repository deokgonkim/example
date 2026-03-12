const message = document.querySelector("#message");
const pingButton = document.querySelector("#ping-button");

async function pingBackend() {
  if (!window.__TAURI_INTERNALS__) {
    message.textContent = "Tauri runtime not detected. Open this in the desktop app.";
    return;
  }

  const { invoke } = window.__TAURI_INTERNALS__;
  const response = await invoke("greet", { name: "from the frontend" });
  message.textContent = response;
}

pingButton.addEventListener("click", () => {
  pingBackend().catch((error) => {
    message.textContent = `Backend call failed: ${error}`;
  });
});
