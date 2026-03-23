import { AreaChart } from "@tremor/react";
import { useLoaderData } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import type { loader } from "~/routes/_layout+/home";
import { DashboardEmptyState } from "../dashboard/empty-state";
import FallbackLoading from "../dashboard/fallback-loading";
import { Button } from "../shared/button";

export default function AssetGrowthChart() {
  const { assetGrowthData, totalAssets } = useLoaderData<typeof loader>();

  // Build short month labels: "Mar '25"
  const chartData = assetGrowthData.map(
    (d: { month: string; year: number; "Totaal aantal assets": number }) => ({
      date: `${d.month.slice(0, 3)} '${String(d.year).slice(2)}`,
      "Totaal aantal assets": d["Totaal aantal assets"],
    })
  );

  return (
    <div className="flex h-full flex-col rounded border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-semibold text-gray-900">
            Assetgroei
          </span>
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
            12 maanden
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            to="/assets"
            variant="block-link-gray"
            className="!mt-0 text-xs"
          >
            Bekijk alles
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        {totalAssets > 0 ? (
          <ClientOnly
            fallback={<FallbackLoading className="h-[180px] w-full" />}
          >
            {() => (
              <AreaChart
                className="h-[180px] w-full"
                data={chartData}
                index="date"
                categories={["Totaal aantal assets"]}
                colors={["orange"]}
                showAnimation={true}
                animationDuration={600}
                curveType="monotone"
                showLegend={false}
                showGridLines={false}
                yAxisWidth={40}
                autoMinValue={true}
              />
            )}
          </ClientOnly>
        ) : (
          <DashboardEmptyState
            text="Nog geen assets"
            subText="Maak assets aan om hier uw groeitrend te zien."
            ctaTo="/assets/new"
            ctaText="Maak een asset aan"
          />
        )}
      </div>
    </div>
  );
}
