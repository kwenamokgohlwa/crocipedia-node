const Wiki = require("./models").Wiki;
const User = require("./models").User;
const Collaborator = require("./models").Collaborator;
const Authorizer = require("../policies/wiki.js");

module.exports = {

  getAllWikis(callback){
    return Wiki.all()
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    });
  },

  getWiki(id, callback){
    return Wiki.findById(id)
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    });
  },

  addWiki(newWiki, callback){
    return Wiki.create({
      title: newWiki.title,
      body: newWiki.body,
      private: newWiki.private,
      userId: newWiki.userId
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    });
  },

  deleteWiki(req, callback){
    return Wiki.findById(req.params.id)
    .then((wiki) => {
      const authorized = new Authorizer(req.user, wiki).destroy();

      if(authorized) {
        wiki.destroy()
        .then((res) => {
          callback(null, wiki);
        });

      } else {

        req.flash("notice", "You are not authorized to do that.")
        callback(401);
      }
    })
    .catch((err) => {
      callback(err);
    });
  },

  updateWiki(req, updatedWiki, callback){
    return Wiki.findById(req.params.id)
    .then((wiki) => {
      if(!wiki){
        return callback("Wiki not found");
      }

      let collaboratorUser;

      User.findOne({where: {username: req.body.addCollaborator}})
      .then((user) => {
        collaboratorUser = user;

        const authorized = new Authorizer(req.user, wiki).update();

        if(authorized) {
          if(wiki.private){
            if(req.body.addCollaborator != "Select user to add"){
              Collaborator.create({
                username: req.body.addCollaborator,
                wikiId: req.params.id,
                userId: collaboratorUser.id
              })
              .then((collaborator) => {
                console.log(`collaborator create: ${req.body.addCollaborator}, wikiId ${req.params.id}, userId ${req.user.id}`);
              });
            }

            if(req.body.removeCollaborator != "Select collaborator to remove"){
              Collaborator.destroy({
                where: {
                  username: req.body.removeCollaborator
                }
              })
              .then((deletedCollaborator) => {
                console.log(`${deletedCollaborator} deleted`);
              });
            }
          }

          wiki.update(updatedWiki, {
            fields: Object.keys(updatedWiki)
          })
          .then(() => {
            callback(null, wiki);
          })
          .catch((err) => {
            callback(err);
          });
        } else {
          req.flash("notice", "You are not authorized to do that.");
          callback("Forbidden");
        }
      });
    });
  }

}
