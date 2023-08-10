"use client";
import { IconLogin, IconLogout2 } from "@tabler/icons-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { IconMovie } from "@tabler/icons-react";
function Header() {
  const { user, error, isLoading } = useUser();

  return (
    <header className="fix-width flex-h">
      <Link href="/" className="logo">
        <h1 className="flex-h">
          <IconMovie />
          <span>Filmem</span>
          <span className="pr-color">oo</span>
          <span>n</span>
        </h1>
      </Link>

      {!isLoading && (
        <div className="profile flex-h">
          {user ? (
            <>
              <a href="/api/auth/logout">
                <IconLogout2 />
              </a>
              <p className="name">{user.name || user.email}</p>
              <img src={user.picture} alt="" />
            </>
          ) : (
            <a className="btn btn-white" href="/api/auth/login">
              <IconLogin />
              Login
            </a>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
