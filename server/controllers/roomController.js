import Room from "../models/Room.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

import generateRoomId from "../utils/generateRoomId.js";

const DEFAULT_FILES = {
  javascript: [
    {
      name: "index.js",
      path: "src/index.js",
      language: "javascript",
      content:
        'console.log("Welcome to CodeSync!");\n',
    },
  ],

  typescript: [
    {
      name: "index.ts",
      path: "src/index.ts",
      language: "typescript",
      content:
        'const message: string = "Welcome to CodeSync!";\nconsole.log(message);\n',
    },
  ],

  python: [
    {
      name: "main.py",
      path: "src/main.py",
      language: "python",
      content:
        'print("Welcome to CodeSync!")\n',
    },
  ],

  java: [
    {
      name: "Main.java",
      path: "src/Main.java",
      language: "java",
      content:
        'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to CodeSync!");\n    }\n}\n',
    },
  ],

  html: [
    {
      name: "index.html",
      path: "src/index.html",
      language: "html",
      content:
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>CodeSync</title>\n</head>\n<body>\n    <h1>Welcome to CodeSync!</h1>\n</body>\n</html>\n',
    },
  ],

  css: [
    {
      name: "style.css",
      path: "src/style.css",
      language: "css",
      content:
        "body {\n    margin: 0;\n    font-family: sans-serif;\n}\n",
    },
  ],

  json: [
    {
      name: "data.json",
      path: "src/data.json",
      language: "json",
      content:
        '{\n  "message": "Welcome to CodeSync!"\n}\n',
    },
  ],

  markdown: [
    {
      name: "README.md",
      path: "README.md",
      language: "markdown",
      content:
        "# CodeSync\n\nWelcome to your collaborative workspace.\n",
    },
  ],
};

const getDefaultFiles = (language) => {
  return (
    DEFAULT_FILES[language] ||
    DEFAULT_FILES.javascript
  );
};

export const createRoom = async (req, res) => {
  try {
    const { name, description = "", language = "javascript" } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const allowedLanguages = [
      "javascript",
      "typescript",
      "python",
      "java",
      "html",
      "css",
      "json",
      "markdown",
    ];

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported programming language",
      });
    }

    let roomId;
    let existingRoom;

    do {
      roomId = generateRoomId();

      existingRoom = await Room.findOne({
        roomId,
      });
    } while (existingRoom);

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      owner: req.user._id,
      defaultLanguage: language,
      files: getDefaultFiles(language),
    });

    const room = await Room.create({
      roomId,
      name: name.trim(),
      description: description.trim(),
      owner: req.user._id,
      language,
      project: project._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        rooms: room._id,
      },
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("owner", "name email avatar")
      .populate("project", "name description defaultLanguage files")
      .populate("members.user", "name email avatar");

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("Create room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create room",
    });
  }
};

export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("owner", "name email avatar")
      .populate("project", "name description defaultLanguage")
      .populate("members.user", "name email avatar")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch rooms",
    });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId,
    })
      .populate("owner", "name email avatar")
      .populate("project")
      .populate("members.user", "name email avatar");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const isMember = room.members.some(
      (member) =>
        String(member.user._id) === String(req.user._id)
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch room",
    });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        success: false,
        message: "This room is no longer active",
      });
    }

    const alreadyMember = room.members.some(
      (member) =>
        String(member.user) === String(req.user._id)
    );

    if (alreadyMember) {
      const populatedRoom = await Room.findById(room._id)
        .populate("owner", "name email avatar")
        .populate("project")
        .populate("members.user", "name email avatar");

      return res.status(200).json({
        success: true,
        message: "You are already a member of this room",
        room: populatedRoom,
      });
    }

    room.members.push({
      user: req.user._id,
      role: "member",
    });

    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        rooms: room._id,
      },
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("owner", "name email avatar")
      .populate("project")
      .populate("members.user", "name email avatar");

    return res.status(200).json({
      success: true,
      message: "Joined room successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("Join room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to join room",
    });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (String(room.owner) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message:
          "The room owner cannot leave the room. Delete or transfer the room instead.",
      });
    }

    const isMember = room.members.some(
      (member) =>
        String(member.user) === String(req.user._id)
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    room.members = room.members.filter(
      (member) =>
        String(member.user) !== String(req.user._id)
    );

    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        rooms: room._id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Left room successfully",
    });
  } catch (error) {
    console.error("Leave room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to leave room",
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (String(room.owner) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only the room owner can delete this room",
      });
    }

    if (room.project) {
      await Project.findByIdAndDelete(room.project);
    }

    await Room.findByIdAndDelete(room._id);

    await User.updateMany(
      {
        rooms: room._id,
      },
      {
        $pull: {
          rooms: room._id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete room",
    });
  }
};