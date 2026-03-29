import { useActionData } from "react-router";
import { useZorm } from "react-zorm";
import z from "zod";
import { useDisabled } from "~/hooks/use-disabled";
import type { getUserWithContact } from "~/modules/user/service.server";
import type { UserPageActionData } from "~/routes/_layout+/account-details.general";
import { getValidationErrors } from "~/utils/http";
import { zodFieldIsRequired } from "~/utils/zod";
import { Form } from "../custom-form";
import FormRow from "../forms/form-row";
import Input from "../forms/input";
import { Button } from "../shared/button";
import { Card } from "../shared/card";

export const UserContactDetailsFormSchema = z.object({
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  zipPostalCode: z.string().optional(),
  countryRegion: z.string().optional(),
});
export function UserContactDetailsForm({
  user,
}: {
  user: ReturnType<typeof getUserWithContact>;
}) {
  const zo = useZorm("UserContactDetailsForm", UserContactDetailsFormSchema);
  const actionData = useActionData<UserPageActionData>();
  const disabled = useDisabled();
  const isDisabled =
    disabled ||
    (user.sso && {
      reason: "U kunt uw gegevens niet bewerken wanneer u SSO gebruikt.",
    });
  const validationErrors = getValidationErrors<
    typeof UserContactDetailsFormSchema
  >(actionData?.error);

  return (
    <Card className="my-0">
      <div className="mb-6">
        <h3 className="text-text-lg font-semibold">Contactgegevens</h3>
        <p className="text-sm text-gray-600">
          Werk hier uw contactgegevens en adresinformatie bij. Deze informatie
          is zichtbaar voor andere gebruikers binnen uw werkruimte en kan worden
          gebruikt voor communicatiedoeleinden.
        </p>
      </div>
      <Form method="post" ref={zo.ref} className="" replace>
        <FormRow
          rowLabel="Telefoonnummer"
          className="border-t"
          required={zodFieldIsRequired(
            UserContactDetailsFormSchema.shape.phone
          )}
        >
          <Input
            label="Telefoon"
            type="tel"
            autoComplete="tel"
            hideLabel
            name={zo.fields.phone()}
            defaultValue={user?.contact?.phone || undefined}
            error={
              validationErrors?.phone?.message || zo.errors.phone()?.message
            }
            placeholder="+31 6 12345678"
            required={zodFieldIsRequired(
              UserContactDetailsFormSchema.shape.phone
            )}
            disabled={isDisabled}
          />
        </FormRow>

        <FormRow
          rowLabel="Adres"
          required={zodFieldIsRequired(
            UserContactDetailsFormSchema.shape.street
          )}
        >
          <Input
            label="Straat"
            type="text"
            autoComplete="street-address"
            name={zo.fields.street()}
            defaultValue={user?.contact?.street || undefined}
            error={
              validationErrors?.street?.message || zo.errors.street()?.message
            }
            hideLabel
            placeholder="Herengracht 182"
            required={zodFieldIsRequired(
              UserContactDetailsFormSchema.shape.street
            )}
            disabled={isDisabled}
          />
        </FormRow>

        <FormRow
          rowLabel="Stad"
          required={zodFieldIsRequired(UserContactDetailsFormSchema.shape.city)}
        >
          <Input
            label="Stad"
            type="text"
            hideLabel
            autoComplete="city"
            name={zo.fields.city()}
            defaultValue={user?.contact?.city || undefined}
            error={validationErrors?.city?.message || zo.errors.city()?.message}
            placeholder="Amsterdam"
            required={zodFieldIsRequired(
              UserContactDetailsFormSchema.shape.city
            )}
            disabled={isDisabled}
          />
        </FormRow>

        <FormRow
          rowLabel="Provincie en postcode"
          required={zodFieldIsRequired(
            UserContactDetailsFormSchema.shape.stateProvince
          )}
        >
          <div className="flex gap-6">
            <Input
              label="Provincie"
              hideLabel
              autoComplete="state"
              type="text"
              name={zo.fields.stateProvince()}
              defaultValue={user?.contact?.stateProvince || undefined}
              error={
                validationErrors?.stateProvince?.message ||
                zo.errors.stateProvince()?.message
              }
              placeholder="Noord-Holland"
              required={zodFieldIsRequired(
                UserContactDetailsFormSchema.shape.stateProvince
              )}
              disabled={isDisabled}
            />
            <Input
              label="Postcode"
              type="text"
              hideLabel
              autoComplete="postal-code"
              name={zo.fields.zipPostalCode()}
              defaultValue={user?.contact?.zipPostalCode || undefined}
              error={
                validationErrors?.zipPostalCode?.message ||
                zo.errors.zipPostalCode()?.message
              }
              placeholder="1016 BR"
              required={zodFieldIsRequired(
                UserContactDetailsFormSchema.shape.zipPostalCode
              )}
              disabled={isDisabled}
            />
          </div>
        </FormRow>

        <FormRow
          rowLabel="Land/Regio"
          className="border-b-0 pb-0"
          required={zodFieldIsRequired(
            UserContactDetailsFormSchema.shape.countryRegion
          )}
        >
          <Input
            label="Land/Regio"
            type="text"
            hideLabel
            autoComplete="country"
            name={zo.fields.countryRegion()}
            defaultValue={user?.contact?.countryRegion || undefined}
            error={
              validationErrors?.countryRegion?.message ||
              zo.errors.countryRegion()?.message
            }
            placeholder="Nederland"
            required={zodFieldIsRequired(
              UserContactDetailsFormSchema.shape.countryRegion
            )}
            disabled={isDisabled}
          />
        </FormRow>

        <div className="text-right">
          <input type="hidden" name="type" value="updateUserContact" />
          <Button
            disabled={isDisabled}
            type="submit"
            name="intent"
            value="updateUserContact"
          >
            Opslaan
          </Button>
        </div>
      </Form>
    </Card>
  );
}
