"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatCompactNumber } from "@/lib/formatters";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

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
    views: { /* only thing that we're showing */
      label: "Visitors",
      color: "hsl(var(--accent))", /* based on accent variable */
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
      <ResponsiveContainer width="100%" height="100%">
        <BarChart accessibilityLayer data={chartData}>
          <XAxis dataKey="countryCode" tickLine={false} tickMargin={10} />
          <YAxis tickLine={false} tickMargin={10} allowDecimals={false} tickFormatter={formatCompactNumber}/>
          <ChartTooltip content={<ChartTooltipContent nameKey="countryName"/>}/>
          <Bar dataKey="views" fill="var(--color-views)"/>{/* render number of views */}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
