import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "../components/ui/button";
import socket from "../socket"; 

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], completed: [] });
  const [comments, setComments] = useState({});
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchTasks();

    // Listen for real-time task updates
    socket.on(`task-updated-${userId}`, fetchTasks);
    socket.on(`task-comment-${userId}`, (taskId) => fetchComments(taskId));

    return () => {
      socket.off(`task-updated-${userId}`);
      socket.off(`task-comment-${userId}`);
    };
  }, []);

  // Fetch all assigned tasks
  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5004/api/tasks/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const categorizedTasks = {
        todo: res.data.filter((task) => task.status === "To-Do"),
        inProgress: res.data.filter((task) => task.status === "In Progress"),
        completed: res.data.filter((task) => task.status === "Completed"),
      };

      setTasks(categorizedTasks);
      res.data.forEach((task) => fetchComments(task._id));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Fetch comments for a specific task
  const fetchComments = async (taskId) => {
    try {
      const res = await axios.get(`http://localhost:5004/api/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prev) => ({
        ...prev,
        [taskId]: res.data.map((comment) => `${comment.user.name}: ${comment.text}`),
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Handle task status update on drag-and-drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    const taskId = result.draggableId;

    if (sourceCol !== destCol) {
      const newStatus = { todo: "To-Do", inProgress: "In Progress", completed: "Completed" }[destCol];

      try {
        await axios.patch(`http://localhost:5004/api/tasks/${taskId}/status`, { status: newStatus }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Emit real-time event
        socket.emit("task-updated", { taskId, status: newStatus });

        // Optimistically update UI
        setTasks((prev) => {
          const updatedSource = prev[sourceCol].filter((t) => t._id !== taskId);
          const movedTask = prev[sourceCol].find((t) => t._id === taskId);
          const updatedDest = [...prev[destCol], { ...movedTask, status: newStatus }];
          return { ...prev, [sourceCol]: updatedSource, [destCol]: updatedDest };
        });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  // Handle adding a comment
  const addComment = async (taskId, comment) => {
    if (!comment.trim()) return;

    try {
      await axios.post(
        `http://localhost:5004/api/tasks/${taskId}/comments`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit real-time comment event
      socket.emit("task-comment", taskId);
      fetchComments(taskId);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Go Back Button */}
      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => navigate(-1)}>
        Go Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">Task Board</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["todo", "inProgress", "completed"].map((col) => (
            <Droppable key={col} droppableId={col}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 bg-gray-900 border border-gray-700 rounded-lg min-h-[300px]">
                  <h2 className="text-lg font-semibold mb-4">
                    {col === "todo" ? "To-Do" : col === "inProgress" ? "In Progress" : "Completed"}
                  </h2>
                  {tasks[col].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}
                          className="p-3 bg-gray-800 text-white border border-gray-600 rounded mb-4">
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-gray-400">{task.description}</p>

                          {/* Comment Input */}
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              className="p-1 text-black rounded w-full"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addComment(task._id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                            />
                          </div>

                          {/* Display Comments */}
                          <div className="text-gray-400 mt-2 text-sm">
                            {comments[task._id]?.length > 0 ? (
                              comments[task._id].map((c, i) => <p key={i}>- {c}</p>)
                            ) : (
                              <p className="text-gray-600">No comments yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
