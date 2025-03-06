import express from "express";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a Task
router.post("/", protect, async (req, res) => {
  const { title, description, dueDate, priority, project, assignee } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project,
      assignee,
      reporter: req.user._id, // Creator of the task
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
});

// Get All Tasks by Project
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate("assignee", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// Get Tasks Assigned to User
router.get("/assigned", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id }).populate("project", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned tasks", error });
  }
});

// Update Task Status
router.patch("/:id/status", protect, async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();

    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
});

// Add a Comment to a Task
router.post("/:id/comments", protect, async (req, res) => {
  const { text } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({ user: req.user._id, text });
    await task.save();

    res.json({ message: "Comment added", task });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
});

// Attach a File to a Task
router.post("/:id/files", protect, async (req, res) => {
  const { fileUrl } = req.body; // In production, use file upload services

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.attachments.push(fileUrl);
    await task.save();

    res.json({ message: "File attached", task });
  } catch (error) {
    res.status(500).json({ message: "Error attaching file", error });
  }
});

export default router;
