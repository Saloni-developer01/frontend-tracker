import { SignedIn, SignedOut, SignUpButton, SignInButton } from "@clerk/clerk-react"
import { Navigate } from "react-router-dom"

export const Auth = () => {
    return (
    <div className="sign-in-container">
        <SignedOut>
            <h1> Welcome to Your Own Personal Finance Tracker!</h1>
            <SignUpButton mode="modal" forceRedirectUrl='/'/>
            <SignInButton mode="modal" forceRedirectUrl='/'/>
        </SignedOut>
        <SignedIn>
            <Navigate to="/"/>
        </SignedIn>
    </div>
    )
}