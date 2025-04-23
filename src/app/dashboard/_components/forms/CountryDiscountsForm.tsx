"use client" /* because we are using client side form validation */

import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { productCountryDiscountsSchema } from "@/schemas/products"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ReactCountryFlag from "react-country-flag"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateCountryDiscounts } from "@/server/actions/products"

export function CountryDiscountsForm({
    productId,
    countryGroups,
}:{    
    productId: string,
    countryGroups: { 
        id: string, 
        name: string, 
        recommendedDiscountPercentage: number | null
        countries: { 
            name: string, 
            code: string 
        }[]
        discount?: { 
            coupon: string, 
            discountPercentage: number 
        } | undefined
     }[] /* array of country groups because we are updating country groups */
}){
    const form = useForm<z.infer<typeof productCountryDiscountsSchema>>({ /* In the context of React Hook Form and Zod, "useForm z.infer" refers to a combination where you use the useForm hook from React Hook Form to manage a form, while leveraging Zod's infer function to automatically generate TypeScript types for your form data based on a defined Zod schema, essentially ensuring type safety and strong validation for your form inputs.         */
        resolver: zodResolver(productCountryDiscountsSchema), /* using zod resolver to validate form data by schema */
        defaultValues: {
            groups: countryGroups.map(group => {
                const discount = group.discount?.discountPercentage ?? group.recommendedDiscountPercentage /* getting the discount for the group */

                return {
                    countryGroupId: group.id,
                    coupon: group.discount?.coupon ?? "",
                    discountPercentage: discount != null ? discount * 100 : undefined
                }
            })
        }
    })

    async function onSubmit(values: z.infer<typeof productCountryDiscountsSchema>){ /* we need schema because we are validating the form */
        const data = await updateCountryDiscounts(productId, values) /* calling update country discounts function on the server side */

        if (data?.message){
            toast(data.error ? "Error" : "Success",{ /* sonner toast documentation: `https://sonner.emilkowal.ski/toast */
              description: data.message, /* TODO add variant */
            })
          }
        }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col">
                {countryGroups.map((group, index) => (
                    <Card key={group.id}>
                        <CardContent className="pt-6 flex items-center">
                            <div className="flex-1 mr-24"> 
                                <h2 className="text-muted-foreground text-sm font-semibold mb-2">{group.name}</h2>
                                <div className="flex gap-2 flex-wrap">
                                    {group.countries.map(country => (
                                        <ReactCountryFlag key={country.code} countryCode={country.code} svg />
                                    ))}
                                </div>
                            </div>
                            <input type="hidden" {...form.register(`groups.${index}.countryGroupId`)} />
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`groups.${index}.discountPercentage`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discount %</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        className="w-32" 
                                                        type="number"
                                                        {...field}
                                                        value={field.value === undefined || field.value === null ? "" : field.value.toString()} /* setting up default values */
                                                        onChange={e => { /* on change, update the value */
                                                            const val = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                                            field.onChange(val);
                                                        }}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`groups.${index}.coupon`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Coupon</FormLabel>
                                                <FormControl>
                                                    <Input className="w-50" placeholder="Coupon" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {form.formState.errors.groups?.[index]?.root?.message && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.groups[index]?.root?.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <div className="self-end">
                <Button disabled={form.formState.isSubmitting} type="submit">
                    Save
                </Button>
            </div>
            </form>
        </Form>
    )
}
