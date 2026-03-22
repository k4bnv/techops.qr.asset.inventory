import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLoaderData, useFetcher } from "react-router";
import type { LayoutLoaderResponse } from "~/routes/_layout+/_layout";
import { usePwaManager } from "~/utils/pwa-manager";
import { Button } from "../shared/button";

export function InstallPwaPromptModal() {
  const { hideInstallPwaPrompt } = useLoaderData<LayoutLoaderResponse>();
  const fetcher = useFetcher();
  let optimisticHideInstallPwaPrompt = hideInstallPwaPrompt;
  if (fetcher.formData) {
    optimisticHideInstallPwaPrompt =
      fetcher.formData.get("pwaPromptVisibility") === "hidden";
  }
  const hidePwaPromptForm = useRef<HTMLFormElement | null>(null);

  const { promptInstall } = usePwaManager();

  return optimisticHideInstallPwaPrompt ? null : (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="dialog-backdrop !items-end !bg-[#364054]/70">
          <dialog
            className="dialog m-auto h-auto w-[90%] pb-8 sm:w-[400px]"
            open={true}
          >
            <div className="relative z-10  rounded-xl bg-white p-4 shadow-lg">
              <div className="mb-8 text-center">
                <h4 className="mb-1 text-[18px] font-semibold">
                  Installeer TechOps voor mobiel
                </h4>
                <p className="text-gray-600">
                  Altijd toegang tot TechOps, met alle functies die u op de
                  desktop heeft.{" "}
                  {promptInstall && (
                    <>
                      Gebruik de <strong>installatieknop hieronder</strong> om
                      TechOps aan uw apparaat toe te voegen.
                    </>
                  )}
                </p>
                {promptInstall ? null : (
                  <>
                    <ol className="mb-8 mt-2 pt-2">
                      <li>
                        1. Klik op het <strong>deelpictogram</strong>
                      </li>
                      <li>
                        2. Klik op <strong>"Zet op beginscherm"</strong>
                      </li>
                      <li>3. Geniet van TechOps op uw mobiele apparaat</li>
                    </ol>

                    <video
                      height="200"
                      loop
                      autoPlay
                      muted
                      playsInline
                      className="mb-6 rounded-lg"
                    >
                      <source
                        src="/static/videos/add-to-home-screen.mp4"
                        type="video/mp4"
                      />
                    </video>
                  </>
                )}
                <p>
                  Neem voor meer informatie contact op met uw TechOps-beheerder.
                </p>
              </div>

              {promptInstall && (
                <Button
                  type="button"
                  width="full"
                  variant="primary"
                  className="mb-3"
                  onClick={async () => {
                    await promptInstall().then(
                      () =>
                        void fetcher.submit(hidePwaPromptForm.current, {
                          method: "POST",
                        })
                    );
                  }}
                >
                  Installeren
                </Button>
              )}
              <fetcher.Form
                ref={hidePwaPromptForm}
                method="post"
                action="/api/hide-pwa-install-prompt"
              >
                <input
                  type="hidden"
                  name="pwaPromptVisibility"
                  value="hidden"
                />
                <Button type="submit" width="full" variant="secondary">
                  2 weken overslaan
                </Button>

              </fetcher.Form>
            </div>
          </dialog>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
