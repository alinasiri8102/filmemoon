import { Html, Head, Main, NextScript } from "next/document";

export const metadata = {
  title: "Filmame",
  description: "a better way to watch",
  viewport: "idth=device-width, initial-scale=1.0, viewport-fit=cover",
};

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
