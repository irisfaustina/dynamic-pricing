import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { NeonIcon } from "./_icons/Neon";
import { ClerkIcon } from "./_icons/Clerk";
import { subscriptionTiersInOrder } from "@/data/subscriptionTiers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/formatters";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/20 to-background relative overflow-hidden flex items-center justify-center text-center text-balance flex-col gap-8 px-4 animate-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] animate-pulse-slow"></div>
        <div className="absolute -inset-[100%] blur-3xl opacity-50 bg-gradient-to-r from-primary/20 via-accent/20 to-background animate-gradient-slow"></div>
        <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight m-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-gradient relative z-10">
          Price Smarter, Sell Bigger!
        </h1>
        <p className="text-lg lg:text-3xl max-w-screen-xl text-muted-foreground/90 relative z-10">
          Optimize your product pricing across countries to maximize sales.
          <span className="block mt-2 text-primary font-semibold">
            Capture 85% of the untapped market with location-based dynamic
            pricing
          </span>
        </p>
        <SignUpButton>
          <Button className="text-lg p-6 rounded-xl flex gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-accent/25">
            Get started for free{" "}
            <ArrowRightIcon className="size-5 animate-bounce-x" />
          </Button>
        </SignUpButton>
      </section>
      <section className="bg-gradient-to-b from-background to-primary/5 text-foreground relative overflow-hidden">
        <div className="container py-16 flex flex-col gap-16 px-8 md:px-16 relative z-10">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] animate-grid-flow"></div>
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
      <section
        id="pricing"
        className="px-8 py-16 bg-gradient-to-b from-background via-accent/5 to-background relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] animate-pulse-slow"></div>
        <h2 className="text-4xl text-center text-balance font-semibold mb-8">
          Pricing software which pays for itself 20x over
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
          {subscriptionTiersInOrder.map((tier) => (
            <PricingCard
              key={tier.name}
              {...tier}
            /> /* the data file structure allow direct edit to subscriptionTiers.ts without changing code */
          ))}
        </div>
      </section>
      <footer className="container pt-16 pb-8 flex flex-col sm:flex-row gap-8 sm:gap-4 justify-between items-start">
        {" "}
        {/* use container so it's container in a size , use padding top and botton to space; use flex for mobile responsivness*/}
        <Link href="/">
          <BrandLogo />
        </Link>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex flex-col gap-8">
            <FooterLinkGroup /* write this out first and then create footerlink group function below */
              title="Help"
              links={[
                { label: "PPP Discounts", href: "/discounts" },
                { label: "Discount API", href: "/api-discounts" },
              ]}
            />
            <FooterLinkGroup /* write this out first and then create footerlink group function below */
              title="Solutions"
              links={[
                { label: "Newsletter", href: "/newsletter" },
                { label: "SaaS Business", href: "/saas" },
                { label: "Online Courses", href: "/onlinecourses" },
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
  );
}

function PricingCard({
  name,
  priceInCents,
  maxNumberOfProducts,
  maxNumberOfVisits,
  canAccessAnalytics,
  canCustomizeBanner,
  canRemoveBranding,
}: (typeof subscriptionTiersInOrder)[number]) {
  //imported from chadcn npx shadcn@latest add card
  //when dealing with large numbers, use format Compact Number breaking down into its own file
  //create formatter.ts is lib folder
  const isMostPopular = name === "Standard";
  return (
    <Card
      className={cn(
        "relative shadow-none rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        isMostPopular
          ? "border-accent border-2 shadow-accent/25 hover:shadow-accent/40"
          : "border-none hover:border hover:border-primary/20"
      )}
    >
      {isMostPopular && (
        <div className="bg-accent text-accent-foreground absolute py-1 px-10 -right-8 top-24 rotate-45 origin-top-right">
          Most Popular
        </div> /* add most popular banner */
      )}
      <CardHeader>
        <div className="text-accent font-semibold mb-8">{name}</div>
        <CardTitle className="text-xl font-bold">
          ${priceInCents / 100} /mo
        </CardTitle>
        <CardDescription>
          {formatCompactNumber(maxNumberOfVisits)} pricing page visits/mo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpButton>
          <Button
            className="text-lg w-full rounded-lg"
            variant={isMostPopular ? "accent" : "default"}
          >
            Get Started
          </Button>
        </SignUpButton>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 items-start">
        <Feature className="font-bold">
          {maxNumberOfProducts}{" "}
          {maxNumberOfProducts === 1 ? "product" : "products"}
        </Feature>{" "}
        {/* //if max is one then product otherwise products ---{maxNumberOfProducts === 1 ? "product" : "products"}products  */}
        <Feature>PPP Discounts</Feature>
        {canAccessAnalytics && <Feature>Advanced analytics</Feature>}{" "}
        {/* order of the features matter */}
        {canRemoveBranding && <Feature>Remove Easy PPP branding</Feature>}
        {canCustomizeBanner && <Feature>Banner customization</Feature>}
        {/* // if this tier name can customize banner, also include text ---{canCustomizeBanner && <Feature>Banner customization</Feature>} */}
      </CardFooter>
    </Card>
  );
}
// Feature goes into cardfooter ? is optional string
// <div> is a block-level element creating a new line and used for structuring larger sections,
// <span> is an inline element for styling small segments of text without altering the document flow.
function Feature({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CheckIcon className="size-4 stroke-accent bg-accent/25 rounded-full p-0.5" />
      <span>{children}</span>
    </div>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  /* name value pair for definieing function, title is a string links are objects and we define it, then we can render below */
  return (
    /* always remember to wrap function rendering in return */
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">{title}</h3>
      <ul className="flex flex-col gap-2 text-sm">
        {" "}
        {/* ul is unorganized list */}
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
        {/* loop through each of the links, for each link, render out an LI */}
      </ul>
    </div> /* in the col direction in a gap of 4 */
  );
}
