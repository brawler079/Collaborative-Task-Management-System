import express from "express";
import Task from "../models/Task.js";
import protect from "../middleware/authMiddleware.js";
import checkRole from "../middleware/roleMiddleware.js"; 
import { io } from "../server.js"; 

const router = express.Router();

// Only Admins & Managers can create tasks
router.post("/", protect, checkRole(["Admin", "Manager"]), async (req, res) => {
  const { title, description, dueDate, priority, project, assignee } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project,
      assignee,
      reporter: req.user._id, 
    });

    // Emit real-time notification to assignee
    io.emit(`task-assigned-${assignee}`, { message: `New task assigned: ${title}` });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});

// Get All Tasks by Project
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate("assignee", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

// Get Tasks Assigned to User
router.get("/assigned", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id }).populate("project", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned tasks", error: error.message });
  }
});

// Only assigned users can update task status
router.patch("/:id/status", protect, checkRole(["Member", "Manager", "Admin"]), async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your assigned tasks" });
    }

    task.status = status;
    await task.save();

    // Emit real-time update to assignee
    io.emit(`task-updated-${task.assignee}`, { message: `Task "${task.title}" is now ${status}` });

    res.json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

// Add a Comment & Notify Assignee
router.post("/:id/comments", protect, async (req, res) => {
  const { text } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.comments.push({ user: req.user._id, text });
    await task.save();

    // Emit comment notification to assignee
    io.emit(`task-comment-${task.assignee}`, { message: `New comment on "${task.title}": ${text}` });

    res.json({ message: "Comment added", task });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

// Fetch Comments for a Specific Task
router.get("/:id/comments", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("comments.user", "name email");
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task.comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
});

// Attach a File & Notify Assignee
router.post("/:id/files", protect, async (req, res) => {
  const { fileUrl } = req.body; 

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.attachments.push(fileUrl);
    await task.save();

    // Emit file attachment notification
    io.emit(`task-file-${task.assignee}`, { message: `File attached to "${task.title}"` });

    res.json({ message: "File attached", task });
  } catch (error) {
    res.status(500).json({ message: "Error attaching file", error: error.message });
  }
});

export default router;
