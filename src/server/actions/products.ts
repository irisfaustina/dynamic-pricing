//call codes from the client on the server savely and securely
//no bd code, all db code is in server/db/products.ts

//This directive, used within an async function, designates that function to run on the server. Server functions can be called from client components, allowing for actions like database access or complex computations without exposing sensitive logic to the client. When a client component calls a server function, React handles the communication, sending the request to the server, executing the function, and returning the result to the client.
"use server"

import { productCountryDiscountsSchema, productCustomizationSchema, productDetailsSchema } from "@/schemas/products";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { 
    createProduct as createProductDb, 
    deleteProduct as deleteProductDb, 
    updateProduct as updateProductDb,
    updateCountryDiscounts as updateCountryDiscountsDb, 
    updateProductCustomization as updateProductCustomizationDb

} from "@/server/db/products"
import { redirect } from "next/navigation";
import { ProductTable } from "@/drizzle/schema";
import { canCreateProduct, canCustomizeBanner } from "../permissions";

export async function createProduct(unsafeData: z.infer<typeof productDetailsSchema>): Promise<{ error: boolean, message: string } | undefined>{ /* updated so that data can be undefined for alert */
    const { userId } = await auth()
    const { success, data } = productDetailsSchema.safeParse(unsafeData)
    const canCreate = await canCreateProduct(userId)

    if (!success || userId == null || !canCreate){ /* if either requirement is not met before we implement any authorization logic, we can just return an error message here */
        return {error: true, message: "There was an error creating your product."}
    }

    const { id } = await createProductDb({...data, clerkUserId: userId})

    redirect(`/dashboard/products/${id}/edit?tab=countries`)
}

export async function updateProduct(id: string, unsafeData: z.infer<typeof productDetailsSchema>): Promise<{ error: boolean, message: string } | undefined>{ /* updated so that data can be undefined for alert */
    const { userId } = await auth()
    const { success, data } = productDetailsSchema.safeParse(unsafeData)
    const errorMessage = "There was an error updating your product."

    if (!success || userId == null){
        return {error: true, message: errorMessage}
    }

    const isSuccess = await updateProductDb(data, { id, userId })

    return {error: !isSuccess, message: isSuccess ? "Product details updated successfully." : errorMessage}
}

export async function deleteProduct(id: string){
    const { userId } = await auth()
    const errorMessage = "There was an error deleting your product." /* reduce redundency */

    if (userId == null) {
        return {error: true, message: errorMessage}
    }

    const isSuccess = await deleteProductDb({id, userId} ) /* call delete product function from server, only delete when a user is associated with it */

    return { 
        error: !isSuccess, 
        message: isSuccess ? "Product deleted successfully." : errorMessage
    }
}

export async function updateCountryDiscounts(
    productId: string,
    unsafeData: z.infer<typeof productCountryDiscountsSchema>
){
    const { userId } = await auth()
    const { success, data } = productCountryDiscountsSchema.safeParse(unsafeData) 

    if (!success || userId == null){
        return {error: true, message: "There was an error saving your country discounts."}
    }

    const insert: { /*  first getting all the roles to insert then delete them */
        countryGroupId: string
        productId: string
        coupon: string
        discountPercentage: number
      }[] = []
      const deleteIds: { countryGroupId: string }[] = []
    
      data.groups.forEach(group => { /* every time we submit for each card we update the entire form */
        if ( /* if there is a discount and is acoupon we update the form, otherwise we delete */
          group.coupon != null &&
          group.coupon.length > 0 &&
          group.discountPercentage != null &&
          group.discountPercentage > 0
        ) {
          insert.push({
            countryGroupId: group.countryGroupId,
            coupon: group.coupon,
            discountPercentage: group.discountPercentage / 100, /*  converting coupon to between 0 and 1 */
            productId: productId,
          })
        } else {
          deleteIds.push({ countryGroupId: group.countryGroupId })
        }
      })

      await updateCountryDiscountsDb(deleteIds, insert, { productId, userId })

      return { error: false, message: "Country discounts saved" }
}

export async function updateProductCustomization(
    id: string,
    unsafeData: z.infer<typeof productCustomizationSchema>
  ) {
    const { userId } = await auth()
    const { success, data } = productCustomizationSchema.safeParse(unsafeData)
    const canCustomize = await canCustomizeBanner(userId)
  
    if (!success || userId == null || !canCustomize) {
      return {
        error: true,
        message: "There was an error updating your banner",
      }
    }
  
    await updateProductCustomizationDb(data, { productId: id, userId })
  
    return { error: false, message: "Banner updated" }
  }