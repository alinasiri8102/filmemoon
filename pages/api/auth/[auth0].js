import { initAuth0 } from "@auth0/nextjs-auth0";

// export default handleAuth();

export const initializeAuth0 = (req) => {
  return initAuth0({
    baseURL: req.headers.origin || `${process.env.NODE_ENV === "development" ? "http" : "https"}://${req.headers.host}`,
  });
};
export default function auth(req, res) {
  const auth0 = initializeAuth0(req);
  return auth0.handleAuth()(req, res);
}
