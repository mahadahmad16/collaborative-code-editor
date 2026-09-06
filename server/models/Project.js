import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },

    path: {
      type: String,
      required: [true, "File path is required"],
      trim: true,
    },

    language: {
      type: String,
      default: "plaintext",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    files: {
      type: [projectFileSchema],
      default: [],
    },

    defaultLanguage: {
      type: String,
      enum: [
        "javascript",
        "typescript",
        "python",
        "java",
        "html",
        "css",
        "json",
        "markdown",
      ],
      default: "javascript",
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;