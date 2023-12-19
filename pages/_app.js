import "../style/_globals.scss";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./Header";
import Footer from "./Footer";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Head from "next/head";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"], adjustFontFallback: false });
const vazirmtn = localFont({ src: "../public/fonts/Vazirmatn[wght].woff2" });

export default function App({ Component, pageProps }) {
  const noLayout = ["sign-in", "sign-up"];
  const router = useRouter();

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily}, ${vazirmtn.style.fontFamily};
        }
      `}</style>
      <Head>
        <title>Filmemoon</title>
        <meta name="description" content="a better way to watch" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </Head>
      <ClerkProvider
        {...pageProps}
        appearance={{
          variables: {
            colorPrimary: "#a6042e",
            colorText: "#f4f3eeff",
            colorBackground: "#14141f",
            colorAlphaShade: "#f4f3eeff",
          },
        }}
      >
        {!noLayout.includes(router.pathname.split("/")[1]) && <Header />}
        <Component {...pageProps} />
        {!noLayout.includes(router.pathname.split("/")[1]) && <Footer />}
      </ClerkProvider>
    </>
  );
}
