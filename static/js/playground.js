const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );

const tokenPattern =
  /(?<comment>\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<number>\b(?:0[xob][\da-f]+|\d+(?:\.\d+)?)\b)|(?<keyword>\b(?:async|await|break|case|catch|class|const|continue|default|delete|do|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|of|return|static|super|switch|this|throw|true|try|typeof|undefined|var|void|while|yield)\b)|(?<builtin>\b(?:Array|Boolean|Date|Error|JSON|Map|Math|Number|Object|Promise|RegExp|Set|String|Uint8Array|Uint8ClampedArray|WeakMap|WeakSet|console|document|window)\b)|(?<function>\b[A-Za-z_$][\w$]*(?=\s*\())|(?<operator>=>|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||\?\?|[+\-*/%<>=!?])/giu;

const highlightJavaScript = (source) => {
  let result = "";
  let cursor = 0;

  for (const match of source.matchAll(tokenPattern)) {
    result += escapeHtml(source.slice(cursor, match.index));

    const token = Object.entries(match.groups).find(([, value]) => value);
    const className = token ? `token token--${token[0]}` : "token";

    result += `<span class="${className}">${escapeHtml(match[0])}</span>`;
    cursor = match.index + match[0].length;
  }

  result += escapeHtml(source.slice(cursor));
  return `${result}\n`;
};

const buildPreviewDocument = (source, playgroundId) => {
  const serializedSource = JSON.stringify(source).replaceAll("<", "\\u003c");
  const serializedId = JSON.stringify(playgroundId);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * { box-sizing: border-box; }
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #050809; }
      canvas { display: block; width: 100%; height: 100%; image-rendering: pixelated; }
    </style>
  </head>
  <body>
    <canvas id="effect-canvas"></canvas>
    <script>
      const report = (state, message = "") => {
        parent.postMessage(
          { channel: "aifilw-playground", playgroundId: ${serializedId}, state, message },
          "*",
        );
      };

      window.addEventListener("error", (event) => {
        report("error", event.message);
      });

      try {
        const source = ${serializedSource};
        new Function(source + "\\n//# sourceURL=${playgroundId}.js")();
        report("ready");
      } catch (error) {
        report("error", error instanceof Error ? error.message : String(error));
      }
    <\/script>
  </body>
</html>`;
};

const setupPlayground = (playground) => {
  const playgroundId = playground.dataset.playground;
  const tabs = [...playground.querySelectorAll("[data-playground-tab]")];
  const panels = [...playground.querySelectorAll("[data-playground-panel]")];
  const sourceInput = playground.querySelector("[data-playground-source]");
  const highlightedCode = playground.querySelector(
    "[data-playground-highlight]",
  );
  const frame = playground.querySelector("[data-playground-frame]");
  const status = playground.querySelector("[data-playground-status]");
  const runButton = playground.querySelector(
    '[data-playground-action="run"]',
  );
  const resetButton = playground.querySelector(
    '[data-playground-action="reset"]',
  );
  const initialSource = sourceInput.value.trim();

  const updateHighlight = () => {
    highlightedCode.innerHTML = highlightJavaScript(sourceInput.value);
    highlightedCode.parentElement.scrollTop = sourceInput.scrollTop;
    highlightedCode.parentElement.scrollLeft = sourceInput.scrollLeft;
  };

  const selectTab = (name, { focus = false } = {}) => {
    for (const tab of tabs) {
      const isSelected = tab.dataset.playgroundTab === name;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;

      if (isSelected && focus) {
        tab.focus();
      }
    }

    for (const panel of panels) {
      panel.hidden = panel.dataset.playgroundPanel !== name;
    }
  };

  const run = () => {
    status.classList.remove("playground__status--error");
    status.textContent = "";
    status.hidden = true;
    frame.srcdoc = buildPreviewDocument(sourceInput.value, playgroundId);
    selectTab("preview");
  };

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      selectTab(tab.dataset.playgroundTab);
    });

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const currentIndex = tabs.indexOf(tab);
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex].dataset.playgroundTab, { focus: true });
    });
  }

  sourceInput.addEventListener("input", updateHighlight);
  sourceInput.addEventListener("scroll", updateHighlight);
  sourceInput.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    const start = sourceInput.selectionStart;
    const end = sourceInput.selectionEnd;
    sourceInput.setRangeText("  ", start, end, "end");
    updateHighlight();
  });

  runButton.addEventListener("click", run);
  resetButton.addEventListener("click", () => {
    sourceInput.value = initialSource;
    updateHighlight();
    run();
  });

  window.addEventListener("message", (event) => {
    const message = event.data;

    if (
      event.source !== frame.contentWindow ||
      message?.channel !== "aifilw-playground" ||
      message.playgroundId !== playgroundId
    ) {
      return;
    }

    if (message.state === "error") {
      status.classList.add("playground__status--error");
      status.textContent = `Error: ${message.message}`;
      status.hidden = false;
      return;
    }

    status.classList.remove("playground__status--error");
    status.textContent = "";
    status.hidden = true;
  });

  updateHighlight();
  run();
};

for (const playground of document.querySelectorAll("[data-playground]")) {
  setupPlayground(playground);
}
