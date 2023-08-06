"use client";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect, useRef } from "react";
import generateUniqueId from "generate-unique-id";
import io from "socket.io-client";
import {
  IconSquareRoundedPlusFilled,
  IconDoorEnter,
  IconExclamationCircle,
} from "@tabler/icons-react";
let socket;
export default function Home() {
  const inputRef = useRef();
  const router = useRouter();
  const { user } = useUser();
  const [err, setErr] = useState(null);

  const handelCreateRoom = async () => {
    setErr(null);
    const id = generateUniqueId({ length: 6 });
    socket.emit("check-room", id, "create");
  };
  const handelJoinRoom = async (e) => {
    e.preventDefault();
    setErr(null);
    const id = inputRef.current.value;
    id && socket.emit("check-room", id, "join");
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    await fetch(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT || "/api/socket");
    socket = io();

    socket.on("check-room", (valid, id, action) => {
      if (action == "create") {
        !valid
          ? router.push(`/room/${id}`)
          : setErr("something very strange happened, please try again");
      } else {
        valid
          ? router.push(`/room/${id}`)
          : setErr("this room does not exists");
      }
    });
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
            <span>|</span>
            <form className="join-section flex-h" onSubmit={handelJoinRoom}>
              <input type="text" ref={inputRef} placeholder="Enter Room Id" />
              <button
                className="btn btn-pr"
                type="submit"
                disabled={!user ? true : false}
              >
                Join <IconDoorEnter />
              </button>
            </form>
          </div>
          {err && (
            <div className="alert flex-h">
              <IconExclamationCircle />
              <p>{err}</p>
            </div>
          )}
        </div>
      </div>

      <div className="vector">
        <img src="./img/vector.svg" />
      </div>
    </main>
  );
}
