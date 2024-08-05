import { Server, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";
import Messages from "../server/src/models/MessageModel";
import Chats from "../server/src/models/ChatModel";

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

  // Emit user status changes to connected clients
  socket.on("userStatusChange", (userStatus) => {
    io.emit("userStatusUpdate", userStatus);
  });

  socket.on("send_message", async (data) => {
    console.log("Send MEssage:", data);
    // const chat = await Chats.create({
    //   User1ID: data.SenderID ? data.SenderID : undefined,
    //   User2ID: data.receiverID ? data.receiverID : undefined,
    //   GroupID: data.GroupID ? data.GroupID : undefined,
    //   CreatedAt: data.SentAt,
    // });

    try {
      let chat;
      if (data.isGroupChat) {
        console.log("IF");
        if (!data.groupID) {
          throw new Error("GroupID is required for group chats");
        }
        chat = await Chats.create({
          User1ID: data.SenderID,
          GroupID: data.groupID,
          // MessageContent: data.Content,
          CreatedAt: data.SentAt,
          // IsDeleted: data.IsDeleted,
          // IsPinned: data.IsPinned,
        });
      } else {
        console.log("ELSE", data.receiverID);
        chat = await Chats.create({
          User1ID: data.SenderID,
          User2ID: data.receiverID, // Ensure this field is populated for direct messages
          // MessageContent: data.Content,
          CreatedAt: data.SentAt,
          // IsDeleted: data.IsDeleted,
          // IsPinned: data.IsPinned,
        });
      }
      const chatID = chat.ChatID;
      await Messages.create({
        ChatID: chatID,
        SenderID: data.SenderID,
        Content: data.Content,
        SentAt: data.SentAt,
        IsDeleted: data.IsDeleted || false,
        IsPinned: data.IsPinned || false,
      });
    } catch (error) {
      console.error("Error creating message:", error);
    }

    // console.log("Chats", Chats.ChatID);

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
