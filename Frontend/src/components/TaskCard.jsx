import StatusBadge from "./StatusBadge";

const TaskCard = ({
  task,
  onStatusChange,
  canEditStatus = true,
  disabledReason = "",
  isUpdating = false,
}) => {
  return (
    <div className="task-card">
      <div className="task-head">
        <h4>{task.title}</h4>
        <StatusBadge status={task.status} />
      </div>

      <p className="task-description">{task.description || "No description"}</p>

      <div className="task-meta">
        <span>Assignee: {task.assignedTo?.name || "Unknown"}</span>
        <span>
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
        </span>
      </div>

      {onStatusChange && (
        <select
          className="status-select"
          value={task.status}
          onChange={(event) => onStatusChange(task._id, event.target.value)}
          disabled={!canEditStatus || isUpdating}
          title={
            !canEditStatus
              ? disabledReason || "You are not allowed to update this task."
              : isUpdating
                ? "Updating..."
                : ""
          }
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      )}

      {!canEditStatus && disabledReason ? (
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          {disabledReason}
        </p>
      ) : null}
    </div>
  );
};

export default TaskCard;
