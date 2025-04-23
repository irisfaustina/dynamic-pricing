"use client"

import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteProduct } from "@/server/actions/products";
import { useTransition } from "react";
import { toast } from "sonner"

export function DeleteProductAlertDialogContent({id}:{
    id: string}){ /* we know it's taking in the id and the id is a string */
    const [isDeletePending, startDeleteTransition] = useTransition() /* call code from our client on the ther server to get a pending statetransition hook */
    //TODO add toast to handle errors
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this product and remove your data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => 
                    startDeleteTransition(async() => { /* get loading state */
                    const data = await deleteProduct(id) /* go to server and create delete product */
                    if (data?.message){
                        toast(data.error ? "Error" : "Success",{ /* sonner toast documentation: https://sonner.emilkowal.ski/toast */
                          description: data.message, /* TODO add variant */
                        })
                      }
                })} disabled={isDeletePending}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )

}