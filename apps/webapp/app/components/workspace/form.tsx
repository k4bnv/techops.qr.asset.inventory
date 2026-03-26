import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { Organization } from "@prisma/client";
import { useAtom, useAtomValue } from "jotai";
import { useActionData, useNavigation } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { updateDynamicTitleAtom } from "~/atoms/dynamic-title-atom";
import { defaultValidateFileAtom, fileErrorAtom } from "~/atoms/file";
import { useSearchParams } from "~/hooks/search-params";
import { ACCEPT_SUPPORTED_IMAGES } from "~/utils/constants";
import { isFormProcessing } from "~/utils/form";
import { zodFieldIsRequired } from "~/utils/zod";
import { Form } from "../custom-form";
import FormRow from "../forms/form-row";
import Input from "../forms/input";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { Spinner } from "../shared/spinner";

export const NewWorkspaceFormSchema = z.object({
  name: z.string().min(2, "Naam is vereist"),
  currency: z.string(),
});

/** Pass props of the values to be used as default for the form fields */
interface Props {
  name?: Organization["name"];
  children?: string | ReactNode;
}

export const WorkspaceForm = ({ name, children }: Props) => {
  const actionData = useActionData<{ error?: any }>();
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const zo = useZorm("NewQuestionWizardScreen", NewWorkspaceFormSchema);
  const disabled = isFormProcessing(navigation.state);
  const fileError = useAtomValue(fileErrorAtom);
  const [, validateFile] = useAtom(defaultValidateFileAtom);
  const [, updateTitle] = useAtom(updateDynamicTitleAtom);
  const nameFieldRef = useRef<HTMLInputElement>(null);

  const imageError =
    (actionData?.error?.additionalData?.field === "image"
      ? actionData?.error?.message
      : undefined) ?? fileError;

  useEffect(() => {
    const team = searchParams.get("team");
    if (!team && nameFieldRef.current) {
      nameFieldRef.current.focus();
    }
  }, [searchParams]);

  return (
    <Card className="w-full md:w-min">
      <Form
        ref={zo.ref}
        method="post"
        className="flex w-full flex-col gap-2"
        encType="multipart/form-data"
      >
        <FormRow
          rowLabel={"Name"}
          subHeading={
            "Choose a name that represents your Organization. Make it easily recognizable for your team members."
          }
          className="border-b-0 pb-[10px] pt-0"
          required={zodFieldIsRequired(NewWorkspaceFormSchema.shape.name)}
        >
          <Input
            label="Name"
            hideLabel
            name={zo.fields.name()}
            disabled={disabled}
            error={zo.errors.name()?.message}
            autoFocus
            onChange={updateTitle}
            className="w-full"
            defaultValue={name || undefined}
            placeholder=""
            required={zodFieldIsRequired(NewWorkspaceFormSchema.shape.name)}
            ref={nameFieldRef}
          />
        </FormRow>

        <FormRow
          rowLabel={"Hoofdafbeelding"}
          className="border-b-0"
          subHeading={
            "Used to place your organization's logo or symbol. For best results, use a square image."
          }
        >
          <div>
            <p className="hidden lg:block">
              Accepts PNG, JPG, JPEG, or WebP (max.4 MB)
            </p>
            <Input
              // disabled={disabled}
              accept={ACCEPT_SUPPORTED_IMAGES}
              name="image"
              type="file"
              onChange={validateFile}
              label={"Hoofdafbeelding"}
              hideLabel
              error={imageError}
              className="mt-2"
              inputClassName="border-0 shadow-none p-0 rounded-none"
            />
            <p className="mt-2 lg:hidden">
              Accepts PNG, JPG, JPEG, or WebP (max.4 MB)
            </p>
          </div>
        </FormRow>

        <input type="hidden" name={zo.fields.currency()} value="EUR" />
        <div className="text-right">
          <Button type="submit" disabled={disabled}>
            {disabled ? <Spinner /> : "Save"}
          </Button>
        </div>
      </Form>
    </Card>
  );
};
