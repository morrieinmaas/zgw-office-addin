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

    const aiResponse = await this.httpService.POSTAI<LlmRelayResponse>(
      JSON.stringify({
        content: documentInfo.inhoud,
        content_type: documentInfo.contentType,
        attachment_type: documentInfo.attachmentType,
        output_schema: { beschrijving: "str" },
        prompt:
          "Genereer een beknopte beschrijving van de inhoud van dit document. Vermeld in de beschrijving expliciet wat voor type bestand het is op basis van de gegeven context (e-mailbericht, e-mailbijlage of losstaand document). De beschrijving mag maximaal 1000 karakters bevatten.",
      }),
    );

    LoggerService.debug("AI response received", { aiResponse });

    return aiResponse;
  }
}
