import { Server, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";
import Messages from "../server/src/models/MessageModel";
import Chats from "../server/src/models/ChatModel";
import Files from "../server/src/models/FileModel";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies
const PORT = 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  // Emit user status changes to connected clients
  socket.on("userStatusChange", (userStatus) => {
    io.emit("userStatusUpdate", userStatus);
  });

  socket.on("send_message", async (data) => {
    console.log("Send Message:", data);
    const { fileBlob, filename, filetype, filesize, MessageID } =
      data.file || {};
    let messageid: any;
    let message: any;
    try {
      let chat;
      if (data.isGroupChat) {
        if (!data.groupID) {
          throw new Error("GroupID is required for group chats");
        }
        chat = await Chats.create({
          User1ID: data.SenderID,
          GroupID: data.groupID,
          CreatedAt: data.SentAt,
        });
      } else {
        chat = await Chats.create({
          User1ID: data.SenderID,
          User2ID: data.receiverID,
          CreatedAt: data.SentAt,
        });
      }
      const chatID = chat.ChatID;

      message = await Messages.create({
        ChatID: chatID,
        SenderID: data.SenderID,
        Content: data.Content,
        SentAt: data.SentAt,
        IsDeleted: data.IsDeleted || false,
        IsPinned: data.IsPinned || false,
      });
      messageid = message.MessageID;
      io.emit("receive_message", {
        ...data,
        MessageID: message.MessageID,
      });
      // Emit the message with file information if applicable
    } catch (error) {
      console.error("Error creating message:", error);
    }

    if (filename && fileBlob) {
      // Handle file upload
      try {
        const fileContent = Buffer.from(fileBlob, "base64");
        const publicDirectory = path.join(__dirname, "public");

        // Ensure the directory exists
        if (!fs.existsSync(publicDirectory)) {
          fs.mkdirSync(publicDirectory, { recursive: true });
        }

        // Define file path and save file
        const filePath = path.join(publicDirectory, filename);
        fs.writeFileSync(filePath, fileContent);

        // Save file info to database
        await Files.create({
          MessageID: parseInt(messageid, 10),
          FileName: filename,
          FileType: filetype,
          FileSize: filesize,
          FileContent: fileContent,
          UploadedAt: new Date(),
        });
        io.emit("receive_message", {
          ...data,
          MessageID: message.MessageID,
        });
        // console.log("...data", ...data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server is running on http://localhost:${PORT}`);
});
