import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

// Generate PDF Report
export const generatePDFReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("members", "name email");
    const tasks = await Task.find({ project: req.params.projectId });

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Create a PDF document
    const doc = new PDFDocument();
    const timestamp = Date.now();
    const filename = `project_${project._id}_${timestamp}.pdf`;
    const filePath = path.resolve(`./reports/${filename}`);

    // Stream PDF response
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(fs.createWriteStream(filePath)); 
    doc.pipe(res); 

    // PDF Content
    doc.fontSize(20).text(`Project Summary: ${project.name}`, { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Description: ${project.description || "No description provided"}`);
    doc.moveDown();
    doc.text(`Created By: ${project.createdBy}`);
    doc.moveDown();
    doc.text(`Members:`);

    project.members.forEach((member, index) => {
      doc.text(`${index + 1}. ${member.name} (${member.email})`);
    });

    doc.moveDown();
    doc.text(`Tasks:`);
    tasks.forEach((task, index) => {
      doc.text(`${index + 1}. ${task.title} - ${task.status} (Due: ${task.dueDate})`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF report", error });
  }
};

// Generate CSV Report
export const generateCSVReport = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate("assignee", "name");

    if (!tasks.length) {
      return res.status(404).json({ message: "No tasks found for this project" });
    }

    const fields = ["title", "status", "priority", "dueDate", "assignee.name"];
    const json2csvParser = new Parser({ fields });

    // Check if all fields exist before parsing
    const formattedTasks = tasks.map((task) => ({
      title: task.title || "No Title",
      status: task.status || "No Status",
      priority: task.priority || "No Priority",
      dueDate: task.dueDate || "No Due Date",
      assignee: task.assignee ? task.assignee.name : "Unassigned",
    }));

    const csv = json2csvParser.parse(formattedTasks);

    const timestamp = Date.now();
    const filename = `project_${req.params.projectId}_${timestamp}.csv`;
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "text/csv");

    res.status(200).send(csv);
  } catch (error) {
    console.error("CSV Report Error:", error);
    res.status(500).json({ message: "Error generating CSV report", error: error.message });
  }
};