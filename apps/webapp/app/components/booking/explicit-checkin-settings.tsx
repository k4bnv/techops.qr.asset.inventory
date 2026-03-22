import { useFetcher } from "react-router";
import { useZorm } from "react-zorm";
import z from "zod";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import { tw } from "~/utils/tw";
import FormRow from "../forms/form-row";
import { Switch } from "../forms/switch";
import { Card } from "../shared/card";

export const ExplicitCheckinSettingsSchema = z.object({
  requireExplicitCheckinForAdmin: z
    .string()
    .transform((val) => val === "on")
    .default("false"),
  requireExplicitCheckinForSelfService: z
    .string()
    .transform((val) => val === "on")
    .default("false"),
});

export function ExplicitCheckinSettings({
  header,
  defaultValues,
}: {
  header: { title: string; subHeading?: string };
  defaultValues: {
    requireExplicitCheckinForAdmin: boolean;
    requireExplicitCheckinForSelfService: boolean;
  };
}) {
  const fetcher = useFetcher();
  const { isOwner } = useUserRoleHelper();
  const zo = useZorm("ExplicitCheckinForm", ExplicitCheckinSettingsSchema);

  return (
    <Card className={tw("my-0")}>
      <div className="mb-4 border-b pb-4">
        <h3 className="text-text-lg font-semibold">{header.title}</h3>
        <p className="text-sm text-gray-600">{header.subHeading}</p>
      </div>
      <div>
        <fetcher.Form
          ref={zo.ref}
          method="post"
          onChange={(e) => {
            if (isOwner) {
              void fetcher.submit(e.currentTarget);
            }
          }}
        >
          <FormRow
            rowLabel="Vereis expliciete check-in voor beheerders"
            subHeading={
              <div>
                Indien ingeschakeld, moeten beheerders de op een scanner gebaseerde expliciete
                check-instroom gebruiken in plaats van de snelle check-in met één klik.
              </div>
            }
            className="border-b-0 pb-[10px] pt-0"
          >
            <div className="flex flex-col items-center gap-2">
              <Switch
                name={zo.fields.requireExplicitCheckinForAdmin()}
                disabled={!isOwner}
                defaultChecked={defaultValues.requireExplicitCheckinForAdmin}
                title="Vereis expliciete check-in voor beheerders"
              />
              <label
                htmlFor={`requireExplicitCheckinForAdmin-${zo.fields.requireExplicitCheckinForAdmin()}`}
                className="hidden text-gray-500"
              >
                Vereis expliciete check-in voor beheerders
              </label>
            </div>
          </FormRow>
          <FormRow
            rowLabel="Vereis expliciete check-in voor Self Service"
            subHeading={
              <div>
                Indien ingeschakeld, moeten self-service gebruikers de op een scanner gebaseerde
                expliciete check-instroom gebruiken in plaats van de snelle check-in met één klik.
              </div>
            }
            className="mt-4 border-b-0 pb-[10px] pt-0"
          >
            <div className="flex flex-col items-center gap-2">
              <Switch
                name={zo.fields.requireExplicitCheckinForSelfService()}
                disabled={!isOwner}
                defaultChecked={
                  defaultValues.requireExplicitCheckinForSelfService
                }
                title="Vereis expliciete check-in voor Self Service"
              />
              <label
                htmlFor={`requireExplicitCheckinForSelfService-${zo.fields.requireExplicitCheckinForSelfService()}`}
                className="hidden text-gray-500"
              >
                Vereis expliciete check-in voor Self Service
              </label>
            </div>
          </FormRow>
          {!isOwner && (
            <p className="text-sm text-gray-500">
              Alleen de werkruimte-eigenaar kan deze instelling wijzigen.
            </p>
          )}
          <input type="hidden" value="updateExplicitCheckin" name="intent" />
        </fetcher.Form>
      </div>
    </Card>
  );
}
