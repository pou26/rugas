for setting up the project
backend-
cd backend
npm i
node seedData.js/npm run seed - for generating seedData
npm run dev - for starting the server


frontend
cd vite-project
npm i
npm run dev 

here are the credentials

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
