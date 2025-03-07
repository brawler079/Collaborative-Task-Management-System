import express from "express";
import Project from "../models/Project.js";
import protect from "../middleware/authMiddleware.js";
import checkRole from "../middleware/roleMiddleware.js"; 

const router = express.Router();

// Create a Project (Only Admins & Managers)
router.post("/", protect, checkRole(["Admin", "Manager"]), async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id], 
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
});

// Fetch all projects (Only for Admins)
router.get("/all", protect, checkRole(["Admin"]), async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name")
      .populate("members", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all projects", error: error.message });
  }
});

// Get All Projects for Logged-in User 
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate("createdBy", "name")
      .populate("members", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});

// Get a Single Project by ID 
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("members", "name email");
      
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
});

// Add a Member to a Project (Only Admins & Managers)
router.post("/:id/members", protect, checkRole(["Admin", "Manager"]), async (req, res) => {
  const { userId } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member of this project" });
    }

    project.members.push(userId);
    await project.save();

    res.json({ message: "User added to project successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error adding user to project", error: error.message });
  }
});

// Remove a Member from a Project (Only Admins & Managers)
router.delete("/:id/members/:userId", protect, checkRole(["Admin", "Manager"]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.members.includes(req.params.userId)) {
      return res.status(400).json({ message: "User is not a member of this project" });
    }

    project.members = project.members.filter((id) => id.toString() !== req.params.userId);
    await project.save();

    res.json({ message: "User removed from project successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error removing user", error: error.message });
  }
});

// Delete a Project (Only Admins)
router.delete("/:id", protect, checkRole(["Admin"]), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
});

export default router;
