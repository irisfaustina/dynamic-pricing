//so in db.ts we can use this

import "dotenv/config";
import { createEnv } from "@t3-oss/env-nextjs"; /* Deploying your app with invalid environment variables is a hassle. This package helps you to avoid that.*/
import { z } from "zod"; /* For validation. The goal is to eliminate duplicative type declarations. With Zod, you declare a validator once and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures. */

export const env = createEnv({ /* what we keep env in */
    emptyStringAsUndefined: true, /* pass inis no db key found in env convert to undefined */
    server: {
        DATABASE_URL: z.string().url(), /* neon var a string from zod */
        CLERK_SECRET_KEY: z.string(), /* clerk secret key */
        CLERK_WEBHOOK_SECRET:z.string(),
        SIGNING_SECRET:z.string(),
        STRIPE_SECRET_KEY: z.string(),
        STRIPE_WEBHOOK_SECRET: z.string(),
        STRIPE_BASIC_PLAN_PRICE_ID: z.string(),
        STRIPE_STANDARD_PLAN_PRICE_ID: z.string(),
        STRIPE_PREMIUM_PLAN_PRICE_ID: z.string(),
        TEST_COUNTRY_CODE: z.string(),
    },
    experimental__runtimeEnv: process.env,
})