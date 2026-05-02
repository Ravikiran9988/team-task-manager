import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import TaskCard from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingTaskIds, setUpdatingTaskIds] = useState(() => new Set());
  const [memberEmail, setMemberEmail] = useState("");
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    status: "todo",
  });

  const members = useMemo(() => project?.members || [], [project]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectData, taskData] = await Promise.all([
        api.getProjects(),
        api.getTasksByProject(id),
      ]);

      const selectedProject = (projectData.projects || []).find((p) => p._id === id);
      setProject(selectedProject || null);
      setTasks(taskData.tasks || []);
      setTaskForm((prev) => ({
        ...prev,
        assignedTo: selectedProject?.members?.[0]?._id || "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!taskForm.title || !taskForm.assignedTo) {
      setError("Task title and assignee are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.createTask({
        ...taskForm,
        project: id,
        dueDate: taskForm.dueDate || undefined,
      });
      setTaskForm({
        title: "",
        description: "",
        assignedTo: members[0]?._id || "",
        dueDate: "",
        status: "todo",
      });
      fetchData();
      setSuccess("Task created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!memberEmail.trim()) {
      setError("Member email is required.");
      return;
    }

    try {
      setMemberSubmitting(true);
      setError("");
      setSuccess("");
      await api.addMemberToProject(id, memberEmail.trim());
      setMemberEmail("");
      await fetchData();
      setSuccess("Member added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    const existing = tasks.find((t) => t._id === taskId);
    const previousStatus = existing?.status;
    if (!previousStatus || previousStatus === status) return;

    try {
      setError("");
      setSuccess("");

      // Optimistic UI update
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status } : task))
      );
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });

      await api.updateTask(taskId, { status });
      window.dispatchEvent(new CustomEvent("ttm:task-updated"));
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: previousStatus } : task
        )
      );
      setError(err.message);
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  if (loading) return <LoadingSpinner text="Loading project details..." />;

  return (
    <section className="page">
      <h2>{project?.title || "Project Details"}</h2>
      <p className="muted">{project?.description || "No project description"}</p>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      {user?.role === "admin" && (
        <>
          <form className="card project-form" onSubmit={handleAddMember}>
            <h3>Add Member</h3>
            <input
              placeholder="Member email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <button className="btn" disabled={memberSubmitting} type="submit">
              {memberSubmitting ? "Adding..." : "Add Member"}
            </button>
          </form>

          <form className="card project-form" onSubmit={handleCreateTask}>
            <h3>Add Task</h3>
            <input
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            />
            <textarea
              rows={3}
              placeholder="Task description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
            <div className="row">
              <select
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              >
                <option value="">Assign to</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
            <button className="btn" disabled={submitting} type="submit">
              {submitting ? "Adding..." : "Add Task"}
            </button>
          </form>
        </>
      )}

      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <EmptyState text="No tasks yet 👀" />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              canEditStatus={
                user?.role === "admin" ||
                (user?._id &&
                  (task.assignedTo?._id === user._id || task.assignedTo === user._id))
              }
              disabledReason={
                user?.role === "member"
                  ? "Only the assigned member (or an admin) can update this task."
                  : "You are not allowed to update this task."
              }
              isUpdating={updatingTaskIds.has(task._id)}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default ProjectDetailsPage;
