const StatCard = ({ icon, label, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
};

export default StatCard;
