// "/dashboard" is the index to dashboard page
import { getProducts } from "@/server/db/products"
import { auth } from "@clerk/nextjs/server"
import { NoProducts } from "./_components/NoProducts"
import Link from "next/link"
import { ArrowRightIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "./_components/ProductGrid"
import { HasPermission } from "@/components/HasPermission"
import { canAccessAnalytics } from "@/server/permissions"
import { getViewsByDayChartData } from "@/server/db/productViews"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ViewsByDayChart } from "./_components/charts/ViewsByDayChart"
import { CHART_INTERNVALS } from "@/server/db/productViews"


export default async function DashboardPage(){ /* for page limit how many things we get back */
    const { userId, redirectToSignIn } =  await auth() 
    if (!userId) return redirectToSignIn()
        
    const products = await getProducts(userId, { limit: 6 })
    if (products.length === 0) return <NoProducts />

    return (<>
        <h2 className="mb-6 text-3xl font-semibold flex justify-between">
            <Link 
                className="group flex gap-2 items-center hover:underline" 
                href="/dashboard/products"
            > {/* render out analytics and products so we can go back and forth */}
                 Product
                 <ArrowRightIcon className="transition-transform group-hover:translate-x-1" /> {/* move arrow slightly to the right on hover */}
            </Link>
            <Button asChild>
                <Link href="/dashboard/products/new">
                <PlusIcon className="size-4 mr-2" /> {/* add icon */}
                New Product</Link>
            </Button>
            </h2>
            <ProductGrid products={products} />
            <h2 className="mb-6 text-3xl font-semibold flex justify-between mt-12">
        <Link
          href="/dashboard/analytics"
          className="flex gap-2 items-center hover:underline group"
        >
          Analytics
          <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </h2>
      <HasPermission permission={canAccessAnalytics} renderFallback>
        <AnalyticsChart userId={userId} />
      </HasPermission>
    </>
  )
}

async function AnalyticsChart({ userId }: { userId: string }) {
  const chartData = await getViewsByDayChartData({
    userId,
    interval: CHART_INTERNVALS.last30Days,
    timezone: "UTC",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Views by Day</CardTitle>
      </CardHeader>
      <CardContent>
        <ViewsByDayChart chartData={chartData} />
      </CardContent>
    </Card>
  )
}