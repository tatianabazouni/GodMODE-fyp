import Connection from "../models/Connection.js";
import User from "../models/User.js";

const mapConnection = (connection, me) => {
  const isSender = String(connection.sender?._id || connection.sender) === String(me);
  const other = isSender ? connection.receiver : connection.sender;

  let status = "accepted";
  if (connection.status === "pending") {
    status = isSender ? "pending_sent" : "pending_received";
  }

  return {
    id: connection._id,
    name: other?.name || "Unknown",
    email: other?.email || "",
    type: connection.type || "friend",
    status,
  };
};

export const listConnections = async (req, res) => {
  const connections = await Connection.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
  })
    .populate("sender", "name email")
    .populate("receiver", "name email")
    .sort({ createdAt: -1 });

  res.json(connections.map((connection) => mapConnection(connection, req.user._id)));
};

export const searchUsers = async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) {
    return res.json([]);
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  })
    .limit(20)
    .select("name email");

  res.json(users.map((user) => ({ id: user._id, name: user.name, email: user.email })));
};

export const requestConnection = async (req, res) => {
  const { userId, type = "friend" } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (String(userId) === String(req.user._id)) {
    return res.status(400).json({ message: "Cannot connect with yourself" });
  }

  const exists = await Connection.findOne({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  });

  if (exists) {
    return res.status(400).json({ message: "Connection already exists" });
  }

  const connection = await Connection.create({
    sender: req.user._id,
    receiver: userId,
    status: "pending",
    type,
  });

  res.status(201).json(connection);
};

export const acceptConnection = async (req, res) => {
  const { connectionId } = req.body;
  const connection = await Connection.findOne({ _id: connectionId, receiver: req.user._id });

  if (!connection) {
    return res.status(404).json({ message: "Connection request not found" });
  }

  connection.status = "accepted";
  await connection.save();

  res.json({ message: "Connection accepted" });
};

export const declineConnection = async (req, res) => {
  const { connectionId } = req.body;
  const connection = await Connection.findOne({ _id: connectionId, receiver: req.user._id });

  if (!connection) {
    return res.status(404).json({ message: "Connection request not found" });
  }

  connection.status = "declined";
  await connection.save();

  res.json({ message: "Connection declined" });
};
