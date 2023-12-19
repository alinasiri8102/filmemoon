import { SignUp } from "@clerk/nextjs";
import { IconMovie } from "@tabler/icons-react";
import Link from "next/link";

const SignInPage = () => (
  <main className="auth fix-width">
    <div className="auth-box">
      <header>
        <Link href="/" className="logo">
          <h1 className="flex-h logo">
            <IconMovie stroke={1} className="pr-color" />
            <span>Filmem</span>
            <span className="pr-color">oo</span>
            <span>n</span>
          </h1>
        </Link>
      </header>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  </main>
);

export default SignInPage;
