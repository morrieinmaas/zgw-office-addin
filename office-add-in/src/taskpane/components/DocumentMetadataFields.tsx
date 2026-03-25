/*
 * SPDX-FileCopyrightText: 2025 INFO.nl
 * SPDX-License-Identifier: EUPL-1.2+
 */

import type { FieldValues, Path } from "react-hook-form";
import React, { useState } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { Input } from "./form/Input";
import { Textarea } from "./form/Textarea";
import { Select } from "./form/Select";
import {
  addDocumentSchema,
  vertrouwelijkheidaanduiding,
  taalOptions,
  DocumentMetadataFieldsProps,
} from "../../hooks/types";
import { mq } from "./styles/layout";
import { useGenerateMetaData } from "../../hooks/useGenerateMetaData";
import { translateResponseError } from "../../utils/aiErrors";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: tokens.spacingVerticalM,
    gridAutoFlow: "dense",
    [mq.md]: {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  gridColumnSpan1: {
    gridColumn: "auto / span 1",
  },
  gridColumnSpan2: {
    gridColumn: "auto / span 1",
    [mq.md]: {
      gridColumn: "auto / span 2",
    },
  },
});

// To be used within a react-hook-form FormProvider
export function DocumentMetadataFields<T extends FieldValues>({
  zaakinformatieobjecten,
  statuses,
  namePrefix = "",
  control,
  documentInfo,
}: DocumentMetadataFieldsProps<T>) {
  const styles = useStyles();
  const { setValue } = useFormContext<T>();
  const { mutateAsync: generateMetaData, isPending } = useGenerateMetaData();
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);


  // Watch the ZIO field to determine if vertrouwelijkheidsaanduiding dropdown should be enabled
  const selectedInformatieobjecttype = useWatch({
    name: `${namePrefix}informatieobjecttype` as import("react-hook-form").Path<T>,
    control,
  });

  // Watch vertrouwelijkheidsaanduiding field to ensure re-render when form.setValue is called from parent
  useWatch({
    name: `${namePrefix}vertrouwelijkheidaanduiding` as import("react-hook-form").Path<T>,
    control,
  });

  const vertrouwelijkheidOptions = vertrouwelijkheidaanduiding.map((value) => ({
    label: value.replace(/_/g, " "),
    value,
  }));

  const handleGenerateMetaData = async () => {
    setAiError(null);
    setAiModel(null);
    const enrichedDocumentInfo = {
      ...documentInfo,
      informatieobjecttypenOptions: zaakinformatieobjecten.map((zio) => zio.omschrijving),
    };
    const response = await generateMetaData(enrichedDocumentInfo);
    if (response.success && response.data) {
      setValue(`${namePrefix}beschrijving` as Path<T>, response.data.beschrijving as never);
      setValue(`${namePrefix}taal` as Path<T>, response.data.taal as never);
      if (response.data.informatieobjecttype) {
        const match = zaakinformatieobjecten.find(
          (zio) => zio.omschrijving === response.data!.informatieobjecttype
        );
        if (match?.url) {
          setValue(`${namePrefix}informatieobjecttype` as Path<T>, match.url as never);
        }
      }
      setAiModel(response.model_used);
    } else {
      setAiError(translateResponseError(response.error));
    }
  };

  return (
    <section className={styles.grid}>
      <div className={styles.gridColumnSpan2}>
        <Button
          appearance="primary"
          disabled={isPending}
          onClick={handleGenerateMetaData}
        >
          {isPending ? "Bezig met genereren..." : "Voorinvullen met AI"}
        </Button>
        {aiModel && (
          <p style={{ color: tokens.colorNeutralForeground3, margin: 0, marginTop: tokens.spacingVerticalXS, fontSize: tokens.fontSizeBase200 }}>
            {`Model used: ${aiModel}`}
          </p>
        )}
        {aiError && (
          <p style={{ color: tokens.colorPaletteRedForeground1, margin: 0, marginTop: tokens.spacingVerticalXS }}>
            {aiError}
          </p>
        )}
      </div>
      <Input
        className={styles.gridColumnSpan2}
        name={`${namePrefix}auteur`}
        label="Auteur"
        required={!addDocumentSchema.shape.auteur.isOptional()}
      />
      <Textarea
        className={styles.gridColumnSpan2}
        name={`${namePrefix}beschrijving`}
        label="Beschrijving"
        required={!addDocumentSchema.shape.beschrijving.isOptional()}
      />
      <Select
        className={styles.gridColumnSpan1}
        name={`${namePrefix}taal`}
        label="Taal"
        options={taalOptions}
        required={!addDocumentSchema.shape.taal.isOptional()}
      />
      <Select
        className={styles.gridColumnSpan1}
        name={`${namePrefix}informatieobjecttype`}
        label="Informatieobjecttype"
        options={zaakinformatieobjecten.map((zio) => ({
          label: zio.omschrijving,
          value: zio.url || "",
        }))}
        required={!addDocumentSchema.shape.informatieobjecttype.isOptional()}
      />
      <Select
        className={styles.gridColumnSpan1}
        name={`${namePrefix}vertrouwelijkheidaanduiding`}
        label="Vertrouwelijkheid"
        options={vertrouwelijkheidOptions}
        required={!addDocumentSchema.shape.vertrouwelijkheidaanduiding.isOptional()}
        disabled={!selectedInformatieobjecttype}
      />
      <Select
        className={styles.gridColumnSpan1}
        name={`${namePrefix}status`}
        label="Status"
        options={statuses.map((status) => ({
          label: status.replace(/_/g, " "),
          value: status,
        }))}
        required={!addDocumentSchema.shape.status.isOptional()}
      />
      <Input
        className={styles.gridColumnSpan1}
        type="date"
        name={`${namePrefix}creatiedatum`}
        label="Creatiedatum"
        required={!addDocumentSchema.shape.creatiedatum.isOptional()}
      />
    </section>
  );
}
