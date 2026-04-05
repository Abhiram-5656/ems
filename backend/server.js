import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './src/config/database.js';
import { app } from './src/app.js';
import config from './src/config/environment.js';
import Role from './src/models/Role.js';

dotenv.config();

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: config.frontendUrl, methods: ['GET', 'POST'] },
});

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');

    // Initialize default roles
    const roles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
    for (const roleName of roles) {
      const existingRole = await Role.findOne({ name: roleName });
      if (!existingRole) {
        await Role.create({
          name: roleName,
          permissions: [],
          description: `${roleName} role`,
        });
        console.log(`✅ ${roleName} role created`);
      }
    }

    httpServer.listen(config.port, () => {
      console.log(`\n🚀 Server running on http://localhost:${config.port}\n`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();