/*
 * SPDX-FileCopyrightText: 2025 INFO.nl
 * SPDX-License-Identifier: EUPL-1.2+
 */

import { LoggerService } from "./LoggerService";
import { DocumentInfo, LlmRelayResponse } from "../src/types";
import { HttpService } from "./HttpService";

export class AiService {
  constructor(private readonly httpService: HttpService) {}

  public async getMetadata(documentInfo: DocumentInfo) {
    LoggerService.debug(`Getting AI metadata for document "${documentInfo.title}"`, {
      title: documentInfo.title,
      contentType: documentInfo.contentType,
      attachmentType: documentInfo.attachmentType,
      inhoud: documentInfo.inhoud,
    });

    const options = documentInfo.informatieobjecttypenOptions ?? [];
    const attachmentTypeHint =
      documentInfo.attachmentType === "item"
        ? " Het attachment_type is 'item', wat betekent dat dit document een e-mailbericht zelf is."
        : documentInfo.attachmentType === "file"
          ? " Het attachment_type is 'file', wat betekent dat dit document een bijlage bij een e-mail is of een losstaand bestand."
          : "";

    const aiResponse = await this.httpService.POSTAI<LlmRelayResponse>(
      JSON.stringify({
        content: documentInfo.inhoud,
        content_type: documentInfo.contentType,
        attachment_type: documentInfo.attachmentType,
        output_schema: { beschrijving: "str", taal: "str", informatieobjecttype: "str | null" },
        prompt:
          "Genereer een beknopte beschrijving van de inhoud van dit document. Vermeld in de beschrijving expliciet wat voor type bestand het is op basis van de gegeven context (e-mailbericht, e-mailbijlage of losstaand document). De beschrijving mag maximaal 1000 karakters bevatten. Bepaal ook de taal van het document en geef de bijbehorende ISO 639-2/B taalcode terug in het veld 'taal'. Kies uitsluitend één van de volgende codes: dut (Nederlands), fre (Frans), eng (Engels), ger (Duits), fry (Fries). Bepaal ook het informatieobjecttype van dit document." +
          attachmentTypeHint +
          " Kies uitsluitend één van de volgende opties: " +
          options.map((o) => `"${o}"`).join(", ") +
          ". Als je niet zeker bent, geef dan null terug voor het veld 'informatieobjecttype'.",
      }),
    );

    LoggerService.debug("AI response received", { aiResponse });

    return aiResponse;
  }
}
