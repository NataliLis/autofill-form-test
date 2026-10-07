(() => {
  "use strict";
  const form = document.getElementById("deeplink-form");
  const input = document.getElementById("deeplink-input");
  const runButton = document.getElementById("run-deeplink");
  const resetButton = document.getElementById("reset-deeplink");
  const status = document.getElementById("deeplink-status");
  const blockedSchemes = new Set(["data", "file", "javascript", "vbscript"]);

  function validateDeepLink(rawValue) {
    const value = rawValue.trim();
    const match = value.match(/^([a-z][a-z0-9+.-]*):\/\/\S+$/i);
    if (!value) return { error: "Введите диплинк." };
    if (!match) return { error: "Нужен полный URL со схемой и ://." };
    const scheme = match[1].toLowerCase();
    if (scheme === "http" || scheme === "https") return { error: "Введите custom URL scheme или Android intent, а не HTTP(S)-ссылку." };
    if (blockedSchemes.has(scheme)) return { error: `Схема ${scheme}:// не разрешена.` };
    return { value, scheme };
  }

  function setStatus(message, state = "") {
    status.textContent = message;
    status.dataset.state = state;
  }

  function updateButtons() {
    const hasValue = input.value.trim().length > 0;
    runButton.disabled = !hasValue;
    resetButton.disabled = !hasValue;
    input.removeAttribute("aria-invalid");
    setStatus("");
  }

  input.addEventListener("input", updateButtons);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = validateDeepLink(input.value);
    if (result.error) {
      input.setAttribute("aria-invalid", "true");
      setStatus(result.error, "error");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    setStatus(`Передаю ${result.scheme}:// браузеру…`, "ready");
    const link = document.createElement("a");
    link.href = result.value;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  form.addEventListener("reset", () => {
    requestAnimationFrame(() => {
      updateButtons();
      input.focus();
    });
  });

  const initialValue = new URLSearchParams(window.location.search).get("scheme");
  if (initialValue) input.value = initialValue;
  updateButtons();
})();
