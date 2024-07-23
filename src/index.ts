import { Server, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";
import Messages from "../../server/src/models/MessageModel";
import Chats from "../../server/src/models/ChatModels";

const app = express();
app.use(cors());
const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected:,${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", async (data) => {
    console.log("Send MEssage:", data);
    await Chats.create({
      // ChatID: data.ChatID,
      User1ID: data.SenderID,
      User2ID: data.receiverID,
      GroupID: 1,
      CreatedAt: data.SentAt,
    });
    await Messages.create(data);

    // if (data.room) {
    //   // Notify the recipient
    io.emit("receive_message", data);
    // } else {
    //   console.error("No recipient specified in the data:", data);
    // }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(5000, () => {
  console.log(`Socket.io server is running on http://localhost:${PORT}`);
});
