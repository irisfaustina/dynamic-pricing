//use Clerk component
//If you only need to export a single value from a module, or if the module represents a main feature of your application, use export default.
//If you need to export multiple values from a module, or if you want to organize your code into smaller, reusable components, use export with named exports.
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage(){
    return <SignUp />
}