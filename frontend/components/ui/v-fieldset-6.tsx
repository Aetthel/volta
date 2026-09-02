"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Fieldset,
  FieldsetLegend,
  Input,
} from "@/components/ui/volta-ui";

export default function Particle() {
  return (
    <Fieldset className="flex w-full flex-col gap-5">
      <FieldsetLegend>Payment Information</FieldsetLegend>
      <Field>
        <FieldLabel>
          Cardholder name <span className="text-error">*</span>
        </FieldLabel>
        <Input
          autoComplete="cc-name"
          placeholder="Jane Smith"
          required
          type="text"
        />
        <FieldError>Cardholder name is required.</FieldError>
      </Field>
      <Field>
        <FieldLabel>
          Card number <span className="text-error">*</span>
        </FieldLabel>
        <Input
          autoComplete="cc-number"
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          required
          type="text"
        />
        <FieldError>Please enter a valid card number.</FieldError>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>
            Expiry date <span className="text-error">*</span>
          </FieldLabel>
          <Input
            autoComplete="cc-exp"
            placeholder="MM / YY"
            required
            type="text"
          />
          <FieldError>Invalid expiry date.</FieldError>
        </Field>
        <Field>
          <FieldLabel>
            CVC <span className="text-error">*</span>
          </FieldLabel>
          <Input
            autoComplete="cc-csc"
            inputMode="numeric"
            placeholder="123"
            required
            type="text"
          />
          <FieldDescription>3 or 4 digits on your card.</FieldDescription>
          <FieldError>Invalid CVC.</FieldError>
        </Field>
      </div>
    </Fieldset>
  );
}
