const logger = require("morgan");

module.exports = {
  init(app){
    const staticRoutes = require("../routes/static.js");
    const userRoutes = require("../routes/users.js");

    app.use(staticRoutes);
    app.use(userRoutes);
    app.use(logger("dev"));
  }
};
