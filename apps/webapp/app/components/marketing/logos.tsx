import { Box } from "lucide-react";
import { tw } from "~/utils/tw";
import When from "../when/when";

/**
 * Logo shown in the sidebar
 */
export const ShelfSidebarLogo = ({ minimized }: { minimized: boolean }) => {
  return (
    <div className="flex items-center justify-center">
      <Box className="mx-1.5 inline h-[32px] w-[32px] text-orange-500" strokeWidth={2.5} />
      <div
        className={tw(
          "overflow-hidden transition-all duration-150 ease-linear",
          minimized ? "w-0 opacity-0" : "w-auto opacity-100 ml-1"
        )}
      >
        <span className="text-xl font-bold tracking-tight text-gray-900">
          TechOps
        </span>
      </div>
    </div>
  );
};

/**
 * Logo shown in the header for mobile screen sizes
 */
export const ShelfMobileLogo = () => {
  return (
    <div className="flex h-full items-center">
      <Box className="h-6 w-6 text-orange-500 mr-2" strokeWidth={2.5} />
      <span className="text-lg font-bold tracking-tight text-gray-900">
        TechOps
      </span>
    </div>
  );
};

/**
 * Symbol only
 */
export const ShelfSymbolLogo = ({ className }: { className?: string }) => {
  const classes = tw("mx-auto mb-2 size-12 text-orange-500", className);
  return <Box className={classes} strokeWidth={2.5} />;
};

/**
 * Full logo
 */
export const ShelfFullLogo = ({ className }: { className?: string }) => {
  const classes = tw("flex items-center justify-center", className);
  return (
    <div className={classes}>
      <Box className="h-10 w-10 text-orange-500 mr-3" strokeWidth={2.5} />
      <span className="text-3xl font-bold tracking-tight text-gray-900">
        TechOps
      </span>
    </div>
  );
};
