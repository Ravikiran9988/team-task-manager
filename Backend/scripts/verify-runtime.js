const { MongoMemoryServer } = require("mongodb-memory-server");
const connectDB = require("../config/db");
const app = require("../app");
const mongoose = require("mongoose");

const run = async () => {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = "runtime_test_secret";
  process.env.PORT = "5055";

  await connectDB();

  const server = app.listen(process.env.PORT, () => {
    console.log(`Runtime check server started on env port ${process.env.PORT}`);
  });

  await new Promise((resolve) => setTimeout(resolve, 800));

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) return reject(error);
      resolve();
    });
  });
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log("Runtime check completed.");
};

run().catch((error) => {
  console.error("Runtime check failed:", error.message);
  process.exit(1);
});
