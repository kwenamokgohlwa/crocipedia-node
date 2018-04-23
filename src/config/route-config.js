const logger = require("morgan");

module.exports = {
  init(app){
    const staticRoutes = require("../routes/static.js");
    const userRoutes = require("../routes/users.js");
    const wikiRoutes = require("../routes/wikis.js");

    app.use(staticRoutes);
    app.use(userRoutes);
    app.use(wikiRoutes);
    app.use(logger("dev"));
  }
};
