import { db } from "@/drizzle/db"
import { ProductTable, ProductViewTable } from "@/drizzle/schema"
import { CACHE_TAGS, dbCache, getUserTag, revalidateDbCache } from "@/lib/cache"
import { and, count, eq, gte } from "drizzle-orm"

export function getProductViewCount(userId: string, startDate: Date) {
  const cacheFn = dbCache(getProductViewCountInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.productViews)],
  })

  return cacheFn(userId, startDate)
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