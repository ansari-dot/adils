import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const PORT = config.port;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });

  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
