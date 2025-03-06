import { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Tasks() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5004/api/tasks/assigned", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const categorizedTasks = {
          todo: res.data.filter((task) => task.status === "To-Do"),
          inProgress: res.data.filter((task) => task.status === "In Progress"),
          completed: res.data.filter((task) => task.status === "Completed"),
        };
        setTasks(categorizedTasks);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    const taskId = result.draggableId;

    if (sourceCol !== destCol) {
      axios.patch(`http://localhost:5004/api/tasks/${taskId}/status`, { status: destCol }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then(() => {
          setTasks((prev) => {
            const updatedSource = prev[sourceCol].filter((t) => t._id !== taskId);
            const movedTask = prev[sourceCol].find((t) => t._id === taskId);
            const updatedDest = [...prev[destCol], { ...movedTask, status: destCol }];
            return { ...prev, [sourceCol]: updatedSource, [destCol]: updatedDest };
          });
        })
        .catch((err) => console.error("Error updating task status:", err));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Task Board</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {["todo", "inProgress", "completed"].map((col) => (
            <Droppable key={col} droppableId={col}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 bg-gray-900 border border-gray-700 rounded-lg min-h-[300px]"
                >
                  <h2 className="text-lg font-semibold mb-4">
                    {col === "todo" ? "To-Do" : col === "inProgress" ? "In Progress" : "Completed"}
                  </h2>
                  {tasks[col].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="p-3 bg-gray-800 text-white border border-gray-600 rounded mb-2"
                        >
                          {task.title}
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
