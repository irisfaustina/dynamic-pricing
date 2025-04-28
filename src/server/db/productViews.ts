import { db } from "@/drizzle/db"
import { CountryGroupTable, CountryTable, ProductTable, ProductViewTable } from "@/drizzle/schema"
import { CACHE_TAGS, dbCache, getGlobalTag, getIdTag as cacheGetIdTag, getUserTag, revalidateDbCache } from "@/lib/cache"
import { startOfDay, subDays } from "date-fns"
import { and, count, desc, eq, gte, SQL, sql } from "drizzle-orm"
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

export function getViewsByPPPChartData({
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
  const cacheFn = dbCache(getViewsByPPPChartDataInternal, {
    tags: [
      getUserTag(userId, CACHE_TAGS.productViews), 
      productId == null /* if user has a product id */
      ? getUserTag(userId, CACHE_TAGS.products) /* if user has no product id, give access to all products */
      : getIdTag(productId, CACHE_TAGS.products),
      getGlobalTag(CACHE_TAGS.countries),
      getGlobalTag(CACHE_TAGS.countryGroups),
     ], /* if user has a product id give access to that specific product */
  })

  return cacheFn({
    timezone,
    productId,
    userId,
    interval
  })
  
}

export function getViewsByDayChartData({
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
  const cacheFn = dbCache(getViewsByDayChartDataInternal, {
    tags: [
      getUserTag(userId, CACHE_TAGS.productViews), 
      productId == null /* if user has a product id */
      ? getUserTag(userId, CACHE_TAGS.products) /* if user has no product id, give access to all products */
      : getIdTag(productId, CACHE_TAGS.products),
      getGlobalTag(CACHE_TAGS.countries),
      getGlobalTag(CACHE_TAGS.countryGroups),
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

async function getViewsByPPPChartDataInternal({
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
  const productViewSubQuery = db.$with("productViews").as(/* combine subqueries */
    db.with(productsSubQuery) /* only products that user has access to */
    .select({
      visitedAt: sql `${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
      .inlineParams().as("visitedAt"),
      countryGroupId: CountryTable.countryGroupId,
    }) /* join two tables */
    .from(ProductViewTable)
    .innerJoin(productsSubQuery, eq(productsSubQuery.id, ProductViewTable.productId)) /* limited list of only the products that user have access to and combine with product view table */
    .innerJoin(CountryTable, eq(CountryTable.id, ProductViewTable.countryId)) /* getting all product and country information */
    .where (({visitedAt}) => gte(visitedAt, startDate)) /* only get the ones visited after specific date */
  )
  return await db.with(productViewSubQuery).select({
    views: count(productViewSubQuery.visitedAt),
    pppName: CountryGroupTable.name,
  })
    .from(CountryGroupTable)
    .leftJoin(productViewSubQuery, eq(productViewSubQuery.countryGroupId, CountryGroupTable.id)) /* get all country group as display dispite no information or null, if inner join, will only show country groups that have information */
    .groupBy(({pppName}) => [pppName])
    .orderBy(({pppName}) => [pppName])
}

async function getViewsByDayChartDataInternal({
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
  const productsSubQuery = getProductSubQuery(userId, productId)
  const productViewSubQuery = db.$with("productViews").as(/* combine subqueries */
    db.with(productsSubQuery) /* only products that user has access to */
    .select({
      visitedAt: sql `${ProductViewTable.visitedAt} AT TIME ZONE ${timezone}`
      .inlineParams().as("visitedAt"),
      productId: productsSubQuery.id
    }) /* join two tables */
    .from(ProductViewTable)
    .innerJoin(productsSubQuery, eq(productsSubQuery.id, ProductViewTable.productId)) /* limited list of only the products that user have access to and combine with product view table */
  )
  return await db
  .with(productViewSubQuery) /* getting every single view */
  .select({
    date: interval.dateGrouper(sql.raw("series")).mapWith(dataString => interval.dateFormatter(new Date(dataString))),/* give me a series of data either months or days, after my sql code runs how do you want me to convert this sql to js */
    views: count(productViewSubQuery.visitedAt),
  })
    .from(interval.sql) /* no qeurying from existing table but create a table of arrays of date */
    .leftJoin(
      productViewSubQuery, ({date}) => /* getting the date row from select, comparing if we truncate the date and the date in product view */
      eq(interval.dateGrouper(productViewSubQuery.visitedAt), date) /* add one to my count if the dates match */ 
    ) /* get all country group as display dispite no information or null, if inner join, will only show country groups that have information */
    .groupBy(({date}) => [date])
    .orderBy(({date}) => [date])
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
    dateFormatter: (data: Date) => dateFormatter.format(data), /* doing this because truncating removes all time information */
    startDate: subDays(new Date(), 7),
    label: "Last 7 Days",
    sql: sql`generate_series(current_date - 7, current_date, '1 day'::interval) as series`, /* generate a series of dates with 1 day interval */
    dateGrouper:(col: SQL | SQL.Aliased) => 
      sql<string>`DATE(${col})`.inlineParams(), /* cut off everything like miliseconds to just the current date */
  },
  last30Days:{
    dateFormatter: (data: Date) => dateFormatter.format(data),
    startDate: subDays(new Date(), 30),
    label: "Last 30 Days",
    sql: sql`generate_series(current_date - 30, current_date, '1 day'::interval) as series`, /* generate a series of dates with 1 day interval */
    dateGrouper:(col: SQL | SQL.Aliased) => 
      sql<string>`DATE(${col})`.inlineParams(), /* cut off everything like miliseconds to just the current date */
  },
  last365Days:{
    dateFormatter: (data: Date) => monthDateFormatter.format(data),
    startDate: subDays(new Date(), 365),
    label: "Last 365 Days",
    sql: sql`generate_series(DATE_TRUNC('month', current_date - 365), DATE_TRUNC('month', current_date), '1 month'::interval) as series`, /* generate a series of dates with 1 month interval */
    dateGrouper:(col: SQL | SQL.Aliased) => 
      sql<string>`DATE_TRUNC('month', ${col})`.inlineParams(), /* cut off everything like miliseconds to just the current date */
  }
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { /* doing this because truncating removes all time information */
  dateStyle: "short",
  timeZone: "UTC"
})


const monthDateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "2-digit",
  month: "short",
  timeZone: "UTC"
})

function getIdTag(productId: string | undefined, tag: keyof typeof CACHE_TAGS): import("@/lib/cache").ValidTags {
  return productId == null 
    ? getGlobalTag(tag) 
    : cacheGetIdTag(productId, tag)
}
