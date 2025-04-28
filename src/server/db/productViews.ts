import { db } from "@/drizzle/db"
import { CountryTable, ProductTable, ProductViewTable } from "@/drizzle/schema"
import { CACHE_TAGS, dbCache, getGlobalTag, getUserTag, revalidateDbCache } from "@/lib/cache"
import { startOfDay, subDays } from "date-fns"
import { and, count, desc, eq, gte, sql } from "drizzle-orm"
import { toZonedTime } from 'date-fns-tz'

export function getProductViewCount(userId: string, startDate: Date) {
  const cacheFn = dbCache(getProductViewCountInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.productViews)],
  })

  return cacheFn(userId, startDate)
}

export function getViewsByCountryChartData({
  timezone,
  productId,
  userId,
  interval
}: {
  timezone: string
  productId?: string /* becasue we can pull for all products */
  userId: string
  interval: (typeof CHART_INTERNVALS)[keyof typeof CHART_INTERNVALS]
}) {
  const cacheFn = dbCache(getViewsByCountryChartDataInternal, {
    tags: [
      getUserTag(userId, CACHE_TAGS.productViews), 
      productId == null /* if user has a product id */
      ? getUserTag(userId, CACHE_TAGS.products) /* if user has no product id, give access to all products */
      : getIdTag(productId, CACHE_TAGS.products),
      getGlobalTag(CACHE_TAGS.countries)
     ], /* if user has a product id give access to that specific product */
  })

  return cacheFn({
    timezone,
    productId,
    userId,
    interval
  })
  
}

export async function createProductView({
  productId,
  countryId,
  userId,
}: {
  productId: string
  countryId?: string
  userId: string
}) {
  const [newRow] = await db /* creating product view */
    .insert(ProductViewTable)
    .values({
      productId: productId,
      visitedAt: new Date(),
      countryId: countryId,
    })
    .returning({ id: ProductViewTable.id })

  if (newRow != null) {
    revalidateDbCache({ tag: CACHE_TAGS.productViews, userId, id: newRow.id })
  }
}

async function getProductViewCountInternal(userId: string, startDate: Date) {
    const counts = await db /* how many products in the row table associated with user and after given time */
      .select({ pricingViewCount: count() }) /* count pricing view count */
      .from(ProductViewTable)
      .innerJoin(ProductTable, eq(ProductTable.id, ProductViewTable.productId)) /* join product table with product view table  when product id is equal to product id in product table */
      .where( /* only get the products that the users have */
        and(
          eq(ProductTable.clerkUserId, userId), /* only get the products that the users have */
          gte(ProductViewTable.visitedAt, startDate) /* greater than or equal to startdate*/
        )
      )
  
    return counts[0]?.pricingViewCount ?? 0
  }

async function getViewsByCountryChartDataInternal({
  timezone,
  productId,
  userId,
  interval
}: {
  timezone: string
  productId?: string /* becasue we can pull for all products */
  userId: string
  interval: (typeof CHART_INTERNVALS)[keyof typeof CHART_INTERNVALS]
}) {
  const startDate = startOfDay(toZonedTime(interval.startDate, timezone))
  const productsSubQuery = getProductSubQuery(userId, productId)
  return await db /* combine subqueries */
    .with(productsSubQuery) /* only products that user has access to */
    .select({
      views: count(ProductViewTable.visitedAt), /* visited at converted to the same timezone and compared with visited at gte */
      countryName: CountryTable.name, /* count country name */
      countryCode: CountryTable.code, /* count country code */
    }) /* join two tables */
    .from(ProductViewTable)
    .innerJoin(productsSubQuery, eq(productsSubQuery.id, ProductViewTable.productId)) /* limited list of only the products that user have access to and combine with product view table */
    .innerJoin(CountryTable, eq(CountryTable.id, ProductViewTable.countryId)) /* getting all product and country information */
    .where (
      gte(
        sql `${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
        .inlineParams(),
        startDate
    )
  )
  .groupBy(({countryCode, countryName}) => [countryCode, countryName])
  .orderBy(({views}) => desc(views)) /* order by views in descending order */
  .limit(25)
}

function getProductSubQuery(userId: string, productId: string | undefined) {
  return db.$with('products').as( /* if we pass along a producId only get product for the id*/
    db
    .select()
    .from(ProductTable)
    .where
      (and(
        eq(ProductTable.clerkUserId, userId), 
        productId == null ? undefined: eq(ProductTable.id, productId)
  )
)
  )
}

export const CHART_INTERNVALS = { /* easy to switch between intervals */
  last7Days:{
    startDate: subDays(new Date(), 7),
    label: "Last 7 Days",
  },
  last30Days:{
    startDate: subDays(new Date(), 30),
    label: "Last 30 Days",
  },
  last365Days:{
    startDate: subDays(new Date(), 365),
    label: "Last 365 Days",
  }
}

function getIdTag(productId: string | undefined, products: string): import("@/lib/cache").ValidTags {
  throw new Error("Function not implemented.")
}
