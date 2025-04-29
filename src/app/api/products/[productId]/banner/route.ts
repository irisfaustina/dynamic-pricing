import { Banner } from "@/components/Banner" /* rendering out the entire banner on someone else's website */
import { env } from "@/data/env/server"
import { getProductForBanner } from "@/server/db/products"
import { createProductView } from "@/server/db/productViews"
import { canRemoveBranding, canShowDiscountBanner } from "@/server/permissions"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { NextRequest } from "next/server"
import { createElement } from "react"

//can the user see this js
//export const runtime = "nodejs"

export const runtime = "nodejs"

export async function GET( /* get request product banner api*/
  request: NextRequest,
  context: { params: { productId: string } } /* get product id */
) {
  const { productId } = await context.params
  const headersMap = headers() /* api headers */
  const requestingUrl = (await headersMap).get("referer") || (await headersMap).get("origin") /* determine what url the user is calling our site from, so product is associated with the right url*/
  if (requestingUrl == null) return notFound() /* any one that calls the code from not the right url */
  const countryCode = getCountryCode(request) /* get country code based on the request */
  if (countryCode == null) return notFound() /* any one that calls the code from not the right country */

  const { product, discount, country } = await getProductForBanner({
    id: productId,
    countryCode,
    url: requestingUrl,
  })

  if (product == null) return notFound()

  const canShowBanner = await canShowDiscountBanner(product.clerkUserId) /* permission to create */

  await createProductView({
    productId: product.id,
    countryId: country?.id,
    userId: product.clerkUserId,
  })

  if (!canShowBanner) return notFound()
  if (country == null || discount == null) return notFound()

  return new Response(
    await getJavaScript(
      product,
      country,
      discount,
      await canRemoveBranding(product.clerkUserId)
    ),
    { headers: { "content-type": "text/javascript" } }
  )
}

function getCountryCode(request: NextRequest) { /* to validate what country is the product calling from */
  if ((request as any).geo?.country != null) return (request as any).geo.country /* TODO: modify to use this line of code only in production, is they have a country code */
  if (process.env.NODE_ENV === "development") { /* for development only in data env server*/
    return env.TEST_COUNTRY_CODE /* for development only in data env server*/
  }
}

async function getJavaScript( /* once checks passed return js */
  product: {
    customization: {
      locationMessage: string
      bannerContainer: string
      backgroundColor: string
      textColor: string
      fontSize: string
      isSticky: boolean
      classPrefix?: string | null
    }
  },
  country: { name: string },
  discount: { coupon: string; percentage: number },
  canRemoveBranding: boolean
) {
  const { renderToStaticMarkup } = await import("react-dom/server") /* dynamic import nextjs, render to static markup */
  const html = renderToStaticMarkup(
    createElement(Banner, {
      message: product.customization.locationMessage,
      mappings: {
        country: country.name,
        coupon: discount.coupon,
        discount: (discount.percentage * 100).toString(),
      },
      customization: product.customization,
      canRemoveBranding,
    })
  )
  .replace(/'/g, "\\'") // Escape single quotes
  .replace(/"/g, '\\"') // Escape double quotes
  
  const script = `
    (function() {
       const banner = document.createElement("div");
      banner.innerHTML = "${html}";
      const container = document.querySelector("${product.customization.bannerContainer}");
      if (container) {
        container.prepend(...banner.children);
      }
    })();
  `
  
  return script.replace(/(\r\n|\n|\r)/g, "")
}
