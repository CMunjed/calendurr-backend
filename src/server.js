// server.js is responsible for starting the server and listening on the specified port for requests
// It is the entry point of the application.

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`View in the browser at http://localhost:${PORT}/`);
});
