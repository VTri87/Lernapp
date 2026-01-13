const LETTERS = [
  { text: "A", speak: "A" },
  { text: "B", speak: "Be" },
  { text: "C", speak: "Ce" },
  { text: "D", speak: "De" },
  { text: "E", speak: "E" },
  { text: "F", speak: "Ef" },
  { text: "G", speak: "Ge" },
  { text: "H", speak: "Ha" },
  { text: "I", speak: "I" },
  { text: "J", speak: "Jot" },
  { text: "K", speak: "Ka" },
  { text: "L", speak: "El" },
  { text: "M", speak: "Em" },
  { text: "N", speak: "En" },
  { text: "O", speak: "O" },
  { text: "P", speak: "Pe" },
  { text: "Q", speak: "Ku" },
  { text: "R", speak: "Er" },
  { text: "S", speak: "Es" },
  { text: "T", speak: "Te" },
  { text: "U", speak: "U" },
  { text: "V", speak: "Vau" },
  { text: "W", speak: "We" },
  { text: "X", speak: "Ix" },
  { text: "Y", speak: "Ypsilon" },
  { text: "Z", speak: "Zet" },
  { text: "\u00c4", speak: "Ae" },
  { text: "\u00d6", speak: "Oe" },
  { text: "\u00dc", speak: "Ue" },
  { text: "\u00df", speak: "Eszett" }
];

const grid = document.getElementById("letterGrid");
const nowValue = document.getElementById("nowValue");
const autoSpeak = document.getElementById("autoSpeak");
const repeatBtn = document.getElementById("repeatBtn");
const customInput = document.getElementById("customInput");
const speakInputBtn = document.getElementById("speakInputBtn");
const voiceSelect = document.getElementById("voiceSelect");
const testVoiceBtn = document.getElementById("testVoiceBtn");
const rateSlider = document.getElementById("rateSlider");
const pitchSlider = document.getElementById("pitchSlider");
const rateValue = document.getElementById("rateValue");
const pitchValue = document.getElementById("pitchValue");

let lastUtteranceText = "";
let activeButton = null;
let availableVoices = [];
const SETTINGS_KEY = "lernapp_voice_settings_v1";

function buildGrid() {
  LETTERS.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.innerHTML = `${item.text}${item.hint ? `<small>${item.hint}</small>` : ""}`;
    button.addEventListener("click", () => handleSpeak(item, button));
    grid.appendChild(button);
  });
}

function handleSpeak(item, button) {
  const speakText = item.speak || item.text;
  lastUtteranceText = speakText;
  nowValue.textContent = item.text;
  if (activeButton) {
    activeButton.classList.remove("active");
  }
  activeButton = button;
  button.classList.add("active");

  if (autoSpeak.checked) {
    speak(speakText);
  }
}

function handleCustomSpeak() {
  const text = customInput.value.trim();
  if (!text) {
    return;
  }
  lastUtteranceText = text;
  nowValue.textContent = text;
  if (activeButton) {
    activeButton.classList.remove("active");
    activeButton = null;
  }
  speak(text);
}

function setVoiceOptions() {
  availableVoices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";

  const germanVoices = availableVoices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("de")
  );
  const list = germanVoices.length ? germanVoices : availableVoices;

  list.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  if (list.length) {
    const saved = loadSettings();
    if (saved && saved.voiceName) {
      const matchIndex = list.findIndex((voice) => voice.name === saved.voiceName);
      voiceSelect.value = matchIndex >= 0 ? String(matchIndex) : "0";
    } else {
      voiceSelect.value = "0";
    }
  }
}

function getSelectedVoice() {
  const index = Number(voiceSelect.value);
  const germanVoices = availableVoices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("de")
  );
  const list = germanVoices.length ? germanVoices : availableVoices;
  return list[index] || null;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("Dein Browser kann nicht vorlesen.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getSelectedVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = "de-DE";
  utterance.rate = Math.max(0.4, Number(rateSlider.value));
  utterance.pitch = Number(pitchSlider.value);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

repeatBtn.addEventListener("click", () => {
  if (lastUtteranceText) {
    speak(lastUtteranceText);
  }
});

speakInputBtn.addEventListener("click", handleCustomSpeak);
customInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleCustomSpeak();
  }
});

function updateSliderLabels() {
  rateValue.textContent = rateSlider.value;
  pitchValue.textContent = pitchSlider.value;
}

rateSlider.addEventListener("input", updateSliderLabels);
pitchSlider.addEventListener("input", updateSliderLabels);
updateSliderLabels();

testVoiceBtn.addEventListener("click", () => {
  speak("Hallo, ich bin deine Stimme.");
});

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveSettings() {
  const voice = getSelectedVoice();
  const data = {
    voiceName: voice ? voice.name : null,
    rate: Number(rateSlider.value),
    pitch: Number(pitchSlider.value),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

function applySavedSettings() {
  const saved = loadSettings();
  if (!saved) {
    return;
  }
  if (typeof saved.rate === "number") {
    rateSlider.value = String(saved.rate);
  }
  if (typeof saved.pitch === "number") {
    pitchSlider.value = String(saved.pitch);
  }
  updateSliderLabels();
}

voiceSelect.addEventListener("change", saveSettings);
rateSlider.addEventListener("change", saveSettings);
pitchSlider.addEventListener("change", saveSettings);

window.speechSynthesis.addEventListener("voiceschanged", setVoiceOptions);
setVoiceOptions();
applySavedSettings();
buildGrid();
