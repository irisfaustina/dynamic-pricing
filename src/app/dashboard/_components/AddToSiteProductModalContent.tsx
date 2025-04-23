"use client"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { env } from "@/data/env/client"
import { CopyCheckIcon, CopyIcon, CopyXIcon } from "lucide-react"
import { useState } from "react"

type CopyState = "idle" | "copied" | "error" /* define copystate selector to return text and icons */

export function AddToSiteProductModalContent({id}:{id: string}){
    //add public server url (3000 for testing) to data/env/client and to env files
    const [copyState, setCopyState] = useState<CopyState>("idle") /* use state in the copystate type which by default is idle */
    const code = `<script src="${env.NEXT_PUBLIC_SERVER_URL}/api/products/${id}/banner"></script>`/* url that points to an api endpoint that users put in their site to generate some javascript for them */
    const Icon = getCopyIcon(copyState)
    
    return (
        <DialogContent className="max-w-max">
            <DialogHeader>
                <DialogTitle className="text-2xl">Start Earning PPP Sales!</DialogTitle>
                <DialogDescription>
                    All you need to do is copy the script below to your website and your customers will start seeing PPP discounts:
                </DialogDescription>
            </DialogHeader>
            <pre className="mb-4 overflow-x-auto p-4 bg-secondary rounded max-w-screen-xl text-secondary-foreground"> {/* call our api so we load their banner for them */}
                <code>{code}</code>
            </pre>
            <div className="flex gap-2">
        <Button
          onClick={() => {
            navigator.clipboard
              .writeText(code) /* copy the code to clipboard */
              .then(() => {
                setCopyState("copied") /* set the copy state to copied if successful */
                setTimeout(() => setCopyState("idle"), 2000) /* after 2 seconds set the copy state to idle */
              })
              .catch(() => {
                setCopyState("error") /* set the copy state to error if there was an error */
                setTimeout(() => setCopyState("idle"), 2000) /* after 2 seconds set the copy state to idle */
              })
          }}
        >
          {<Icon className="size-4 mr-2" />}
          {getChildren(copyState)} {/* get text and icon rendered to user */}
        </Button>
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </div>
        </DialogContent>
    )
}

function getCopyIcon(copyState: CopyState) {
    switch (copyState) {
      case "idle":
        return CopyIcon
      case "copied":
        return CopyCheckIcon
      case "error":
        return CopyXIcon
    }
  }
  
  function getChildren(copyState: CopyState) { /* take in the copy state and return the text and icon */
    switch (copyState) {
      case "idle":
        return "Copy Code"
      case "copied":
        return "Copied!"
      case "error":
        return "Error"
    }
  }