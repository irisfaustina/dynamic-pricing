import { createEnv } from "@t3-oss/env-nextjs"; /* Deploying your app with invalid environment variables is a hassle. This package helps you to avoid that.*/
import { z } from "zod"; /* For validation. The goal is to eliminate duplicative type declarations. With Zod, you declare a validator once and Zod will automatically infer the static TypeScript type. It's easy to compose simpler types into complex data structures. */

export const env = createEnv({ /* what we keep env in */
    emptyStringAsUndefined: true, /* pass inis no db key found in env convert to undefined */
    client: { /* all strings and required don't include private key */
        NEXT_PUBLIC_SERVER_URL: z.string(),
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(), 
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),
        NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string(),
        NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string(),/* client var from clerk */
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
        NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    }  /* need to pass in all env again for client side */
})
