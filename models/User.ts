import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
  },

  password: {
    type: String,
  },

  role: {
    type: String,
    enum: ["admin", "teacher"],
  },

  subject: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
