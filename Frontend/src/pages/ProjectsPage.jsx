import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!title.trim()) return setError("Project title is required.");

    try {
      setError("");
      setSubmitting(true);
      await api.createProject({
        title,
        description,
      });
      setTitle("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading projects..." />;

  return (
    <section className="page">
      <div className="row between">
        <h2>Projects</h2>
      </div>
      {error && <p className="error-text">{error}</p>}

      {user?.role === "admin" && (
        <form className="card project-form" onSubmit={handleCreateProject}>
          <h3>Create Project</h3>
          <input
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn" disabled={submitting} type="submit">
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <EmptyState text="No projects yet 👀" />
        ) : (
          projects.map((project) => (
            <Link className="card project-card" key={project._id} to={`/projects/${project._id}`}>
              <h3>{project.title}</h3>
              <p>{project.description || "No description added"}</p>
              <span>{project.members?.length || 0} members</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default ProjectsPage;
