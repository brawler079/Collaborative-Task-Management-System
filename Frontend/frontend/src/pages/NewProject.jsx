import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5004/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const userProjects = res.data.filter(project => project.members.includes(user?._id));
        setProjects(userProjects);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, [user]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Link to="/reports">
          <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white">View Reports</Button>
        </Link>
      </div>
      
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
      <div className="mt-6">
        <Button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
      
      <Button
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 p-4 rounded-full text-white shadow-lg"
        onClick={() => navigate("/projects/new")}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}

export function NewProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = localStorage.getItem("token");

  const handleCreateProject = async () => {
    try {
      await axios.post(
        "http://localhost:5004/api/projects",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <input
        type="text"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800 text-white w-80"
      />
      <textarea
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800 text-white w-80"
      />
      <Button className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white" onClick={handleCreateProject}>
        Create Project
      </Button>
      <Button className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white mt-4" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </div>
  );
}
