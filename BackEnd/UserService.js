const { User } = require("./models"); // Adjust the path as necessary

async function getUserByGoogleId(googleId) {
  const user = await User.findOne({ googleId });
  return user;
}

module.exports = {
  getUserByGoogleId,
};