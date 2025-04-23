import { removeTrailingSlash } from "@/lib/utils";
import { z } from "zod";

export const productDetailsSchema = z.object({
    name:z.string().min(1, "Required"),/* use valiadation to set required fields and input */
    url:z.string().url().min(1, "Required").transform(removeTrailingSlash), /* libs util */
    description:z.string().optional()
})

export const productCountryDiscountsSchema = z.object({ /* to update country discounts */
    groups: z.array(
        z.object({
            countryGroupId: z.string().min(1, "Required"),
            discountPercentage: z
                .number()
                .max(100)
                .min(1)
                .or(z.nan())
                .transform(n => (isNaN(n)? undefined : n))
                .optional(),
            coupon: z.string().optional(),
        })
        .refine(
            value => {
              const hasCoupon = value.coupon != null && value.coupon.length > 0 /* checking  if we have a coupon */
              const hasDiscount = value.discountPercentage != null /* checking if we have a discount */
              return !(hasCoupon && !hasDiscount) /* return true if we have a coupon and no discount to throw an error*/
            },
            {
              message: "A discount is required if a coupon code is provided",
              path: ["root"], /* form messahe is rendered at the root level */
            }
          )
      ),
    
})

export const productCustomizationSchema = z.object({ /* to update product customization */
    classPrefix: z.string().optional(),
    backgroundColor: z.string().min(1, "Required"),
    textColor: z.string().min(1, "Required"),
    fontSize: z.string().min(1, "Required"),
    locationMessage: z.string().min(1, "Required"),
    bannerContainer: z.string().min(1, "Required"),
    isSticky: z.boolean(),
  })