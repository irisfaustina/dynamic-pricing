//db files is never import anywhere except for this db folder makes code much easier to clean

import { subscriptionTiers } from "@/data/subscriptionTiers";
import { db } from "@/drizzle/db";
import { UserSubscriptionTable } from "@/drizzle/schema";
import { revalidateDbCache, CACHE_TAGS, getUserTag, dbCache } from "@/lib/cache";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { SQL } from "drizzle-orm";

export async function createUserSubscription(data: typeof 
    UserSubscriptionTable.$inferInsert){
      const [newSubscription] =  await db
      .insert(UserSubscriptionTable)
      .values(data)
      .onConflictDoNothing({
        target: UserSubscriptionTable.clerkUserId,
      }).returning({
        id:UserSubscriptionTable.id,
        userId:UserSubscriptionTable.clerkUserId
      })
  
      if (newSubscription != null) {
      revalidateDbCache({ /* revalidates all cache for a user everytime I create a new product */
        tag: CACHE_TAGS.subscription,
        id: newSubscription.id,
        userId: newSubscription.userId,
      })
    }

    return newSubscription
}

export async function getUsersSubscription(userId: string){
  const cacheFn = dbCache(getUserSubscriptionInternal, {
    tags: [ getUserTag(userId, CACHE_TAGS.subscription)] /* return internal infomation here cahcing user by subscription tags */
      
  })
  return cacheFn(userId)
}

export async function updateUserSubscription(where: SQL, data: Partial<typeof UserSubscriptionTable.$inferInsert>){
  const [updatedSubscription] = await db
  .update(UserSubscriptionTable)
  .set(data)
  .where(where).returning({
    id:UserSubscriptionTable.id,
    userId:UserSubscriptionTable.clerkUserId /* use to revalidate cache */
  })
  if (updatedSubscription != null){
    revalidateDbCache({
      tag:CACHE_TAGS.subscription,
      userId: updatedSubscription.userId, 
      id: updatedSubscription.id
    })
  }
}

export async function getUsersSubscriptionTier(userId: string){ /* call get user subscription and give us just the ter portion */
  const subscription = await getUsersSubscription(userId) 

  if (subscription == null) throw new Error("User has no subscription")

  return subscriptionTiers[subscription.tier] /* otherwise get all subsctiption data based on the tier free basic standard premium*/
}

function getUserSubscriptionInternal(userId: string) {
  return db.query.UserSubscriptionTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  })
}