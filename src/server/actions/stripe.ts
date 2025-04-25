"use server"

import { PaidTierNames, subscriptionTiers } from "@/data/subscriptionTiers"
import { auth, currentUser, User } from "@clerk/nextjs/server"
import { getUsersSubscription } from "../db/subscription"
import { Stripe } from "stripe"
import { env as serverEnv } from "@/data/env/server"
import { env as clientEnv } from "@/data/env/client"
import { redirect } from "next/navigation"

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY)

export async function createCancelSession() {
  try {
    const user = await currentUser();
    if (user == null) return { error: true };

    const subscription = await getUsersSubscription(user.id);
    if (subscription == null) return { error: true };

    if (
      subscription.stripeCustomerId == null ||
      subscription.stripeSubscriptionId == null
    ) {
      return new Response(null, { status: 500 });
    }

    // Check if subscription is already canceled
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    if (stripeSubscription.cancel_at_period_end) {
      redirect('/dashboard/subscription');
    }

    const portalSession = await stripe.billingPortal.sessions.create({ /* specify which sub we're cancelling and create a url that directs to cancelling */
      customer: subscription.stripeCustomerId,
      return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
      flow_data: {
        type: "subscription_cancel",
        subscription_cancel: {
          subscription: subscription.stripeSubscriptionId,
        },
      },
    });

    redirect(portalSession.url);
  } catch (error) {
    console.error('Error in createCancelSession:', error);
    return { error: true };
  }
}

export async function createCustomerPortalSession() {
  try {
    const { userId } = await auth();
    if (userId == null) return { error: true };

    const subscription = await getUsersSubscription(userId);
    if (subscription?.stripeCustomerId == null) {
      return { error: true };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    });

    // Instead of using redirect(), return the URL
    return { url: portalSession.url };
  } catch (error) {
    console.error('Error in createCustomerPortalSession:', error);
    return { error: true };
  }
}

export async function createCheckoutSession(tier: PaidTierNames) {
  const user = await currentUser()
  if (user == null) return { error: true }

  const subscription = await getUsersSubscription(user.id)

  if (subscription == null) return { error: true }

  if (subscription.stripeCustomerId == null) {
    const url = await getCheckoutSession(tier, user)
    if (url == null) return { error: true }
    redirect(url)
  } else { /* when we don't have a subscription & want to upgrade */
    const url = await getSubscriptionUpgradeSession(tier, subscription)
    redirect(url)
  }
}

async function getCheckoutSession(tier: PaidTierNames, user: User) {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.primaryEmailAddress?.emailAddress,
    subscription_data: {
      metadata: {
        clerkUserId: user.id,
      },
    },
    line_items: [
      {
        price: subscriptionTiers[tier].stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    cancel_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
  })

  return session.url
}

async function getSubscriptionUpgradeSession(
  tier: PaidTierNames,
  subscription: {
    stripeCustomerId: string | null
    stripeSubscriptionId: string | null
    stripeSubscriptionItemId: string | null
  }
) {
  if (
    subscription.stripeCustomerId == null ||
    subscription.stripeSubscriptionId == null ||
    subscription.stripeSubscriptionItemId == null
  ) {
    throw new Error()
  }

  const portalSession = await stripe.billingPortal.sessions.create({ /* bring them to the exact billing portal to the brand new subscription */
    customer: subscription.stripeCustomerId,
    return_url: `${clientEnv.NEXT_PUBLIC_SERVER_URL}/dashboard/subscription`,
    flow_data: {
      type: "subscription_update_confirm",
      subscription_update_confirm: {
        subscription: subscription.stripeSubscriptionId,
        items: [
      {
            id: subscription.stripeSubscriptionItemId,
        price: subscriptionTiers[tier].stripePriceId,
        quantity: 1, /* quantity is 1 because we are upgrading */
      },
    ],
      },
    },
  })

  return portalSession.url
}