// "/dashboard" is the index to dashboard page
import { getProducts } from "@/server/db/products"
import { auth } from "@clerk/nextjs/server"
import { NoProducts } from "./_components/NoProducts"
import Link from "next/link"
import { ArrowRightIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "./_components/ProductGrid"

export default async function DashboardPage(){ /* for page limit how many things we get back */
    const { userId, redirectToSignIn } =  await auth() 
    if (!userId) return redirectToSignIn()
        
    const products = await getProducts(userId, { limit: 6 })
    if (products.length === 0) return <NoProducts />

    return (<>
        <h2 className="mb-6 text-3xl font-semibold flex justify-between">
            <Link 
                className="group flex gap-2 items-center hover:underline" 
                href="/dashboard/products"
            > {/* render out analytics and products so we can go back and forth */}
                 Product
                 <ArrowRightIcon className="transition-transform group-hover:translate-x-1" /> {/* move arrow slightly to the right on hover */}
            </Link>
            <Button asChild>
                <Link href="/dashboard/products/new">
                <PlusIcon className="size-4 mr-2" /> {/* add icon */}
                New Product</Link>
            </Button>
            </h2>
            <ProductGrid products={products} />
        </>

    )
}