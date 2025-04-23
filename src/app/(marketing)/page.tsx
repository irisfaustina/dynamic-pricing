import { Button } from "@/components/ui/button"
import { SignUpButton } from "@clerk/nextjs"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { NeonIcon } from "./_icons/Neon"
import { ClerkIcon } from "./_icons/Clerk"
import { subscriptionTiersInOrder } from "@/data/subscriptionTiers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompactNumber } from "@/lib/formatters"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/BrandLogo"

export default function HomePage() {
  return <>
  <section className="min-h-screen bg-[radial-gradient(hsl(0,72%,65%,40%),hsl(24,62%,73%,40%),hsl(var(--background))_60%)] flex items-center justify-center text-center text-balance flex-col gap-8 px-4">
    <h1 className="text-6xl lg:text-7xl x1:text-8xl font-bold tracking-tight m-4">Price Smarter, Sell bigger!</h1>
    <p className="text-lg lg:text-3xl max-w-screen-x1 ">Optimize your product pricing across countries to maximize sales. Capture 85% of the untapped market with location-based dynamic pricing</p>
    <SignUpButton>
      <Button className="text-lg p-6 rounded-x1 flex gap-2">
      Get started for free <ArrowRightIcon className="size-5" />
      </Button>
    </SignUpButton>
  </section>
  <section className="bg-primary text-primary-foreground">
    <div className="container py-16 flex flex-col gap-16 px-8 md:px16">
    <h2 className="text-3xl text-center text-balance">
    Trusted by the top modern companies
    </h2>
    <div className="grid grid-col-2 md:grid-cols-3 xl:grid-cols-5 gap-16">
      <Link href="https://neon.tech/">
        <NeonIcon />
      </Link>
      <Link href="https://clerk.com/">
        <ClerkIcon />
      </Link>
      <Link href="https://neon.tech/">
        <NeonIcon />
      </Link>
      <Link href="https://clerk.com/">
        <ClerkIcon />
      </Link>
      <Link href="https://neon.tech/">
        <NeonIcon />
      </Link>
      <Link href="https://clerk.com/">
        <ClerkIcon />
      </Link>
      <Link href="https://neon.tech/">
        <NeonIcon />
      </Link>
      <Link href="https://clerk.com/">
        <ClerkIcon />
      </Link>
      <Link href="https://neon.tech/">
        <NeonIcon />
      </Link>
      <Link className="md:max-xl:hidden" href="https://clerk.com/">
        <ClerkIcon />
      </Link>
    </div>
    </div>
  </section>
  <section id="pricing" className="px-8 py-16 bg-accent/5">
    <h2 className="text-4xl text-center text-balance font-semibold mb-8">
      Pricing software which pays for itself 20x over
    </h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
      {subscriptionTiersInOrder.map(tier => (
        <PricingCard key={tier.name} {...tier} /> /* the data file structure allow direct edit to subscriptionTiers.ts without changing code */
      ))}
    </div>
  </section>
  <footer className="container pt-16 pb-8 flex flex-col sm:flex-row gap-8 sm:gap-4 justify-between items-start"> {/* use container so it's container in a size , use padding top and botton to space; use flex for mobile responsivness*/}
      <Link href="/">
        <BrandLogo />
      </Link>
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="flex flex-col gap-8">
          <FooterLinkGroup /* write this out first and then create footerlink group function below */
          title="Help" 
          links={[ 
            {label: "PPP Discounts", href: "/discounts"},
            {label: "Discount API", href: "/api-discounts"},
          ]}
          />
          <FooterLinkGroup /* write this out first and then create footerlink group function below */
          title="Solutions" 
          links={[ 
            {label: "Newsletter", href: "/newsletter"},
            {label: "SaaS Business", href: "/saas"},
            {label: "Online Courses", href: "/onlinecourses"},
          ]}
          />
        </div>
        <div className="flex flex-col gap-8">
            <FooterLinkGroup
              title="Features"
              links={[{ label: "PPP Discounts", href: "/discount1" }]}
            />
            <FooterLinkGroup
              title="Tools"
              links={[
                { label: "Salary Converter", href: "/counverter" },
                { label: "Coupon Generator", href: "/coupon" },
                { label: "Stripe App", href: "/stripe" },
              ]}
            />
            <FooterLinkGroup
              title="Company"
              links={[
                { label: "Affiliate", href: "/affliate" },
                { label: "Twitter", href: "/twitter" },
                { label: "Terms of Service", href: "/tos" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-8">
            <FooterLinkGroup
              title="Integrations"
              links={[
                { label: "Lemon Squeezy", href: "/lemon" },
                { label: "Gumroad", href: "/gumroad" },
                { label: "Stripe", href: "stripe" },
                { label: "Chargebee", href: "/chargebee" },
                { label: "Paddle", href: "/paddle" },
              ]}
            />
            <FooterLinkGroup
              title="Tutorials"
              links={[
                { label: "Any Website", href: "/wbesite" },
                { label: "Lemon Squeezy", href: "lemon" },
                { label: "Gumroad", href: "/gumroad" },
                { label: "Stripe", href: "/stripe" },
                { label: "Chargebee", href: "/chargebee" },
                { label: "Paddle", href: "/paddle" },
              ]}
            />
          </div>
      </div>
  </footer>
  </>
}

function PricingCard({
  name,
  priceInCents,
  maxNumberOfProducts,
  maxNumberOfVisits,
  canAccessAnalytics,
  canCustomizeBanner,
  canRemoveBranding,
}:typeof subscriptionTiersInOrder[number]) {
  //imported from chadcn npx shadcn@latest add card
  //when dealing with large numbers, use format Compact Number breaking down into its own file
  //create formatter.ts is lib folder
  const isMostPopular = name === "Standard"
  return (
    <Card> 
      <CardHeader>
        <div className="text-accent font-semibold mb-8">
          {name}</div>
        <CardTitle className="text-xl font-bold">${priceInCents / 100} /mo</CardTitle>
        <CardDescription>
          {formatCompactNumber (maxNumberOfVisits)} pricing page visits/mo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpButton>
          <Button className="text-lg w-full rounded-lg" variant={isMostPopular ? "accent": "default"}>Get Started</Button>
        </SignUpButton>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
        <Feature className ="font-bold">{maxNumberOfProducts} {maxNumberOfProducts === 1 ? "product" : "products"}</Feature> {/* //if max is one then product otherwise products ---{maxNumberOfProducts === 1 ? "product" : "products"}products  */}
        <Feature>PPP Discounts</Feature>
        {canAccessAnalytics && <Feature>Advanced analytics</Feature>} {/* order of the features matter */}
        {canRemoveBranding && <Feature>Remove Easy PPP branding</Feature>}
        {canCustomizeBanner && <Feature>Banner customization</Feature>}{/* // if this tier name can customize banner, also include text ---{canCustomizeBanner && <Feature>Banner customization</Feature>} */}
      </CardFooter>
    </Card>
  )
}
// Feature goes into cardfooter ? is optional string
// <div> is a block-level element creating a new line and used for structuring larger sections, 
// <span> is an inline element for styling small segments of text without altering the document flow. 
function Feature({ children, className }: {children: ReactNode, className?:string}){
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CheckIcon className="size-4 stroke-accent bg-accent/25 rounded-full p-0.5" />
      <span>{children}</span>
    </div>
  )
}

function FooterLinkGroup({title, links}: {title:string, links: {
  label: string, href: string}[]
}){ /* name value pair for definieing function, title is a string links are objects and we define it, then we can render below */
  return ( /* always remember to wrap function rendering in return */
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm" > {/* ul is unorganized list */}
        {links.map(link => (
          <li key={`${link.href}-${link.label}`}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}{/* loop through each of the links, for each link, render out an LI */}
      </ul>
    </div> /* in the col direction in a gap of 4 */
  )
}