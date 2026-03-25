/*
 * SPDX-FileCopyrightText: 2025 INFO.nl
 * SPDX-License-Identifier: EUPL-1.2+
 */

const AI_ERROR_FALLBACK = "Het genereren van metadata is mislukt. Probeer het opnieuw.";

const AI_ERROR_MAP: Array<{ match: string; message: string }> = [
  {
    match: "empty or contains no extractable text",
    message: "Het document bevat geen leesbare tekst.",
  },
  { match: "Content exceeds maximum size", message: "Het document is te groot om te verwerken." },
  { match: "timed out", message: "Het verzoek heeft te lang geduurd. Probeer het opnieuw." },
  { match: "OPENROUTER_API_KEY", message: "De AI-service is niet correct geconfigureerd." },
  {
    match: "Failed to extract text",
    message: "De tekst kon niet uit het document worden gelezen.",
  },
  { match: "OpenRouter API error", message: "De AI-service is tijdelijk niet beschikbaar." },
];

export function toNlAiError(error: string | null): string {
  if (!error) return AI_ERROR_FALLBACK;
  return AI_ERROR_MAP.find(({ match }) => error.includes(match))?.message ?? AI_ERROR_FALLBACK;
}
