const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

//New imports
const http = require("http").Server(app);
const cors = require("cors");
const socketIO = require("socket.io")(http, {
  cors: {
    origin: process.env.CLIENT || "/",
  },
});

app.use(cors());

socketIO.on("connection", (socket) => {
  socket.on("join", async (room, user) => {
    socket.join(room);
    socket.user = user;
    socket.room = room;
    const theRoom = io.sockets.adapter.rooms.get(room);
    if (theRoom.size == 1) {
      theRoom.members = [];
      theRoom.sub = undefined;
    }
    theRoom.members.push(user);
    io.to(room).emit("join", user, theRoom.members);
  });

  socket.on("disconnecting", () => {
    const theRoom = io.sockets.adapter.rooms.get(socket.room);
    if (theRoom) {
      theRoom.members = theRoom.members.filter(
        (obj) => obj.socketId != socket.id
      );
      io.to(socket.room).emit("left", socket.user, theRoom.members);
    }
    socket.leave(socket.room);
  });

  socket.on("chat", (room, user, type, message) => {
    io.to(room).emit("chat", user, type, message);
  });

  socket.on("info", (room, user, type, data) => {
    const theRoom = io.sockets.adapter.rooms.get(room);
    if (type == "new_user") {
      data.sub = theRoom.sub;
      socket.to(data.to.socketId).emit("info", user, "new_user", data);
    } else {
      if (type == "sub") {
        theRoom.sub = data;
      }
      io.to(room).emit("info", user, type, data);
    }
  });

  socket.on("check-room", (id, action) => {
    if (io.sockets.adapter.rooms.has(id)) {
      socket.emit("check-room", true, id, action);
    } else {
      socket.emit("check-room", false, id, action);
    }
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "What are you doing here",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
