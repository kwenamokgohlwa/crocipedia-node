const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {

  // new() {
  //   return this._isOwner();
  // }
  //
  // create() {
  //   return this.new();
  // }
  //
  edit() {
    return this.new();
  }

  update() {
    return this.edit();
  }
  //
  // destroy() {
  //   return this.update();
  // }

}
