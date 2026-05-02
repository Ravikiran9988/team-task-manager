const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.NODE_ENV = "test";

const app = require("../app");

const run = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  try {
    const memberUser = {
      name: "Member User",
      email: "member@example.com",
      password: "password123",
      role: "member",
    };

    const adminUser = {
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    };

    const validationFail = await request(app).post("/api/auth/register").send({
      email: "bad@example.com",
    });
    if (validationFail.status !== 400) throw new Error("Validation check failed");

    await request(app).post("/api/auth/register").send(memberUser).expect(201);
    await request(app).post("/api/auth/register").send(adminUser).expect(201);

    const memberLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: memberUser.email, password: memberUser.password })
      .expect(200);
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(200);

    const memberToken = memberLogin.body.token;
    const adminToken = adminLogin.body.token;
    const memberId = memberLogin.body.user.id;

    await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ title: "Forbidden Project" })
      .expect(403);

    await request(app)
      .get("/api/projects")
      .set("Authorization", "Bearer invalid.token.here")
      .expect(401);

    const createProjectRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Alpha Project", description: "Core project" })
      .expect(201);
    const projectId = createProjectRes.body.project._id;

    await request(app)
      .post(`/api/projects/${projectId}/add-member`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: memberUser.email })
      .expect(200);

    const memberProjects = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(200);
    if (!memberProjects.body.projects?.length) throw new Error("Member projects missing");

    const createTaskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Design API Docs",
        description: "Write docs",
        assignedTo: memberId,
        project: projectId,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);
    const taskId = createTaskRes.body.task._id;

    await request(app)
      .get(`/api/tasks/project/${projectId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(200);

    await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "done" })
      .expect(200);

    await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "todo" })
      .expect(200);

    const dashboardRes = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(200);
    if (typeof dashboardRes.body.totalTasks !== "number") {
      throw new Error("Dashboard response invalid");
    }

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(403);

    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await request(app)
      .options("/api/projects")
      .set("Origin", "http://localhost:5174")
      .set("Access-Control-Request-Method", "POST")
      .expect(204);

    console.log("All API tests passed.");
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
};

run().catch((error) => {
  console.error("E2E test failed:", error.message);
  process.exit(1);
});
