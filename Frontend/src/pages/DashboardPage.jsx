import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import { api } from "../services/api";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboard();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    const onTaskUpdated = () => {
      loadDashboard();
    };
    window.addEventListener("ttm:task-updated", onTaskUpdated);
    return () => {
      window.removeEventListener("ttm:task-updated", onTaskUpdated);
    };
  }, []);

  if (loading) return <LoadingSpinner text="Fetching dashboard..." />;

  return (
    <section className="page">
      <h2>Dashboard</h2>
      {error && <p className="error-text">{error}</p>}
      {stats && (
        <div className="stats-grid">
          <StatCard icon="📌" label="Total tasks" value={stats.totalTasks} />
          <StatCard icon="✅" label="Completed" value={stats.completedTasks} />
          <StatCard icon="🕒" label="Pending" value={stats.pendingTasks} />
          <StatCard icon="⚠️" label="Overdue" value={stats.overdueTasks} />
        </div>
      )}
    </section>
  );
};

export default DashboardPage;
