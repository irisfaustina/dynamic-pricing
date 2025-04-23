import { startOfMonth } from "date-fns"
import { getProductCount } from "./db/products"
import { getUsersSubscriptionTier } from "./db/subscription" /* referring to db folder product */
import { getProductViewCount } from "./db/productViews"

export async function canRemoveBranding(userId: string | null){
    if (userId == null) return false /* makes it easier when we call this function */
    const tier = await getUsersSubscriptionTier(userId )
    return tier.canRemoveBranding
}

export async function canCustomizeBanner(userId: string | null){
    if (userId == null) return false /* makes it easier when we call this function */
    const tier = await getUsersSubscriptionTier(userId )
    return tier.canCustomizeBanner
}

export async function canAccessAnalytics(userId: string | null){
    if (userId == null) return false /* makes it easier when we call this function */
    const tier = await getUsersSubscriptionTier(userId )
    return tier.canAccessAnalytics
}

export async function canCreateProduct(userId: string | null) {
    if (userId == null) return false
    const tier = await getUsersSubscriptionTier(userId)
    const productCount = await getProductCount(userId)
    return productCount < tier.maxNumberOfProducts /* user can still create new product but prod count needs to be less than max prod allowed */
  }
  
export async function canShowDiscountBanner(userId: string | null) {
    if (userId == null) return false
    const tier = await getUsersSubscriptionTier(userId)
    const productViews = await getProductViewCount(
      userId,
      startOfMonth(new Date())
    )
    return productViews < tier.maxNumberOfVisits
  }