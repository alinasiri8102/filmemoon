"use client";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import generateUniqueId from "generate-unique-id";

import { IconSquareRoundedPlusFilled, IconDoorEnter, IconFidgetSpinner } from "@tabler/icons-react";
export default function Home() {
  const router = useRouter();
  const { user } = useUser();
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
            Virtual movie night with your partner, friends, family, or colleagues? We've got you covered! Gather as many
            people as you like!
          </p>
        </div>
        <div className="join-room flex-v">
          {!user && <p className="alert">Please Login To Continue</p>}
          <div className="btns flex-h">
            <button
              className="btn btn-pr"
              disabled={!user ? true : false}
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
              <input type="text" onChange={(e) => setInput(e.target.value)} placeholder="Enter Room Id" />
              <button className="btn btn-pr" type="submit" disabled={(!user ? true : false) || input.length < 6}>
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
