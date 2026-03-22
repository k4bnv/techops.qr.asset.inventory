import { useState } from "react";
import { CustomFieldType, type CustomField } from "@prisma/client";
import { useAtom } from "jotai";
import { Link, useActionData, useNavigation } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { updateDynamicTitleAtom } from "~/atoms/dynamic-title-atom";
import { useOrganizationId } from "~/hooks/use-organization-id";
import type { action as editCustomFieldsAction } from "~/routes/_layout+/settings.custom-fields.$fieldId_.edit";
import type { action as newCustomFieldsAction } from "~/routes/_layout+/settings.custom-fields.new";
import { FIELD_TYPE_NAME } from "~/utils/custom-fields";
import { isFormProcessing } from "~/utils/form";
import { getValidationErrors } from "~/utils/http";
import { zodFieldIsRequired } from "~/utils/zod";
import { Form } from "../custom-form";
import CategoriesInput from "../forms/categories-input";
import FormRow from "../forms/form-row";
import Input from "../forms/input";
import OptionBuilder from "../forms/option-builder";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../forms/select";
import { Switch } from "../forms/switch";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { Spinner } from "../shared/spinner";

export const NewCustomFieldFormSchema = z.object({
  name: z.string().min(2, "Naam is verplicht"),
  helpText: z
    .string()
    .optional()
    .transform((val) => val || null), // Transforming undefined to fit prismas null constraint
  type: z.nativeEnum(CustomFieldType),
  required: z
    .string()
    .optional()
    .transform((val) => (val === "on" ? true : false)),
  active: z
    .string()
    .optional()
    .transform((val) => (val === "on" ? true : false)),
  organizationId: z.string(),
  options: z.array(z.string()).optional(),
  categories: z
    .array(z.string().min(1, "Selecteer een categorie"))
    .optional()
    .default([]),
});

/** Pass props of the values to be used as default for the form fields */
interface Props {
  name?: CustomField["name"];
  helpText?: CustomField["helpText"];
  required?: CustomField["required"];
  type?: CustomField["type"];
  active?: CustomField["active"];
  options?: CustomField["options"];
  isEdit?: boolean;
  categories?: string[];
}

const FIELD_TYPE_DESCRIPTION: { [key in CustomFieldType]: string } = {
  TEXT: "Een plek om korte informatie voor uw asset op te slaan. Bijvoorbeeld: serienummers, notities of wat u maar wilt. Geen invoervalidatie. Elke tekst is acceptabel.",
  OPTION: "Een vervolgkeuzelijst met vooraf gedefinieerde opties.",
  BOOLEAN: "Een waar/onwaar of ja/nee waarde.",
  DATE: "Een datumkiezer voor het selecteren van een datum.",
  MULTILINE_TEXT:
    "Een plek om langere informatie over meerdere regels voor uw asset op te slaan. Bijvoorbeeld: beschrijvingen, opmerkingen of gedetailleerde notities.",
  AMOUNT:
    "Voer numerieke waarden in die worden opgemaakt in de valuta van uw workspace. Ondersteunt decimalen.",
  NUMBER: "Voer numerieke waarden in. Ondersteunt decimalen.",
};

export const CustomFieldForm = ({
  options: opts,
  name,
  helpText,
  required,
  type,
  active,
  isEdit = false,
  categories = [],
}: Props) => {
  const navigation = useNavigation();
  const zo = useZorm("NewQuestionWizardScreen", NewCustomFieldFormSchema);
  const disabled = isFormProcessing(navigation.state);

  const [options, setOptions] = useState<Array<string>>(opts || []);
  const [selectedType, setSelectedType] = useState<CustomFieldType>(
    type || "TEXT"
  );
  const [useCategories, setUseCategories] = useState(categories.length > 0);

  const [, updateTitle] = useAtom(updateDynamicTitleAtom);

  // keeping text field type by default selected
  const organizationId = useOrganizationId();
  const actionData = useActionData<
    typeof newCustomFieldsAction | typeof editCustomFieldsAction
  >();
  const validationErrors = getValidationErrors<typeof NewCustomFieldFormSchema>(
    actionData?.error
  );

  return (
    <Card className="w-full md:w-min">
      <Form
        ref={zo.ref}
        method="post"
        className="flex w-full flex-col gap-2"
        encType="multipart/form-data"
      >
        <FormRow
          rowLabel={"Naam"}
          className="border-b-0 pb-[10px] pt-0"
          required={zodFieldIsRequired(NewCustomFieldFormSchema.shape.name)}
        >
          <Input
            label="Naam"
            hideLabel
            name={zo.fields.name()}
            disabled={disabled}
            error={validationErrors?.name?.message || zo.errors.name()?.message}
            autoFocus
            onChange={updateTitle}
            className="w-full"
            defaultValue={name || ""}
            placeholder="Kies een veldnaam"
            required={zodFieldIsRequired(NewCustomFieldFormSchema.shape.name)}
          />
        </FormRow>

        <div>
          <label className="lg:hidden" htmlFor="custom-field-type">
            Type
          </label>
          <FormRow
            rowLabel={"Type"}
            className="border-b-0 pb-[10px] pt-[6px]"
            required={zodFieldIsRequired(NewCustomFieldFormSchema.shape.type)}
          >
            <Select
              name="type"
              defaultValue={selectedType}
              disabled={disabled}
              onValueChange={(val: CustomFieldType) => setSelectedType(val)}
            >
              <SelectTrigger
                disabled={isEdit}
                className="px-3.5 py-3"
                id="custom-field-type"
              >
                <SelectValue placeholder="Kies een veldtype" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="w-full min-w-[300px]"
                align="start"
              >
                <div className=" max-h-[320px] overflow-auto">
                  {Object.keys(FIELD_TYPE_NAME).map((value) => (
                    <SelectItem value={value} key={value}>
                      <span className="mr-4 text-[14px] text-gray-700">
                        {FIELD_TYPE_NAME[value as CustomFieldType]}
                      </span>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
            <div className="mt-2 flex-1 grow rounded border px-6 py-4 text-[14px] text-gray-600 ">
              <p>{FIELD_TYPE_DESCRIPTION[selectedType]}</p>
            </div>
          </FormRow>
          {selectedType === "OPTION" ? (
            <>
              <FormRow rowLabel="" className="mt-0 border-b-0 pt-0">
                <OptionBuilder
                  onRemove={(i: number) => {
                    options.splice(i, 1);
                    setOptions([...options]);
                  }}
                  options={options}
                  onAdd={(o: string) => setOptions([...options, o])}
                />
                {options.map((op, i) => (
                  <input
                    key={i}
                    type="hidden"
                    name={zo.fields.options(i)()}
                    value={op}
                  />
                ))}
              </FormRow>
            </>
          ) : null}
        </div>
        <FormRow rowLabel="" className="border-b-0 pt-2">
          <div className="flex items-center gap-3">
            <Switch
              id="custom-field-required"
              name={zo.fields.required()}
              disabled={disabled}
              defaultChecked={required}
            />
            <label
              htmlFor="custom-field-required"
              className="text-base font-medium text-gray-700"
            >
              Required
            </label>
          </div>
        </FormRow>

        <FormRow rowLabel="" className="border-b-0 pt-2">
          <div className="flex items-center gap-3">
            <Switch
              id="custom-field-active"
              name={zo.fields.active()}
              disabled={disabled}
              defaultChecked={active === undefined || active}
            />
            <label htmlFor="custom-field-active">
              <div className="text-base font-medium text-gray-700">Actief</div>
              <p className="text-[14px] text-gray-600">
                Het deactiveren van een veld zorgt ervoor dat het niet meer wordt
                weergegeven op het asset-formulier en de pagina
              </p>
            </label>
          </div>
          {validationErrors?.active ? (
            <div className="text-sm text-error-500">
              {validationErrors?.active.message}
            </div>
          ) : null}
        </FormRow>

        <div>
          <FormRow
            rowLabel="Categorie"
            subHeading={
              <p>
                Selecteer de asset-categorieën waarvoor u dit aangepaste veld
                wilt gebruiken.{" "}
                <Link
                  to="https://www.shelf.nu/knowledge-base/linking-custom-fields-to-categories"
                  target="_blank"
                >
                  Lees meer
                </Link>
              </p>
            }
          >
            <div className="mb-3 flex gap-3">
              <Switch
                id="custom-field-use-categories"
                disabled={disabled}
                checked={useCategories}
                onCheckedChange={setUseCategories}
              />
              <label htmlFor="custom-field-use-categories">
                <div className="text-base font-medium text-gray-700">
                  Gebruik voor geselecteerde categorieën
                </div>
                <p className="text-[14px] text-gray-600">
                  Indien u dit aangepaste veld alleen wilt gebruiken voor assets
                  met bepaalde categorieën.
                </p>
              </label>
            </div>

            {useCategories && (
              <CategoriesInput
                categories={categories}
                name={(i) => zo.fields.categories(i)()}
                error={(i) => zo.errors.categories(i)()?.message}
              />
            )}
          </FormRow>
        </div>

        <div>
          <FormRow
            rowLabel="Helptekst"
            subHeading={
              <p>
                Deze tekst fungeert als helptekst die zichtbaar is bij het
                invullen van het veld
              </p>
            }
            required={zodFieldIsRequired(
              NewCustomFieldFormSchema.shape.helpText
            )}
          >
            <Input
              inputType="textarea"
              label="Helptekst"
              name={zo.fields.helpText()}
              defaultValue={helpText || ""}
              placeholder="Voeg een helptekst toe voor uw aangepaste veld."
              disabled={disabled}
              data-test-id="fieldHelpText"
              className="w-full"
              hideLabel
              required={zodFieldIsRequired(
                NewCustomFieldFormSchema.shape.helpText
              )}
            />
          </FormRow>
        </div>

        {/* hidden field organization Id to get the organization Id on each form submission to link custom fields and its value is loaded using useOrganizationId hook */}
        <input
          type="hidden"
          name={zo.fields.organizationId()}
          value={organizationId}
        />

        <div className="text-right">
          <Button
            to={".."}
            variant="secondary"
            disabled={disabled}
            className={"mr-2"}
          >
            Annuleren
          </Button>
          <Button type="submit" disabled={disabled}>
            {disabled ? <Spinner /> : "Opslaan"}
          </Button>
        </div>
      </Form>
    </Card>
  );
};
