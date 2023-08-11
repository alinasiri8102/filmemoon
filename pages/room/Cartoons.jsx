import React, { useState, useEffect } from "react";
import db from "@/public/db.json";
import { IconPlayerPlay, IconPlayerPlayFilled, IconPlayerTrackPrev, IconSelector } from "@tabler/icons-react";
import { IconPlayerTrackNext } from "@tabler/icons-react";

const Cartoons = ({ user, roomId, push, convertSub }) => {
  const [openCartoon, setOpenCartoon] = useState();
  const [openSeason, setOpenSeason] = useState();

  const [history, setHistory] = useState([]);

  const { cartoons } = db;

  const setLocalHistory = (cartoon, season, episode) => {
    const newData = {
      name: cartoon,
      season: season,
      episode: episode,
    };
    const upsert = (array, item) => {
      const i = array.findIndex((_item) => _item.name === item.name);
      if (i > -1) {
        let result = array.filter((obj) => obj.name !== item.name);
        return [...result, item];
      } else {
        return [...array, item];
      }
    };
    const newHistory = upsert(history, newData);
    setHistory([...newHistory]);
    localStorage.setItem("filmemoon", JSON.stringify(newHistory));
  };

  const handlePlay = (cartoon, season, episode) => {
    setLocalHistory(cartoon, season, episode);
    const playCartoon = cartoons.find((c) => c.name == cartoon).seasons[season].episodes[episode];

    push("info", roomId, user, "fromdb", {
      media: playCartoon.url,
      sub: playCartoon.sub,
    });
  };

  useEffect(() => {
    const storage = localStorage.getItem("filmemoon") ? JSON.parse(localStorage.getItem("filmemoon")) : [];
    setHistory(storage);
  }, []);

  const cartoonHead = (cartoon) => {
    const currentH = history.find((c) => c.name == cartoon.name) || { name: cartoon.name, season: 0, episode: 0 };
    const seasons = cartoon.seasons;
    const episodes = cartoon.seasons[currentH.season]?.episodes;

    const getEpisode = (num) => {
      if (episodes && episodes[currentH.episode + num]) {
        return { name: currentH.name, season: currentH.season, episode: currentH.episode + num };
      } else {
        if (seasons[currentH.season + num]) {
          return {
            name: currentH.name,
            season: currentH.season + num,
            episode: num == 1 ? 0 : seasons[currentH.season - 1].episodes.length - 1,
          };
        } else {
          return null;
        }
      }
    };

    const nextEpisode = getEpisode(1);
    const prevEpisode = getEpisode(-1);

    return (
      <div className="cartoon-head head">
        <h5>{cartoon.name}</h5>
        <div className="overlay"></div>
        <img src={cartoon.poster} alt="" />
        <div
          className="info flex-h"
          onClick={() => {
            setOpenSeason(null);
            setOpenCartoon(openCartoon == cartoon.name ? null : cartoon.name);
          }}
        >
          <small>
            S{currentH.season + 1} | E{currentH.episode + 1}
          </small>
          <IconSelector size={16} />
        </div>
        <div className="actions flex-h">
          <button
            disabled={!prevEpisode}
            onClick={() => nextEpisode && handlePlay(prevEpisode.name, prevEpisode.season, prevEpisode.episode)}
          >
            <IconPlayerTrackPrev size={16} />
          </button>
          <button onClick={() => handlePlay(cartoon.name, currentH.season, currentH.episode)}>
            <IconPlayerPlayFilled size={18} />
          </button>
          <button
            disabled={!nextEpisode}
            onClick={() => nextEpisode && handlePlay(nextEpisode.name, nextEpisode.season, nextEpisode.episode)}
          >
            <IconPlayerTrackNext size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="cartoons flex-v">
      {cartoons.map((cartoon, cIndex) => (
        <div className={`cartoon ${cartoon.name == openCartoon && "open-cartoon"}`} key={cIndex}>
          {cartoonHead(cartoon)}

          <div className="seasons flex-v">
            {cartoon.seasons.map((season, sIndex) => (
              <div key={sIndex} className={`season ${sIndex == openSeason && "open-season"}`}>
                <div
                  className="season-head head flex-h"
                  onClick={() => {
                    setOpenSeason(openSeason == sIndex ? null : sIndex);
                  }}
                >
                  <h5>Season {sIndex + 1}</h5>
                  <h6>{season.year && season.year}</h6>
                </div>

                <div className="episodes flex-v">
                  {season.episodes.map((episode, eIndex) => (
                    <div key={eIndex} className="episode" onClick={() => handlePlay(cartoon.name, sIndex, eIndex)}>
                      <div className="episode-head head flex-h">
                        <h6>Episode {eIndex + 1}</h6>
                        <IconPlayerPlay size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cartoons;
