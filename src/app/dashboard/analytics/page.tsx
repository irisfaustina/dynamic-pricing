import { HasPermission } from "@/components/HasPermission"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { canAccessAnalytics } from "@/server/permissions"
import { auth } from "@clerk/nextjs/server"
import { CHART_INTERNVALS, getViewsByCountryChartData } from "@/server/db/productViews"
import { ViewsByCountryChart } from "../_components/charts/ViewsByCountryChart"

export default async function AnalyticsPage({
    searchParams
}:{
    searchParams: Promise<{
        interval?: string
        timezone?: string
        productId?: string
    }>
}) {
    const { userId, redirectToSignIn } = await auth() /* clerk component, private page protection*/
    if (userId == null) return redirectToSignIn() /* return if user is not signed in */

    const interval = CHART_INTERNVALS[(await searchParams).interval as keyof typeof CHART_INTERNVALS] ?? CHART_INTERNVALS.last7Days
    const timezone = (await searchParams).timezone || "UTC"
    const productId = (await searchParams).productId
  
    return (
        <>
        <h1 className="text-3xl font-semibold mb-6">Analytics</h1>
        <HasPermission permission={canAccessAnalytics} renderFallback>
            <div className="flex flex-col gap-8">
                <ViewsByDayCard />
                <ViewsByPPPCard />
                <ViewsByCountryCard timezone={timezone} userId={userId} interval={interval} productId={productId}/>
            </div>
        </HasPermission>
        </>
    )
}

async function ViewsByDayCard(
   // props: Parameters<typeof getViewsByDayChartData>[0] /* renders out a card */
  ) {
    //const chartData = await getViewsByDayChartData(props) /* given data from db */
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitors Per Day</CardTitle>
        </CardHeader>
        <CardContent>
         {/* <ViewsByDayChart chartData={chartData} /> */}
        </CardContent>
      </Card>
    )
  }
  
  async function ViewsByPPPCard(
    // props: Parameters<typeof getViewsByPPPChartData>[0]
  ) {
    //const chartData = await getViewsByPPPChartData(props)
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitors Per PPP Group</CardTitle>
        </CardHeader>
        <CardContent>
         {/* <ViewsByPPPChart chartData={chartData} /> */}
        </CardContent>
      </Card>
    )
  }
  
  async function ViewsByCountryCard(
    props: Parameters<typeof getViewsByCountryChartData>[0]
  ) {
    const chartData = await getViewsByCountryChartData(props)
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visitors Per Country</CardTitle>
        </CardHeader>
        <CardContent>
         <ViewsByCountryChart chartData={chartData} />
        </CardContent>
      </Card>
    )
  }