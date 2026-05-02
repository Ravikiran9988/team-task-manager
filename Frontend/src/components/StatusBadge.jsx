const STATUS_LABELS = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`status-badge ${status || "todo"}`}>
      {STATUS_LABELS[status] || "Todo"}
    </span>
  );
};

export default StatusBadge;
