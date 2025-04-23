import { revalidateTag, unstable_cache } from "next/cache"
import { cache } from "react"

export type ValidTags = /* so you know all typ of tags allow and can create them  */
    | ReturnType<typeof getGlobalTag> 
    | ReturnType<typeof getUserTag> 
    | ReturnType<typeof getIdTag>
    
export const CACHE_TAGS = {
  products:"products",
  productViews: "productViews",
  subscription: "subscription",
  countries: "countries",
  countryGroups: "countryGroups",
} as const

export function getGlobalTag(tag: keyof typeof CACHE_TAGS){ /* tag will be products what whatever you pass in cache tags */
    return `global${CACHE_TAGS[tag]}` as const /* returns a string that's always global products or views */
}

export function getUserTag(userId: string, tag: keyof typeof CACHE_TAGS){
    return `user${userId}-${CACHE_TAGS[tag]}` as const
}

//id level caching
export function getIdTag(id: string, tag: keyof typeof CACHE_TAGS){
    return `product${id}-${CACHE_TAGS[tag]}` as const
}

export function getSubscriptionTag(id: string, tag: keyof typeof CACHE_TAGS){
    return `subscription${id}-${CACHE_TAGS[tag]}` as const
}

export function clearFullCache(){
    revalidateTag("*") /* clear all cache */
}

export function dbCache<T extends (...args: any[]) => Promise<any>>(
    cb: Parameters<typeof unstable_cache<T>>[0], 
    { tags }:{tags?: ValidTags[] }
) { /* must use validated tags */
    return cache(unstable_cache(cb, undefined, { tags: [...(tags ?? []), "*"] })) /* handle undefined tags with nullish coalescing */
}

export function revalidateDbCache({ /* any time we make changes to db call this function */
    tag, 
    userId, 
    id
}:{
    tag: keyof typeof CACHE_TAGS, 
    userId?: string, 
    id?: string
}){
    revalidateTag(getGlobalTag(tag)) /* ? means optional string */
    if (userId != null){
        revalidateTag(getUserTag(userId, tag))
    }
    if (id != null){
        revalidateTag(getIdTag(id, tag))
    }
}
