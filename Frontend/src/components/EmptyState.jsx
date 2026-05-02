const EmptyState = ({ text = "No data yet 👀" }) => {
  return <div className="empty-state">{text}</div>;
};

export default EmptyState;
