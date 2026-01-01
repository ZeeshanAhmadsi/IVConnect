import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import {toast} from "react-hot-toast";

/**
 * Render the homepage with Clerk authentication controls, a user menu, and a button that shows a success toast.
 *
 * Renders a sign-in button (modal) when signed out, a sign-out button when signed in, a persistent user button, and a primary button that triggers a "Success Toast" notification.
 * @returns {JSX.Element} The HomePage React element.
 */
function HomePage() {
  return (
    <div>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Login</button>
        </SignInButton>
      </SignedOut>
      <button className="btn btn-primary"  onClick={()=> toast.success("Success Toast")}>click me</button>
      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton />
    </div>
  );
}

export default HomePage;