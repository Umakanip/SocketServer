import { Server, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import express from "express";
import Messages from "../server/src/models/MessageModel";
import Chats from "../server/src/models/ChatModel";
import Files from "../server/src/models/FileModel";
import fs from "fs";
import path from "path";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const app = express();
app.use(cors());
app.use(express.json()); // Add this to parse JSON bodies
const PORT = 5000;

const APP_ID: string =
  process.env.AGORA_APP_ID || "1369151da2df4f33bdd842b8c0797085";
const APP_CERTIFICATE: string =
  process.env.AGORA_APP_CERTIFICATE || "bce706ad36204216ad8aee3f48dc84b0";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

interface UserSocketMap {
  [userId: string]: string;
}

const userSocketMap: UserSocketMap = {};

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

  socket.on("register", (userId: string) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
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
        console.log("if");
        if (!data.groupID) {
          throw new Error("GroupID is required for group chats");
        }
        chat = await Chats.create({
          User1ID: data.SenderID,
          GroupID: data.groupID,
          CreatedAt: data.SentAt,
        });
      } else {
        console.log("else");
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

  socket.on(
    "callUsers",
    async (data: {
      channelName: string;
      callerId: number;
      receiverIds: number[];
    }) => {
      console.log("---callUsers----", data);

      const token: string = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        data.channelName,
        0,
        RtcRole.SUBSCRIBER,
        Math.floor(Date.now() / 1000) + 36000
      );
      console.log("----token-----", token);
      console.log("receiverIds", data.receiverIds);

      data.receiverIds.forEach((receiverId) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("incomingCall", {
            channelName: data.channelName,
            token,
            callerId: data.callerId,
          });
          console.log("Emitting incomingCall to", receiverSocketId);
        } else {
          console.log(`No socket found for receiver ${receiverId}`);
        }
      });
    }
  );

  socket.on(
    "callAccepted",
    (data: { channelName: string; callerId: number }) => {
      const { channelName, callerId } = data;
      const callerSocketId = userSocketMap[callerId];
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", { channelName });
        console.log(`Call accepted by ${callerId}`);
      } else {
        console.log(`No socket found for caller ${callerId}`);
      }
    }
  );

  socket.on(
    "callRejected",
    (data: { channelName: string; callerId: number }) => {
      const { channelName, callerId } = data;
      console.log("---callRejected---", data);
      const callerSocketId = userSocketMap[callerId];
      if (callerSocketId) {
        io.to(callerSocketId).emit("callRejected", { channelName });
        console.log(`Call rejected by ${callerId}`);
      } else {
        console.log(`No socket found for caller ${callerId}`);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io server is running on http://localhost:${PORT}`);
});
