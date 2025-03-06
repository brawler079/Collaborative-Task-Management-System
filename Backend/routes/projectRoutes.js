import express from "express";
import Project from "../models/Project.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a Project
router.post("/", protect, async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id], // Creator is auto-added
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
});

// Get All Projects for Logged-in User
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate("createdBy", "name");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// Get a Single Project by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
  }
});

// Add a Member to a Project
router.post("/:id/members", protect, async (req, res) => {
  const { userId } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    res.json({ message: "User added to project", project });
  } catch (error) {
    res.status(500).json({ message: "Error adding user to project", error });
  }
});

// Remove a Member from a Project
router.delete("/:id/members/:userId", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.members = project.members.filter((id) => id.toString() !== req.params.userId);
    await project.save();

    res.json({ message: "User removed from project", project });
  } catch (error) {
    res.status(500).json({ message: "Error removing user", error });
  }
});

export default router;
