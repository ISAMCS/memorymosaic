const mongoose = require("mongoose");
const { User, Memory, Comment } = require("./models"); // Import your models

async function clearDatabase() {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    await User.deleteMany({});
    await Memory.deleteMany({});
    await Comment.deleteMany({});

    console.log("All data deleted");
    mongoose.disconnect();
}

clearDatabase().catch(err => console.error(err));