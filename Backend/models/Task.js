import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["To-Do", "In Progress", "Completed"], default: "To-Do" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assigned user
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Created by
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [{ type: String }], // File URLs
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
