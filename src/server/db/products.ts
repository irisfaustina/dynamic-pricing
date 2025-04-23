//on caching, when we create or delete something, we pass on all the information to the cache, id, userid, tag for global products, 
//whenever we try to get information for an individual user, we tag it as a user; vece versa for id, if no user and no id, tag it as a global product
//we guarantee everytime we access information for a user, we revalidate the cache
import { db } from "@/drizzle/db";
import { CountryGroupDiscountTable, ProductCustomizationTable, ProductTable } from "@/drizzle/schema";
import { dbCache, getUserTag, getGlobalTag, CACHE_TAGS, revalidateDbCache, getIdTag } from "@/lib/cache";
import { removeTrailingSlash } from "@/lib/utils";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { BatchItem } from "drizzle-orm/batch";

// Exported functions
export function getProductCountryGroups({ productId, userId }: { productId: string, userId: string }){
    const cacheFn = dbCache(getProductCountryGroupsInternal, {
        tags: [
            getIdTag(productId, CACHE_TAGS.products),
            getGlobalTag(CACHE_TAGS.countries),
            getGlobalTag(CACHE_TAGS.countryGroups),
        ],
    })
    return cacheFn({ productId, userId })
}

export function getProductCustomization({ productId, userId }: { productId: string, userId: string }){
    const cacheFn = dbCache(getProductCustomizationInternal, {
        tags: [
            getIdTag(productId, CACHE_TAGS.products),
        ],
    })
    return cacheFn({ productId, userId })
}

export function getProducts(userId: string, { limit }: { limit?: number} = {}) { /* make sure you take in a limit, which is optional from page */
    const cacheFn = dbCache(getProductsInternal,{ /* THIS WILL CALL PRODUCT ID AND LIMIT */
        tags:[getUserTag(userId, CACHE_TAGS.products)]
    })
    return cacheFn(userId, { limit })
}

//calls a getprod internal function internally to get products
export function getProduct({id, userId}: {id: string, userId: string}){
    const cacheFn = dbCache(getProductInternal,{
        tags:[getIdTag(id, CACHE_TAGS.products)]
    })
    return cacheFn({id, userId })
}

export function getProductCount(userId: string) {
    const cacheFn = dbCache(getProductCountInternal, {
      tags: [getUserTag(userId, CACHE_TAGS.products)],
    })
  
    return cacheFn(userId)
}

export function getProductForBanner({
  id,
  countryCode,
  url,
}: {
  id: string
  countryCode: string
  url: string
}) {
  const cacheFn = dbCache(getProductForBannerInternal, {
    tags: [
      getIdTag(id, CACHE_TAGS.products),
      getGlobalTag(CACHE_TAGS.countries),
      getGlobalTag(CACHE_TAGS.countryGroups),
    ],
  })

  return cacheFn({
    id,
    countryCode,
    url,
  })
}
//return an array of all the new things we inserted
export async function createProduct(data: typeof ProductTable.$inferInsert){ /* when new product is created hook up brand new customization form */
    const [newProduct] = await db
    .insert(ProductTable)
    .values(data)
    .returning({ id: ProductTable.id, userId: ProductTable.clerkUserId })

    try{
        await db.insert(ProductCustomizationTable).values({
            productId: newProduct.id
        }).onConflictDoNothing({
            target: ProductCustomizationTable.productId,
        })
    } catch (error) { /* if error delete product becuase product and customization are created in the same time */
        await db.delete(ProductTable).where(eq(ProductTable.id, newProduct.id))
    }

    revalidateDbCache({ /* revalidates all cache for a user everytime I create a new product */
        tag: CACHE_TAGS.products,
        userId: newProduct.userId,
        id: newProduct.id
    })

    return newProduct
}

export async function updateProduct(data: Partial<typeof ProductTable.$inferInsert>, {id, userId}: {id: string, userId: string}){ /* pass in as objects instead of individual variables */
    const { rowCount } = await db
    .update(ProductTable)
    .set(data)
    .where(and(eq(ProductTable.clerkUserId, userId), eq(ProductTable.id, id))) /* only delete product if they have access to it */

    if (rowCount > 0) {
        revalidateDbCache({ /* revalidates all cache for a user everytime I create a new product */
            tag: CACHE_TAGS.products,
            userId: userId,
            id: id
        })
    }

    return rowCount > 0
}

export async function deleteProduct({id, userId}: {id: string, userId: string}){ /* pass in as objects instead of individual variables */
    const { rowCount } = await db
    .delete(ProductTable)
    .where(and(eq(ProductTable.id, id), eq(ProductTable.clerkUserId, userId))) /* only delete product if they have access to it */

    if (rowCount > 0){
        revalidateDbCache({ /* revalidates all cache for a user everytime I create a new product */
            tag: CACHE_TAGS.products,
            userId,
            id
        })
    }
    
    return rowCount > 0 /* which means there's a successful delete */
}

export async function updateCountryDiscounts(
    deleteGroup: { countryGroupId: string }[],
    insertGroup: (typeof CountryGroupDiscountTable.$inferInsert)[],
    { productId, userId }: { productId: string; userId: string }
  ) {
    const product = await getProduct({ id: productId, userId })
    if (product == null) return false
  
    const statements: BatchItem<"pg">[] = [] /* use this to do cache */ 
    if (deleteGroup.length > 0) {
      statements.push(
        db.delete(CountryGroupDiscountTable).where( /* deleting all rows in discount table where id is in array */
          and(
            eq(CountryGroupDiscountTable.productId, productId),
            inArray(
              CountryGroupDiscountTable.countryGroupId,
              deleteGroup.map(group => group.countryGroupId)
            )
          )
        )
      )
    }
  
    if (insertGroup.length > 0) { /* handle insert group */
      statements.push(
        db
          .insert(CountryGroupDiscountTable)
          .values(insertGroup)
          .onConflictDoUpdate({ /* do spefically when there is a conflict */
            target: [
              CountryGroupDiscountTable.productId,
              CountryGroupDiscountTable.countryGroupId,
            ],
            set: {
              coupon: sql.raw(
                `excluded.${CountryGroupDiscountTable.coupon.name}`
              ),
              discountPercentage: sql.raw(
                `excluded.${CountryGroupDiscountTable.discountPercentage.name}`
              ),
            },
          })
      )
    }
  
    if (statements.length > 0) {
      await db.batch(statements as [BatchItem<"pg">]) /* tell typescript to treat this as an array of pg statements */
    }
  
    revalidateDbCache({
      tag: CACHE_TAGS.products,
      userId,
      id: productId,
    })
}

export async function updateProductCustomization(
    data: Partial<typeof ProductCustomizationTable.$inferInsert>,
    { productId, userId }: { productId: string; userId: string }
  ) {
    const product = await getProduct({ id: productId, userId }) /* make sure user has access to product */
    if (product == null) return
  
    await db /* update product customization */
      .update(ProductCustomizationTable)
      .set(data)
      .where(eq(ProductCustomizationTable.productId, productId))
  
    revalidateDbCache({ /* revalidate product cache */
      tag: CACHE_TAGS.products,
      userId,
      id: productId,
    })
  }
//internal functions
async function getProductCountryGroupsInternal({productId, userId}: {productId: string, userId: string}){
    const product = await getProduct({id: productId, userId})
    if (product == null) return [] /* guarantees that the user has access to products */
    
    const data = await db.query.CountryGroupTable.findMany({ /* get all of the groups & all the countries for the groups & all the discounts for the groups */
        with: {
            countries: { /* get all the countries */
                columns: {
                    name: true, /* name of the country */
                    code: true /* use code to render out a flag for each country */
                }
            },
            countryGroupDiscounts: { /* get all the discounts for the groups */
                columns: {
                    coupon: true,
                    discountPercentage: true
                },
                where: (({ productId: id }, { eq }) => eq( id, productId)),
                limit: 1
            }
        }
    })
    return data.map(group => ({
        id: group.id,
        name: group.name,
        recommendedDiscountPercentage: group.recommendedDiscountPercentage,
        countries: group.countries,
        discount: group.countryGroupDiscounts.at(0)
    }))
}

async function getProductCustomizationInternal({productId, userId}: {productId: string, userId: string}){
    const data = await db.query.ProductTable.findFirst({ /* query for a product based on product id and user id */
        where: ({ id, clerkUserId }, { and, eq }) => 
            and(eq( id, productId), eq( clerkUserId, userId)),
        with:{ /* returning with that product's customization */
            productCustomization: true,
        }
    })
    return data?.productCustomization /* if no customization return null */
}

function getProductsInternal(userId: string, {limit}: {limit?: number}){ /* use this to do cache */
    return db.query.ProductTable.findMany({
        where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
        orderBy: ({  createdAt }, {desc }) => desc(createdAt),/* in descending order */
        limit,
    })
}

function getProductInternal({id, userId}: {id: string, userId: string}){ /* use this to do cache */
    return db.query.ProductTable.findFirst({
        where: ({ clerkUserId, id: idCol }, { eq, and }) => 
            and(eq(clerkUserId, userId), eq(idCol, id)),
    })
}

async function getProductCountInternal(userId: string) {
    const counts = await db /* select productcount which is count function from drizzle from product table specifically want to get them when crieter is true, when prod clerk id is user id */
      .select({ productCount: count() })
      .from(ProductTable)
      .where(eq(ProductTable.clerkUserId, userId))
  
    return counts[0]?.productCount ?? 0 /* array of product count if no 0 because no products */
  }  

async function getProductForBannerInternal({
    id,
    countryCode,
    url,
  }: {
    id: string
    countryCode: string
    url: string
  }) {
    const data = await db.query.ProductTable.findFirst({
      where: ({ id: idCol, url: urlCol }, { eq, and }) =>
        and(eq(idCol, id), eq(urlCol, removeTrailingSlash(url))),
      columns: {
        id: true,
        clerkUserId: true,
      },
      with: {
        productCustomization: true,
        countryGroupDiscounts: {
          columns: {
            coupon: true,
            discountPercentage: true,
          },
          with: {
            countryGroup: {
              columns: {},
              with: {
                countries: {
                  columns: {
                    id: true,
                    name: true,
                  },
                  limit: 1,
                  where: ({ code }, { eq }) => eq(code, countryCode),
                },
              },
            },
          },
        },
      },
    })
  
    const discount = data?.countryGroupDiscounts.find(
      discount => discount.countryGroup.countries.length > 0
    )
    const country = discount?.countryGroup.countries[0]
    const product =
      data == null || data.productCustomization == null
        ? undefined
        : {
            id: data.id,
            clerkUserId: data.clerkUserId,
            customization: data.productCustomization,
          }
  
    return {
      product,
      country,
      discount:
        discount == null
          ? undefined
          : {
              coupon: discount.coupon,
              percentage: discount.discountPercentage,
            },
    }
  }



