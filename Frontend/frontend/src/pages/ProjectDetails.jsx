import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function ProjectDetails() {
  const { id } = useParams(); // Get project ID from URL
  const navigate = useNavigate(); // Hook for navigation
  const [project, setProject] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadMessage, setDownloadMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`http://localhost:5004/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        setProject(res.data);
        if (res.data.createdBy) {
          try {
            const userRes = await axios.get(`http://localhost:5004/api/users/${res.data.createdBy}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCreatedBy(userRes.data.name);
          } catch (err) {
            console.error("Error fetching user details:", err);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching project details:", err);
        setLoading(false);
      });
  }, [id]);

  const handleDownloadReport = async (format) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:5004/api/reports/${id}/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Ensure file is downloaded correctly
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `project_report.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadMessage(`✅ ${format.toUpperCase()} report downloaded successfully!`);
      setTimeout(() => setDownloadMessage(""), 3000);
    } catch (err) {
      console.error("Error downloading report:", err);
      setDownloadMessage("❌ Failed to download report. Try again.");
    }
  };

  if (loading) {
    return <p className="text-gray-400 text-center">Loading project details...</p>;
  }

  if (!project) {
    return <p className="text-red-500 text-center">Project not found.</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl">{project.name || "Untitled Project"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">{project.description || "No description available."}</p>
          <p className="mt-4 text-sm text-gray-500">Created by: {createdBy || "Unknown"}</p>
        </CardContent>
      </Card>
      <div className="mt-6 flex gap-4">
        <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white" onClick={() => handleDownloadReport('pdf')}>
          Download PDF Report
        </Button>
        <Button className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded text-black" onClick={() => handleDownloadReport('csv')}>
          Download CSV Report
        </Button>
      </div>
      {downloadMessage && (
        <p className="mt-4 text-center text-green-400">{downloadMessage}</p>
      )}
    </div>
  );
}
