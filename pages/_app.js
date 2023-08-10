import "../style/_globals.scss";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Header from "./Header";
import Footer from "./Footer";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Head>
        <title>Filmemoon</title>
        <meta name="description" content="a better way to watch" />
        <meta
          name="viewport"
          content="idth=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </Head>
      <UserProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </UserProvider>
    </>
  );
}
