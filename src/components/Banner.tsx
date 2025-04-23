import { env } from "@/data/env/client"

export function Banner({
  message,
  mappings,
  customization,
  canRemoveBranding,
}: {
  canRemoveBranding: boolean
  message: string
  mappings: {
    coupon: string
    discount: string
    country: string
  }
  customization: {
    backgroundColor: string
    textColor: string
    fontSize: string
    isSticky: boolean
    classPrefix?: string | null
  }
}) {
  const prefix = customization.classPrefix ?? "" 
  const mappedMessage = Object.entries(mappings).reduce( /* converting mappings object to an array and reduce array to a real message */
    (mappedMessage, [key, value]) => { /* mapped message */
      return mappedMessage.replace(new RegExp(`{${key}}`, "g"), value) /* replace anything wrapped by brackets with the real dynamic values, pass global flag */
    },
    message.replace(/'/g, "&#39;") /* replace coupon dis country with real life valuesingle quote with double quote */
  )

  return ( /* wxact component to render and send down to other people's website */
    <>
      <style type="text/css">
        {`
          .${prefix}easy-ppp-container {
            all: revert; /* reverting all the styles so its' default */
            display: flex;
            flex-direction: column; /* stacksvertically */
            gap: .5em;
            background-color: ${customization.backgroundColor};
            color: ${customization.textColor};
            font-size: ${customization.fontSize}; /* ensure customization */
            font-family: inherit; 
            padding: 1rem;
            ${customization.isSticky ? "position: sticky;" : ""}
            left: 0;
            right: 0;
            top: 0;
            text-wrap: balance;
            text-align: center;
          }

          .${prefix}easy-ppp-branding {
            color: inherit;
            font-size: inherit;
            display: inline-block;
            text-decoration: underline; /* let's user know this is a link */
          }
        `}
      </style>

      <div className={`${prefix}easy-ppp-container ${prefix}easy-ppp-override`}> {/* override class */}
        <span
          className={`${prefix}easy-ppp-message ${prefix}easy-ppp-override`}
          dangerouslySetInnerHTML={{ /* dangerouslySetInnerHTML is a security feature that allows you to inject HTML into a component */
            __html: mappedMessage,
          }}
        />
        {!canRemoveBranding && (
          <a /* direct back to your website */
            className={`${prefix}easy-ppp-branding`}
            href={`${env.NEXT_PUBLIC_SERVER_URL}`}
          >
            Powered by Easy PPP
          </a>
        )}
      </div>
    </>
  )
}