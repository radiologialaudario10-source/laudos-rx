// src/lib/speech.ts
const punctWords: Record<string, string> = {
  "ponto final": ".",
  "ponto": ".",
  "vírgula": ",",
  "virgula": ",",
  "ponto de interrogação": "?",
  "ponto de exclamação": "!",
  "dois pontos": ":",
  "ponto e vírgula": ";",
  "reticências": "…",
  "reticencas": "…",
  "abre aspas": "“",
  "fecha aspas": "”",
  "abre parênteses": "(",
  "fecha parênteses": ")",
};

function replaceSpokenPunctuation(text: string) {
  let t = " " + text.toLowerCase() + " ";
  for (const [k, v] of Object.entries(punctWords)) {
    const re = new RegExp(`\\s${k}\\s`, "g");
    t = t.replace(re, v + " ");
  }
  return t.trim();
}

export function polishPt(input: string) {
  if (!input) return input;
  // troca “vírgula”, “ponto”, etc por sinais
  let t = replaceSpokenPunctuation(input);

  // espaço antes de pontuação -> remove
  t = t.replace(/\s+([,.;:!?…])/g, "$1");

  // capitaliza primeira letra da frase
  t = t.replace(/(^\s*[a-zà-ú])/i, (m) => m.toUpperCase());

  // se não terminar com pontuação, acrescenta ponto
  if (!/[.!?…)]\s*$/.test(t)) t = t + ".";

  return t;
}
