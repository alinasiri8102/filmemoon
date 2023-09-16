"use client";
import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import {
  IconMaximize,
  IconMinimize,
  IconCircleCheckFilled,
  IconCopy,
  IconUserPlus,
  IconUserX,
  IconMessages,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconPlayerTrackNextFilled,
  IconDeviceTv,
  IconDeviceTvOff,
  IconBadgeCc,
  IconLoader,
} from "@tabler/icons-react";
import Head from "next/head";

import Loading from "./Loading";
import UserCard from "./UserCard";
import Cartoons from "./Cartoons";

let socket;

export default function Room({ user }) {
  const router = useRouter();
  const roomId = router.query.id;
  const [isMute, setIsMute] = useState();
  const [intracted, setIntracted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [members, setMembers] = useState();
  const [fullscreen, setFullscreen] = useState(false);
  const [MediaUrl, setMediaUrl] = useState();
  const [sub, setSub] = useState();
  const [playing, setPlaying] = useState();
  const [position, setPosition] = useState();
  const player = useRef();
  const source = useRef();
  const track = useRef();
  const playerWindow = useRef();

  const push = async (event, room, user, type, data) => {
    socket.emit(event, room, user, type, data);
  };

  const fullsc = () => {
    if (document.fullscreenElement) {
      setFullscreen(false);
      document.exitFullscreen();
    } else {
      setFullscreen(true);
      playerWindow.current.requestFullscreen();
      document.addEventListener("fullscreenchange", (e) => {
        !document.fullscreenElement &&
          setFullscreen(false) &&
          document.removeEventListener("fullscreenchange", document);
      });
    }
  };

  const onPlay = (e) => {
    !playing &&
      !player.current.seeking &&
      push("info", roomId, user, "play", {
        playing: true,
        position: player.current.currentTime,
      });
  };

  const onPause = (e) => {
    !player.current.seeking &&
      push("info", roomId, user, "pause", {
        playing: false,
        position: player.current.currentTime,
      });
  };

  const onSeeking = (e) => {
    player.current.readyState == 1 &&
      position != player.current.currentTime &&
      push("info", roomId, user, "seek", {
        playing: playing,
        position: player.current.currentTime,
      });
  };

  const onLoad = (e) => {
    position && (player.current.currentTime = position);
    player.current.volume = 0.2;
  };

  const handleMedia = (e) => {
    e.preventDefault();
    const media = e.target.elements.media.value;
    push("info", roomId, user, "media", media);
    e.target.reset();
  };

  const convertSub = (content) =>
    new Promise((converted) => {
      content = content.replace(/(\d+:\d+:\d+)+,(\d+)/g, "$1.$2");
      content = "WEBVTT \n\n" + content;
      converted(content);
    });

  const handleSub = (e) => {
    e.preventDefault();
    const isSub = (name) =>
      name.split(".").pop().toLowerCase() === "srt" || name.split(".").pop().toLowerCase() === "vtt";
    const file = e.target.files[0];
    if (file && isSub(file.name)) {
      const reader = new FileReader();
      reader.onload = function () {
        var text = reader.result;
        convertSub(text).then((file) => {
          push("info", roomId, user, "sub", btoa(unescape(encodeURIComponent(file))));
        });
      };
      reader.readAsText(file);
    }
  };

  const loadSub = (file) => {
    try {
      const sub = decodeURIComponent(escape(atob(file)));
      const url = URL.createObjectURL(new Blob([sub], { type: "text/vtt;charset=utf-8" }));
      setSub(url);
    } catch {
      fetch(file)
        .then((response) => response.text())
        .then((result) => {
          convertSub(result).then((file) => {
            const url = URL.createObjectURL(new Blob([file], { type: "text/vtt;charset=utf-8" }));
            setSub(url);
          });
        });
    }
  };

  const sendReact = (message) => {
    message && push("chat", roomId, user, "icon", message);
  };

  const sendChat = (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;
    message && push("chat", roomId, user, "message", message);
    e.target.reset();
  };

  const copyText = () => {
    navigator.clipboard.writeText(window.location);
    toast("Room URL Copied", { icon: <IconCircleCheckFilled /> });
  };

  const socketInitializer = async () => {
    if (process.env.NEXT_PUBLIC_SOCKET_ENDPOINT) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_ENDPOINT, {
        transports: ["websocket", "polling", "flashsocket"],
      });
    } else {
      await fetch("/api/socket");
      socket = io();
    }

    socket.on("connect", () => {
      user.socketId = socket.id;
      push("join", roomId, user, "join", "join");
    });

    socket.on("join", (joined_user, members) => {
      setMembers(members);
      if (joined_user.socketId == socket.id) {
        toast(`You Joined`, { icon: <IconUserPlus /> });
        setConnected(true);
      } else {
        toast(
          `${joined_user.given_name ? joined_user.given_name + " " + joined_user.family_name : joined_user.nickname}`,
          {
            icon: <IconUserPlus />,
          }
        );
        members[0].socketId == user.socketId &&
          push("info", roomId, user, "new_user", {
            to: joined_user,
            media: source.current?.src,
            playing: !player.current.paused,
            position: player.current?.currentTime,
          });
      }
    });

    socket.on("left", (user, data) => {
      setMembers(data);
      toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
        icon: <IconUserX />,
      });
    });

    socket.on("chat", (user, type, message) => {
      if (type == "icon") {
        toast(user.given_name ? user.given_name + " " + user.family_name : user.nickname, {
          icon: <p>{message} |</p>,
        });
      } else {
        toast(
          <div className="flex-v">
            <small>{`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`}</small>
            <p>{message}</p>
          </div>,
          { icon: <IconMessages /> }
        );
      }
    });

    socket.on("info", (user, type, data) => {
      if (type == "play") {
        toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
          icon: <IconPlayerPlayFilled />,
        });
        setPlaying(true);
        player.current.play();
      } else if (type == "pause") {
        toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
          icon: <IconPlayerPauseFilled />,
        });
        setPlaying(false);
        setPosition(data.position);
        player.current.pause();
        player.current.currentTime = data.position;
      } else if (type == "seek") {
        toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
          icon: <IconPlayerTrackNextFilled />,
        });
        setPosition(data.position);
        player.current.currentTime = data.position;
      } else if (type == "media") {
        setPosition(0);
        setPlaying(false);
        setSub(null);
        if (data) {
          toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
            icon: <IconDeviceTv />,
          });
        } else {
          toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
            icon: <IconDeviceTvOff />,
          });
        }
        setMediaUrl(data);
      } else if (type == "sub") {
        if (data) {
          toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
            icon: <IconBadgeCc />,
          });
        } else {
          toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
            icon: <IconBadgeCc />,
          });
        }
        loadSub(data);
      } else if (type == "fromdb") {
        setPosition(0);
        setPlaying(false);
        setMediaUrl(data.media);
        loadSub(data.sub);
        toast(`${user.given_name ? user.given_name + " " + user.family_name : user.nickname}`, {
          icon: <IconDeviceTv />,
        });
      } else {
        setMediaUrl(data.media);
        loadSub(data.sub);
        setPlaying(data.playing);
        setPosition(data.position);
      }
    });
  };

  useEffect(() => {
    setIsMute(
      navigator.appVersion.indexOf("like Mac") != -1 ||
        (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1)
    );
    if (intracted) {
      socketInitializer();
      window.onbeforeunload = function (e) {
        socket.disconnect();
      };
    }
    return () => {
      intracted && socket.disconnect();
    };
  }, [intracted]);

  const emojies = ["😂", "🥺", "😋", "😭", "🤭", "😍", "🤬", "🤮", "🥱", "🤯", "👎", "💦", "❤️", "💔", "💩"];

  return (
    <>
      <Head>
        <title>Filmemoon | WatchParty</title>
        <meta name="description" content={`Room "${roomId}" - Join here and enjoy more :)`} />
      </Head>
      <main className="roomPage fix-width" ref={playerWindow}>
        <Toaster
          containerStyle={{
            zIndex: 2147483647343214,
            top: fullscreen ? 50 : 20,
          }}
          toastOptions={{
            style: {
              background: fullscreen ? "#a4042fcc" : "#a6042e",
              color: "#f4f3eeff",
              fontSize: ".8em",
            },
          }}
        />
        {!connected ? (
          <div className="loading flex-v">
            <Loading fun={() => setIntracted(true)} />
            <div className="head flex-v">
              <p>
                for the best exprience use Chrome.
                <br />
                recpect the cinema and try not to use your phone to watch movies.
                <br />
                note that ios and macOS does not support mkv and your low power mode must be turned off.
              </p>
              <button className="btn btn-pr connect-btn" disabled={intracted} onClick={() => setIntracted(true)}>
                {!intracted ? (
                  "continue"
                ) : (
                  <>
                    connecting <IconLoader className="rotating" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid">
              <div className={`player-wrapper ${fullscreen && "fullscreen"}`}>
                <div>
                  <video
                    ref={player}
                    key={MediaUrl}
                    id="video"
                    poster="/img/poster.svg"
                    muted={isMute}
                    controls={true}
                    playsInline={true}
                    autoPlay={playing}
                    onPlay={onPlay}
                    onPause={onPause}
                    onSeeking={onSeeking}
                    onLoadedData={onLoad}
                  >
                    <source ref={source} src={MediaUrl} type="video/mp4" />
                    {sub && <track ref={track} kind="subtitles" src={sub} srcLang=":)" label="sub" default />}
                  </video>

                  <div className="reactions flex-h">
                    <div className="emojies flex-h">
                      {emojies.map((emoji, index) => (
                        <button className="emoji" key={index} onClick={() => sendReact(emoji)}>
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="right flex-h">
                      <form className="chat" onSubmit={sendChat} autoComplete="off">
                        <input type="text" name="message" placeholder="type and push enter ..." />
                      </form>

                      <button
                        className="btn fullscreen-btn"
                        onClick={() => {
                          fullsc();
                        }}
                      >
                        {fullscreen ? <IconMinimize /> : <IconMaximize />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form flex-h">
                  <form className="flex-h media" onSubmit={handleMedia}>
                    <input id="media" type="text" placeholder="Media URL" autoComplete="off" />
                    <input className="btn" type="submit" value="open" />
                  </form>

                  <form className="flex-h sub">
                    <input
                      id="subtitle"
                      type="file"
                      text="upload"
                      title=" sdbk "
                      onChange={handleSub}
                      multiple={false}
                      name="theFiles"
                      placeholder="Upload"
                    />
                    <label className="btn" htmlFor="subtitle">
                      subtitle
                    </label>
                  </form>
                </div>
              </div>
              <Cartoons user={user} roomId={roomId} push={push} convertSub={convertSub} />
            </div>

            <div className="members">
              <div className="head flex-v">
                <div className="flex-h">
                  <h1>
                    Members<span className="count flex-v">{members?.length}</span>
                  </h1>
                </div>
                <div className="share flex-h">
                  <p>Share Your Room "{roomId}"</p>
                  <button className="btn" onClick={() => copyText()}>
                    <IconCopy />
                  </button>
                </div>
              </div>
              <div className="members-list">
                {members?.map((user, index) => (
                  <UserCard key={index} user={user} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired();
