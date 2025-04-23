"use client" /* use client to access the DOM */

import { RequiredLabelIcon } from "@/components/RequiredLabelIcon"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { productCustomizationSchema } from "@/schemas/products"
import { updateProductCustomization } from "@/server/actions/products"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Switch } from "@/components/ui/switch"
import { Banner } from "@/components/Banner"
import { NoPermissionCard } from "@/components/NoPermissionCard"

export function ProductCustomizationForm({
    customization,
    canCustomizeBanner,
    canRemoveBranding,
  }: { /* everything we're passing into this component */
    customization: {
      productId: string
      locationMessage: string
      backgroundColor: string
      textColor: string
      fontSize: string
      bannerContainer: string
      isSticky: boolean
      classPrefix: string | null
    }
    canCustomizeBanner: boolean
    canRemoveBranding: boolean
  }) {
    const form = useForm<z.infer<typeof /* using hook converting to empty string */
    productCustomizationSchema>>({
      resolver: zodResolver(productCustomizationSchema),
      defaultValues: {
        ...customization,
        classPrefix: customization.classPrefix ?? "",
      },
    })

    async function onSubmit(values: z.infer<typeof productCustomizationSchema>) {
        const data = await updateProductCustomization(
          customization.productId,
          values
        )
    
        if (data?.message){
            toast(data.error ? "Error" : "Success",{ /* sonner toast documentation: `https://sonner.emilkowal.ski/toast */
              description: data.message, /* TODO add variant */
            })
          }
      }
    
      const formValues = form.watch() /* get all values from form */
    
      return (
        <>
          <div>
            <Banner /* how the banner is going to look like */
              message={formValues.locationMessage}
              mappings={{
                country: "India",
                coupon: "HALF-OFF",
                discount: "50",
              }}
              customization={formValues}
              canRemoveBranding={canRemoveBranding}
            />
          </div>
          {!canCustomizeBanner && ( /*  */
            <div className="mt-8">
             <NoPermissionCard />
            </div>
          )}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-6 flex-col mt-8"
            >
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="locationMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        PPP Discount Message
                        <RequiredLabelIcon />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={!canCustomizeBanner}
                          className="min-h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {"Data Parameters: {country}, {coupon}, {discount}"} {/* different data paras you can use */}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* 2 columns */}
                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Background color
                          <RequiredLabelIcon />
                        </FormLabel>
                        <FormControl>
                          <Input disabled={!canCustomizeBanner} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Text color
                          <RequiredLabelIcon />
                        </FormLabel>
                        <FormControl>
                          <Input disabled={!canCustomizeBanner} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Font size
                          <RequiredLabelIcon />
                        </FormLabel>
                        <FormControl>
                          <Input disabled={!canCustomizeBanner} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isSticky"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sticky?</FormLabel>
                        <FormControl>
                          <div className="block">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!canCustomizeBanner}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bannerContainer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Banner container
                          <RequiredLabelIcon />
                        </FormLabel>
                        <FormControl>
                          <Input disabled={!canCustomizeBanner} {...field} />
                        </FormControl>
                        <FormDescription>
                          HTML container selector where you want to place the
                          banner. Ex: #container, .container, body
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="classPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CSS Prefix</FormLabel>
                        <FormControl>
                          <Input disabled={!canCustomizeBanner} {...field} />
                        </FormControl>
                        <FormDescription>
                          An optional prefix added to all CSS classes to avoid
                          conflicts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {canCustomizeBanner && (
                <div className="self-end">
                  <Button disabled={form.formState.isSubmitting} type="submit">
                    Save
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </>
      )
    }