for setting up the project
Backend:
cd backend
npm i - to install libraries
node seedData.js or npm run seed - for generating seedData
npm run dev - for starting the server


Frontend:
cd vite-project
npm i - to install libraries
npm run dev - for running the code


here are the credentials (.env)

# Database Configuration
MONGODB_URI=mongodb+srv://poushaliaich1999:ghqFg71pOYEIneCm@cluster0.tvd0t.mongodb.net/rugas?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret Key
JWT_SECRET=super-secret-jwt-key

# Server Configuration
PORT=5001

# File Upload Configuration
MAX_FILE_SIZE=5MB

# CORS Configuration
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:5001
