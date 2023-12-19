import { IconLogin, IconMovie } from "@tabler/icons-react";
import Link from "next/link";
import { SignInButton, SignedIn, UserButton, SignedOut } from "@clerk/nextjs";
function Header() {
  return (
    <header className="fix-width flex-h">
      <Link href="/" className="logo">
        <h1 className="flex-h">
          <IconMovie stroke={1} className="pr-color" />
          <span>Filmem</span>
          <span className="pr-color">oo</span>
          <span>n</span>
        </h1>
      </Link>

      <div className="profile flex-h">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-white">
              <IconLogin size={22} />
              Login
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}

export default Header;
