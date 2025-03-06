import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5004/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    </div>
  );
}
