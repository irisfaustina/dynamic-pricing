import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { env } from '@/data/env/server'
import { UserSubscriptionTable } from '@/drizzle/schema'
import { db } from '@/drizzle/db'
import { createUserSubscription, getUsersSubscription } from '@/server/db/subscription'
import { deleteUser } from '@/server/db/users'
import { Stripe } from 'stripe' /* for deleting users from clerk */

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(req: Request) {
  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id') /* get info related to svix */
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // check is any info is not there, if there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json() /* get ubfirmation for the payload, new json where all new user are passed to us */
  const body = JSON.stringify(payload)

  // Create new Svix instance with secret
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)
  let evt: WebhookEvent

  // Verify payload with headers, makes sure other people don't post info to this, gaurantees all infor comes from clerk
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id, /* based on the event we verify does this body signatures by this svix library*/
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  switch(evt.type){
    case "user.created": {
        console.log("")
        //user created event
        await createUserSubscription({  /* await to make sure it runs */
            clerkUserId: evt.data.id, 
            tier: "Free", 
        })
        break
    }
    case "user.deleted": {
      if(evt.data.id != null){
        const userSubscription = await getUsersSubscription(evt.data.id) /* get the user's subscription */
        if (userSubscription?.stripeSubscriptionId != null) { /* only cancel if the user has a subscription */
          await stripe.subscriptions.cancel(userSubscription?.stripeSubscriptionId) /* pass in id to cancel the subscription */
        }
        await deleteUser(evt.data.id)
      }
    }
  }

  return new Response('Webhook received', { status: 200 })
}


