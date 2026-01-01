import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import {toast} from "react-hot-toast";

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
