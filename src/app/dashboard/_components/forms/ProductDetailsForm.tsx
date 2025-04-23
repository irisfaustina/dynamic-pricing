//This directive marks a component and all its children as client components. Client components are rendered in the browser and can use React hooks and browser-specific APIs. They are necessary for interactivity and managing state. When React encounters a 'use client' directive, it renders the server components up to that point, serializes the necessary data, and sends it to the client, where the client component and its children are rendered.
"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver} from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { productDetailsSchema } from "@/schemas/products";
import { createProduct, updateProduct } from "@/server/actions/products";
import { toast } from "sonner"
import { RequiredLabelIcon } from "@/components/RequiredLabelIcon";

export function ProductDetailsForm({ product }: { 
  product?: { /* ? ensures its optional */
    id: string
    name: string
    description: string | null
    url: string
}
}) {
  const form = useForm<z.infer<typeof productDetailsSchema>>({ 
    resolver: zodResolver(productDetailsSchema),
    defaultValues: product ? { /* The form will now properly initialize with either the existing product values or empty values for a new product. */
      ...product,
      description: product.description || ""
    } : {
      name: "",
      url: "",
      description: "",
    }
  }) /* importing as our type */

  async function onSubmit(values: z.infer<typeof productDetailsSchema>){
    const action = 
      product == null ? createProduct : updateProduct.bind(null, product.id)
    const data = await action(values)/* link everything togetehr after setting up server side products table, call creat product function and pass along all the values */
    
    if (data?.message){
      toast(data.error ? "Error" : "Success",{ /* sonner toast documentation: `https://sonner.emilkowal.ski/toast */
        description: data.message, /* TODO add variant */
      })
    }
  } /* pass on values that are in the schema */
  return (
    <Form {...form}> {/* hooking up all react schema */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <FormField
                control={form.control} 
                name="name"
                render={( { field })=> (
                    <FormItem>
                        <FormLabel>
                          Product Name
                          <RequiredLabelIcon />
                          </FormLabel>
                        <FormControl><Input placeholder="Required" {...field} /></FormControl> {/* this needs to be a single line */}
                        <FormMessage />
                    </FormItem>
                )} /* variables in productDetailsSchema */
            />{/* comes from shadcn */}
            <FormField /* update the productDetailsSchema at the top as you add more formfield*/
                control={form.control} 
                name="url"
                render={( { field })=> (
                    <FormItem>
                        <FormLabel>
                          Enter you website URL
                          <RequiredLabelIcon />
                        </FormLabel>
                        <FormControl><Input placeholder="Required" {...field} /></FormControl> {/* this needs to be a single line */}
                        <FormDescription>
                            Include the protocol (http/https) and the full path to the sales page
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} /* variables in productDetailsSchema */
            />
            <FormField /* update the productDetailsSchema at the top as you add more formfield*/
                control={form.control} 
                name="description"
                render={( { field })=> (
                    <FormItem>
                        <FormLabel>
                          Product Drscription
                        </FormLabel>
                        <FormControl><Textarea className="min-h-20 resize-none" placeholder="Optional" {...field} /></FormControl> {/* this needs to be a single line */}
                        <FormDescription>
                            An optional description to help distinguish your proiduct from other products
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} /* variables in productDetailsSchema */
            />
            </div>
            <div className="self-end">
                <Button disabled={form.formState.isSubmitting} type="submit">
                    Save
                </Button>
            </div>
        </form>
    </Form>
  )
}