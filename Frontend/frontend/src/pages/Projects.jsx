import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AuthContext } from "../context/AuthContext";

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = () => {
    if (!user) return;

    const token = localStorage.getItem("token");
    const endpoint = user.role === "Admin" ? "all" : ""; 
    axios
      .get(`http://localhost:5004/api/projects/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error fetching projects:", err));
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = (projectId) => {
    const userId = prompt("Enter the user ID to add:");
    if (!userId) return;

    const token = localStorage.getItem("token");
    axios
      .post(
        `http://localhost:5004/api/projects/${projectId}/members`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("User added successfully!");
        fetchProjects(); 
      })
      .catch((err) => alert("Error adding user: " + err.response?.data?.message));
  };

  const handleDeleteProject = (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:5004/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Project deleted successfully!");
        setProjects((prevProjects) => prevProjects.filter((p) => p._id !== projectId));
      })
      .catch((err) => alert("Error deleting project: " + err.response?.data?.message));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

      <input
        type="text"
        placeholder="Search projects by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-2 rounded bg-gray-800 text-white w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card key={project._id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{project.description}</p>
                <p className="text-gray-500 text-sm">Created by: {project.createdBy?.name || "Unknown"}</p>
                <Link to={`/projects/${project._id}`} className="mt-4 block text-blue-500 hover:underline">
                  View Project
                </Link>
                {/* Add Member (Only Admins & Managers) */}
                {["Admin", "Manager"].includes(user?.role) && (
                  <Button
                    className="mt-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white w-full"
                    onClick={() => handleAddMember(project._id)}
                  >
                    Add Member
                  </Button>
                )}
                {/* Delete Project (Only Admins) */}
                {user?.role === "Admin" && (
                  <Button
                    className="mt-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white w-full"
                    onClick={() => handleDeleteProject(project._id)}
                  >
                    Delete Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-400">No projects found.</p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        {["Admin", "Manager"].includes(user?.role) && (
          <Button
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
            onClick={() => navigate("/projects/new")}
          >
            Create Project
          </Button>
        )}
      </div>
    </div>
  );
}
