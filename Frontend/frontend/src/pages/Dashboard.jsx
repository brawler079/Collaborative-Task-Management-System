import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");

    const fetchProjects = async () => {
      try {
        let url = "http://localhost:5004/api/projects";
        if (user.role === "Admin") {
          url = "http://localhost:5004/api/projects/all"; 
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5004/api/tasks/assigned", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchProjects();
    fetchTasks();
  }, [user]);

  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter((task) =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <Link to="/projects">
          <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">View Projects</Button>
        </Link>
        <Link to="/tasks">
          <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">View Tasks</Button>
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search projects and tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-2 rounded bg-gray-800 text-white w-full"
      />

      {/* Projects Section */}
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card key={project._id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{project.description}</p>
                <Link to={`/projects/${project._id}`} className="mt-4 block text-blue-500 hover:underline">
                  View Project
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-400">No projects found.</p>
        )}
      </div>

      {/* Tasks Section */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Assigned Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task._id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{task.description}</p>
                <p className="text-sm text-gray-500 mt-2">Status: {task.status}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-400">No assigned tasks found.</p>
        )}
      </div>

      <div className="mt-6">
        <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
