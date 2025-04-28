import { HasPermission } from "@/components/HasPermission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canAccessAnalytics } from "@/server/permissions";
import { auth } from "@clerk/nextjs/server";
import {
  CHART_INTERNVALS,
  getViewsByCountryChartData,
  getViewsByDayChartData,
  getViewsByPPPChartData,
} from "@/server/db/productViews";
import { ViewsByCountryChart } from "../_components/charts/ViewsByCountryChart";
import { ViewsByPPPChart } from "../_components/charts/ViewsByPPPChart";
import { ViewsByDayChart } from "../_components/charts/ViewsByDayChart";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { createURL } from "@/lib/utils";
import { getProducts } from "@/server/db/products";
import { TimezoneDropdownMenuItem } from "@/components/TimezoneDropdownMenuItem";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    interval?: string;
    timezone?: string;
    productId?: string;
  }>;
}) {
  const { userId, redirectToSignIn } =
    await auth(); /* clerk component, private page protection*/
  if (userId == null)
    return redirectToSignIn(); /* return if user is not signed in */

  const interval =
    CHART_INTERNVALS[
      (await searchParams).interval as keyof typeof CHART_INTERNVALS
    ] ?? CHART_INTERNVALS.last7Days;
  const timezone = (await searchParams).timezone || "UTC";
  const productId = (await searchParams).productId;

  return (
    <>
      <div className="mb-6 flex justify-between items-baseline">
        {" "}
        {/* wrap filters with h1 */}
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <HasPermission permission={canAccessAnalytics}>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {interval.label}
                  <ChevronDownIcon className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(CHART_INTERNVALS).map(async ([key, value]) => (
                  <DropdownMenuItem asChild key={key}>
                    <Link
                      href={createURL(
                        "/dashboard/analytics",
                        await searchParams,
                        { interval: key }
                      )}
                    >
                      {value.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ProductDropdown
              userId={userId}
              selectedProductId={productId}
              searchParams={await searchParams}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {timezone}
                  <ChevronDownIcon className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild key={timezone}>
                  <Link
                    href={createURL(
                      "/dashboard/analytics",
                      await searchParams,
                      { timezone : "UTC"}
                    )}
                  >
                    UTC
                  </Link>
                </DropdownMenuItem>
                <TimezoneDropdownMenuItem searchParams={await searchParams} timezone={""} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </HasPermission>
      </div>
      <HasPermission permission={canAccessAnalytics} renderFallback>
        <div className="flex flex-col gap-8">
          <ViewsByDayCard
            timezone={timezone}
            userId={userId}
            interval={interval}
            productId={productId}
          />
          <ViewsByPPPCard
            timezone={timezone}
            userId={userId}
            interval={interval}
            productId={productId}
          />
          <ViewsByCountryCard
            timezone={timezone}
            userId={userId}
            interval={interval}
            productId={productId}
          />
        </div>
      </HasPermission>
    </>
  );
}

async function ProductDropdown({
  userId,
  selectedProductId,
  searchParams,
}: {
  userId: string;
  selectedProductId?: string;
  searchParams: Record<string, string>;
}) {
  const products = await getProducts(userId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {products.find((p) => p.id === selectedProductId)?.name ??
            "All Products"}
          <ChevronDownIcon className="size-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            className="w-full block"
            href={createURL("/dashboard/analytics", searchParams, {productId: undefined})}
          >
            All Products
          </Link>
        </DropdownMenuItem>
        {products.map((product) => (
          <DropdownMenuItem asChild key={product.id}>
            <Link
              className="w-full block"
              href={createURL("/dashboard/analytics", searchParams, {productId: product.id})}
            >
              {product.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function ViewsByDayCard(
  props: Parameters<typeof getViewsByDayChartData>[0] /* renders out a card */
) {
  const chartData = await getViewsByDayChartData(
    props
  ); /* given data from db */

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Per Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ViewsByDayChart chartData={chartData} />
      </CardContent>
    </Card>
  );
}

async function ViewsByPPPCard(
  props: Parameters<typeof getViewsByPPPChartData>[0]
) {
  const chartData = await getViewsByPPPChartData(props);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Per PPP Group</CardTitle>
      </CardHeader>
      <CardContent>
        <ViewsByPPPChart chartData={chartData} />
      </CardContent>
    </Card>
  );
}

async function ViewsByCountryCard(
  props: Parameters<typeof getViewsByCountryChartData>[0]
) {
  const chartData = await getViewsByCountryChartData(props);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitors Per Country</CardTitle>
      </CardHeader>
      <CardContent>
        <ViewsByCountryChart chartData={chartData} />
      </CardContent>
    </Card>
  );
}
