const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {

  edit() {
    return this.new();
  }

  update() {
    return this.edit();
  }

}
