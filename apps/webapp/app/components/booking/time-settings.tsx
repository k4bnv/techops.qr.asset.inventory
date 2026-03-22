import { useRef } from "react";
import { useActionData } from "react-router";
import { useZorm } from "react-zorm";
import z from "zod";
import { Form } from "~/components/custom-form";
import FormRow from "~/components/forms/form-row";
import Input from "~/components/forms/input";
import { Button } from "~/components/shared/button";
import { Card } from "~/components/shared/card";
import { Spinner } from "~/components/shared/spinner";
import { useDisabled } from "~/hooks/use-disabled";
import type { BookingSettingsActionData } from "~/routes/_layout+/settings.bookings";
import { getValidationErrors } from "~/utils/http";
import { handleActivationKeyPress } from "~/utils/keyboard";

export const TimeSettingsSchema = z.object({
  bufferStartTime: z.coerce
    .number()
    .min(0, "Buffer must be at least 0 hours")
    .max(168, "Buffer cannot exceed 168 hours (7 days)"),
  maxBookingLength: z.coerce
    .number()
    .min(1, "Maximum booking length must be at least 1 hour")
    .max(8760, "Maximum booking length cannot exceed 8760 hours (1 year)")
    .optional()
    .or(z.literal("")),
  maxBookingLengthSkipClosedDays: z
    .string()
    .transform((val) => val === "on")
    .default("false"),
});

export function TimeSettings({
  header,
  defaultBufferValue = 0,
  defaultMaxLengthValue = null,
  defaultMaxBookingLengthSkipClosedDays = false,
}: {
  header: { title: string; subHeading?: string };
  defaultBufferValue: number;
  defaultMaxLengthValue: number | null;
  defaultMaxBookingLengthSkipClosedDays: boolean;
}) {
  const disabled = useDisabled();
  const zo = useZorm("EnableWorkingHoursForm", TimeSettingsSchema);
  const maxBookingLengthSkipClosedDaysRef = useRef<HTMLInputElement>(null);

  const actionData = useActionData<BookingSettingsActionData>();
  /** This handles server side errors in case client side validation fails */
  const validationErrors = getValidationErrors<typeof TimeSettingsSchema>(
    actionData?.error
  );

  return (
    <Card>
      <div className="mb-4 border-b pb-4">
        <h3 className="text-text-lg font-semibold">{header.title}</h3>
        <p className="text-sm text-gray-600">{header.subHeading}</p>
      </div>
      <div>
        <Form ref={zo.ref} method="post">
          <FormRow
            rowLabel={`Minimale voorafgaande kennisgeving (uren)`}
            subHeading={
              <div>
                Gebruikers moeten ten minste dit aantal uren voor de starttijd van hun reservering
                boeken. Voer 0 in om onmiddellijke reserveringen toe te staan. Deze beperking is
                alleen geldig voor <strong>Self service</strong> &{" "}
                <strong>Basis</strong> gebruikers.
              </div>
            }
            className="border-b-0 pb-[10px] pt-0"
            required
          >
            <Input
              label="Minimale voorafgaande kennisgeving (uren)"
              hideLabel
              type="number"
              name={zo.fields.bufferStartTime()}
              disabled={disabled}
              defaultValue={defaultBufferValue}
              required
              title={"Minimale voorafgaande kennisgeving (uren)"}
              min={0}
              max={168}
              step={1}
              inputClassName="w-24"
              error={
                validationErrors?.bufferStartTime?.message ||
                zo.errors.bufferStartTime()?.message
              }
            />
          </FormRow>

          <FormRow
            rowLabel={`Maximale reserveringsduur (uren)`}
            subHeading={
              <div>
                Stel de maximale duur in voor een enkele reservering. Laat leeg voor geen
                limiet. Dit helpt overmatig lange reserveringen te voorkomen.
              </div>
            }
            className="border-b-0 pb-[10px]"
          >
            <div className="flex flex-col">
              <Input
                label="Maximale reserveringsduur (uren)"
                hideLabel
                type="number"
                name={zo.fields.maxBookingLength()}
                disabled={disabled}
                defaultValue={defaultMaxLengthValue || ""}
                placeholder="Geen limiet"
                title={"Maximale reserveringsduur (uren)"}
                min={1}
                max={8760}
                step={1}
                inputClassName="w-24"
                error={
                  validationErrors?.maxBookingLength?.message ||
                  zo.errors.maxBookingLength()?.message
                }
              />
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="maxBookingLengthSkipClosedDays"
                  label="Gesloten dagen overslaan"
                  hideLabel
                  type="checkbox"
                  name={zo.fields.maxBookingLengthSkipClosedDays()}
                  disabled={disabled}
                  defaultChecked={
                    defaultMaxBookingLengthSkipClosedDays || false
                  }
                  title={"Gesloten dagen overslaan"}
                  error={
                    validationErrors?.maxBookingLengthSkipClosedDays?.message ||
                    zo.errors.maxBookingLengthSkipClosedDays()?.message
                  }
                  className="inline-block w-[18px]"
                  inputClassName="px-[9px]"
                  ref={maxBookingLengthSkipClosedDaysRef}
                />
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (maxBookingLengthSkipClosedDaysRef.current) {
                      maxBookingLengthSkipClosedDaysRef.current.click();
                    }
                  }}
                  onKeyDown={handleActivationKeyPress(() => {
                    if (maxBookingLengthSkipClosedDaysRef.current) {
                      maxBookingLengthSkipClosedDaysRef.current.click();
                    }
                  })}
                  className="cursor-default"
                >
                  Gesloten dagen overslaan
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Gesloten dagen worden niet meegenomen in de berekeningen.
              </p>
            </div>
          </FormRow>

          <div className="text-right">
            <Button
              type="submit"
              disabled={disabled}
              value="updateTimeSettings"
              name="intent"
            >
              {disabled ? <Spinner /> : "Instellingen opslaan"}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
}
