import { SignIn } from "@clerk/nextjs";
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
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  </main>
);

export default SignInPage;
