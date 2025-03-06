import express from "express";
import { generatePDFReport, generateCSVReport } from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Download Project Summary as PDF
router.get("/:projectId/pdf", protect, generatePDFReport);

// Download Project Summary as CSV
router.get("/:projectId/csv", protect, generateCSVReport);

export default router;
