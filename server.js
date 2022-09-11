require('dotenv').config();
const { DB_URI, DB_PASSWORD, DB_USERNAME } = process.env;
const db_uri = DB_URI.replace(/\<username\>/g, encodeURIComponent(DB_USERNAME)).replace(/\<password\>/g, encodeURIComponent(DB_PASSWORD))

// DB setup.
const { DBSetup } = require('./config');
const { PORT } = process.env || 5000;
const { app } = require('./index');

new DBSetup().connectDB(db_uri, () => {
    app.listen(PORT, console.log(`Server running on port http://localhost:${PORT}`));
})
