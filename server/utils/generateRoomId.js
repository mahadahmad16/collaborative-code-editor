import crypto from "crypto";

const generateRoomId = () => {
  return crypto.randomBytes(5).toString("hex");
};

export default generateRoomId;