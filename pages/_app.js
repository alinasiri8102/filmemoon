import "../style/_globals.scss";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <UserProvider>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </UserProvider>
    </>
  );
}
