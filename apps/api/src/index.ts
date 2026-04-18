import dotenv from "dotenv";
import { createServer } from "http";
import { createApp } from "./app.js";
import { initializeSocket } from "./utils/socket.js";
// Start the background analysis worker (connects to Redis + processes jobs)
import "./queue/analysisWorker.js";

dotenv.config();

const app = createApp();
const httpServer = createServer(app);

initializeSocket(httpServer);

const PORT = parseInt(process.env.PORT || "4000", 10);

httpServer.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
