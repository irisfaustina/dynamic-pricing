"use client";

import { ChartContainer } from "@/components/ui/chart";
import { BarChart, XAxis, YAxis } from "recharts";

/* when dealing with charts */

export function ViewsByCountryChart({
  chartData,
}: {
  chartData: {
    views: number;
    countryName: string;
    countryCode: string;
  }[];
}) {
  const chartConfig = {
    views: {
      label: "Visitors",
      color: "hsl(var(--accent))",
    },
  };
  if (chartData.length === 0) {
    /* to catch the case where there's no data */
    return (
      <p className="flex items-center justify-center test-muted-foreground min-h-[150px] max-h-[250px]">
        No data available
      </p>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[150px] max-h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <XAxis dataKey="countryCode" tickLine={false} tickMargin={10} />
      </BarChart>
    </ChartContainer>
  )
}
