import { ProductDetailsForm } from "@/app/dashboard/_components/forms/ProductDetailsForm"
import { PageWithBackButton } from "@/app/dashboard/_components/PageWithBackButton"
import { getProduct, getProductCountryGroups, getProductCustomization } from "@/server/db/products"
import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CountryDiscountsForm } from "@/app/dashboard/_components/forms/CountryDiscountsForm"
import { canCustomizeBanner, canRemoveBranding } from "@/server/permissions"
import { ProductCustomizationForm } from "@/app/dashboard/_components/forms/ProductCustomizationForm"

export default async function EditProductPage({
    params: { productId },
    searchParams: { tab = "details"}, /* default tab */
}: {
    params: { productId: string },
    searchParams: { tab?: string }
}) {    
    const { userId, redirectToSignIn } = await auth() /* clerk component */
    if (userId == null) return redirectToSignIn() /* return if user is not signed in */

    const product = await getProduct({ id: productId, userId }) /* get the product */
    if (product == null) return notFound() /* return 404 if product is null */

    return ( /* return the page */
        <PageWithBackButton pageTitle="Edit Product" backButtonHref="/dashboard/products">
            <Tabs defaultValue={tab}>
                <TabsList className="bg-background/60">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="countries">Country</TabsTrigger>
                    <TabsTrigger value="customization">Customization</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                    <DetailsTab product={product} /> {/* funcitons defined belwo*/}
                </TabsContent>
                <TabsContent value="countries">
                    <CountryTab productId={productId} userId={userId} />
                </TabsContent>
                <TabsContent value="customization">
                    <CustomizationsTab productId={productId} userId={userId} />
                </TabsContent>
            </Tabs>
        </PageWithBackButton>
    )
}

function DetailsTab({ 
    product, /* parameter name */
}: { 
    product: { /* parameter type */
        id: string /* to identify the product by id */
        name: string
        description: string | null
        url: string
    }
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    Product Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ProductDetailsForm product={product} />
            </CardContent>
        </Card>
    )
}

async function CountryTab({ /* async function because it is going to make a database call so we use server side code */
    productId, /* parameters passed in from the page */
    userId, 
}: { 
    productId: string
    userId: string
}) {
    const countryGroups = await getProductCountryGroups({ productId, userId }) /* get all of the country groups that the user has access to */
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    Country Discounts
                </CardTitle>
                <CardDescription>
                    Leave the discount field blank if you do not want to display deals for any specific parity group.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CountryDiscountsForm 
                productId={productId} 
                countryGroups={countryGroups} /* this info never changes, so we can pass it to the form directly */
                />
            </CardContent>
        </Card>
    )
}

async function CustomizationsTab({
    productId,
    userId,
  }: {
    productId: string
    userId: string
  }) {
const customization = await getProductCustomization({ productId, userId })
  
    if (customization == null) return notFound()
  
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Banner Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductCustomizationForm
            canRemoveBranding={await canRemoveBranding(userId)}
            canCustomizeBanner={await canCustomizeBanner(userId)}
            customization={customization}
          />
        </CardContent>
      </Card>
    )
  }

