//make sure layout fills the fulthing and centers
//then we need to tell Clerk we created brand new sign in pages
//go to .env
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}){
    return (
        <div className="min-h-screen flex flex-col justify-center items-center">
            {children}
        </div>
    )

}