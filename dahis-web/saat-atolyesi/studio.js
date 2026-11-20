const { models, films } = window.WATCH_CATALOG;

const modes = { normal: "Normal", negative: "Negatif" };

const byId = (id) => document.getElementById(id);
const form = byId("studio");
const stage = byId("stage");
const mainWatch = byId("main-watch");
const normalWatch = byId("normal-watch");
const negativeWatch = byId("negative-watch");
const compareButton = byId("compare");
const copyFallback = byId("copy-fallback");
const copyLabel = byId("copy-label");
const announce = byId("announce");

let isComparing = false;
let summaryText = "";
let copyFeedback;

function addOption(container, name, value, title, imageSource, checked, details) {
  const label = document.createElement("label");
  label.className = `option ${name}-option`;
  const input = document.createElement("input");
  input.type = "radio";
  input.name = name;
  input.value = value;
  input.defaultChecked = checked;
  const thumbnail = document.createElement("span");
  thumbnail.className = name === "model" ? "model-thumbnail" : "character-thumbnail";
  const image = document.createElement("img");
  image.src = imageSource;
  image.alt = "";
  image.width = 160;
  image.height = 110;
  thumbnail.append(image);
  const text = document.createElement("span");
  text.textContent = title;
  label.append(input, thumbnail, text);
  if (details) {
    label.style.setProperty("--swatch", details.swatch);
    const color = document.createElement("span");
    color.className = "film-color";
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.setAttribute("aria-hidden", "true");
    color.append(swatch, document.createTextNode(details.name));
    label.append(color);
  } else {
    const mark = document.createElement("span");
    mark.className = "selection-mark";
    mark.setAttribute("aria-hidden", "true");
    label.append(mark);
  }
  container.append(label);
}

for (const [id, model] of Object.entries(models)) {
  addOption(byId("model-options"), "model", id, id === "one" ? "dahi's One" : model.name, model.thumbnail, id === "f91w");
}
for (const [id, film] of Object.entries(films)) {
  addOption(byId("film-options"), "film", id, film.character, film.image, id === "green", film);
}

const parameters = new URLSearchParams(window.location.search);
const requested = { model: parameters.get("model"), film: parameters.get("film"), mode: parameters.get("mode") };
for (const [name, choices] of Object.entries({ model: models, film: films, mode: modes })) {
  if (Object.hasOwn(choices, requested[name])) form.elements[name].value = requested[name];
}

function clearCopyFeedback() {
  window.clearTimeout(copyFeedback);
  copyLabel.textContent = "Özeti kopyala";
  copyFallback.hidden = true;
}

function render() {
  const selection = new FormData(form);
  const model = selection.get("model");
  const film = selection.get("film");
  const mode = selection.get("mode");
  const filmDetails = films[film];
  const modelDetails = models[model];

  byId("single-view").hidden = isComparing;
  byId("comparison-view").hidden = !isComparing;
  compareButton.setAttribute("aria-pressed", String(isComparing));
  byId("compare-text").textContent = isComparing ? "Tekli görünüm" : "Yan yana karşılaştır";
  stage.style.setProperty("--glow", filmDetails.glow);

  if (isComparing) {
    window.renderWatchPreview(normalWatch, model, film, "normal");
    window.renderWatchPreview(negativeWatch, model, film, "negative");
    byId("normal-label").dataset.selected = String(mode === "normal");
    byId("negative-label").dataset.selected = String(mode === "negative");
  } else {
    window.renderWatchPreview(mainWatch, model, film, mode);
  }

  byId("stage-brand").textContent = modelDetails.brand;
  byId("stage-model").textContent = modelDetails.name;
  byId("summary-model").textContent = `${modelDetails.brand} ${modelDetails.name}`;
  byId("summary-character").textContent = filmDetails.character;
  byId("summary-film").textContent = filmDetails.name;
  byId("summary-mode").textContent = modes[mode];
  byId("summary-swatch").style.setProperty("--swatch", filmDetails.swatch);
  summaryText = `DAHİS Saat Atölyesi · ${modelDetails.brand} ${modelDetails.name} · ${filmDetails.character} · ${filmDetails.name} film · ${modes[mode]} ekran`;
}

form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("change", () => {
  clearCopyFeedback();
  render();
  announce.textContent = summaryText;
});

compareButton.addEventListener("click", () => {
  isComparing = !isComparing;
  render();
  announce.textContent = isComparing ? "Normal ve negatif ekran yan yana gösteriliyor." : "Tekli önizleme açıldı.";
});

byId("reset-design").addEventListener("click", () => {
  form.reset();
  isComparing = false;
  clearCopyFeedback();
  render();
  announce.textContent = "Seçimler sıfırlandı. " + summaryText;
});

byId("copy-design").addEventListener("click", async () => {
  clearCopyFeedback();
  const textToCopy = summaryText;
  try {
    await navigator.clipboard.writeText(textToCopy);
    if (summaryText === textToCopy) {
      copyLabel.textContent = "Kopyalandı";
      copyFeedback = window.setTimeout(clearCopyFeedback, 2200);
    }
    announce.textContent = "Seçim özeti panoya kopyalandı.";
  } catch {
    const field = byId("summary-text");
    field.value = summaryText;
    copyFallback.hidden = false;
    field.focus();
    field.select();
  }
});

render();
