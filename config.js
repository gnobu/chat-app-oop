const mongoose = require('mongoose');

class DBSetup {
    async connectDB(db_uri, cb) {
        try {
            const conn = await mongoose.connect(
                db_uri,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                }
            );

            // console.log(`MongoDB connected: ${conn.connection.host}`);
            cb();
        } catch (error) {
            console.log(`Error: ${error.message}`);
            process.exit();
        }
    }
}

module.exports = { DBSetup };