import { useRouter } from "next/router";
import { useState } from "react";
import generateUniqueId from "generate-unique-id";
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";

import {
  IconSquareRoundedPlusFilled,
  IconDoorEnter,
  IconFidgetSpinner,
} from "@tabler/icons-react";

export default function Home({ isSignedIn }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handelCreateRoom = async () => {
    setLoading(true);
    const id = generateUniqueId({ length: 6 });
    router.push(`/room/${id}`);
  };
  const handelJoinRoom = async (e) => {
    setLoading(true);
    e.preventDefault();
    const id = input;
    router.push(`/room/${id}`);
  };

  return (
    <main className="homePage fix-width flex-h">
      <div className="wrapper flex-v">
        <div className="head">
          <h1>A Better Way To Watch</h1>
          <p>
            Virtual movie night with your partner, friends, family, or
            colleagues? We've got you covered! Gather as many people as you
            like!
          </p>
        </div>
        <div className="join-room flex-v">
          {!isSignedIn && <p className="alert">Please Login To Continue</p>}
          <div className="btns flex-h">
            <button
              className="btn btn-pr"
              disabled={!isSignedIn ? true : false || loading}
              onClick={() => {
                handelCreateRoom();
              }}
            >
              Create Room <IconSquareRoundedPlusFilled />
            </button>

            <span className="spinner">
              <IconFidgetSpinner className={loading ? "rotating" : ""} />
            </span>
            <form className="join-section flex-h" onSubmit={handelJoinRoom}>
              <input
                type="text"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter Room Id"
              />
              <button
                className="btn btn-pr"
                type="submit"
                disabled={
                  (!isSignedIn ? true : false) || input.length < 6 || loading
                }
              >
                Join <IconDoorEnter />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="vector">
        <img src="/img/vector.svg" />
      </div>
    </main>
  );
}

export const getServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  if (userId) {
    // Load any data your application needs for the page using the userId
    return { props: { ...buildClerkProps(ctx.req), isSignedIn: true } };
  }
  return { props: { isSignedIn: false } };
};
