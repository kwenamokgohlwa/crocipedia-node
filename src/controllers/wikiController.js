const wikiQueries = require("../db/queries.wikis.js");
const User = require("../db/models").User;
const Collaborator = require("../db/models").Collaborator;
const Authorizer = require("../policies/wiki.js");
const markdown = require( "markdown" ).markdown;

module.exports = {
index(req, res, next){
  wikiQueries.getAllWikis((err, wikis) => {
    let resVars = {};

    resVars["wikis"] = wikis;

    Collaborator.findAll().then((collaborators) => {
      resVars["collaborators"] = collaborators;

      if(err){
        res.redirect(500, "static/index");
      }else {
        res.render("wikis/wiki", {resVars});
      }
    });
  })
},

new(req, res, next){
    const authorized = new Authorizer(req.user).new();

    if(authorized) {
      res.render("wikis/new");
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },

  create(req, res, next){
    const authorized = new Authorizer(req.user).create();

    let privateWiki;

    if(req.user.role == 0) {
      privateWiki = false;
    } else {
      privateWiki = req.body.private;
    }

    if(authorized) {
      let newWiki = {
        title: req.body.title,
        body: req.body.body,
        private: privateWiki,
        userId: req.user.id
      };

      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if(err){
          res.redirect(500, "wikis/new");
        } else {
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },

  show(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      let resVars = {};

      resVars["wiki"] = wiki;

      Collaborator.findAll().then((collaborators) => {
        resVars["collaborators"] = collaborators;

        if(err || wiki == null){
          res.redirect(404, "/");
        } else {
          resVars.wiki.body = markdown.toHTML(wiki.body);
          res.render("wikis/show", {resVars});
        }
      });
    });
  },

  destroy(req, res, next){
    wikiQueries.deleteWiki(req, (err, wiki) => {
      if(err){
        res.redirect(err, `/wikis/${req.params.id}`)
      } else {
        res.redirect(303, "/wikis")
      }
    });
  },

  edit(req, res, next){
    let resVars = {};

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {

        resVars["wiki"] = wiki;

        User.findAll()
        .then((users) => {
          resVars["users"] = users;

          Collaborator.findAll()
          .then((collaborators) => {
            resVars["collaborators"] = collaborators;

            const authorized = new Authorizer(req.user, wiki).edit();

            if(authorized){
              res.render("wikis/edit", {resVars});
            } else {
              req.flash("You are not authorized to do that.")
              res.redirect(`/wikis/${req.params.id}`)
            }
          });
        });
      }
    });
  },

  update(req, res, next){
    wikiQueries.updateWiki(req, req.body, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(401, `/wikis/${req.params.id}/edit`);
      } else {
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  },

  makePublic(req, res, next){
    let updatedWiki = {
      title: req.body.title,
      body: req.body.body,
      private: false,
      userId: req.user.id
    }

    wikiQueries.updateWiki(req, updatedWiki, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(401, "/");
      } else {
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  },

  makePrivate(req, res, next){
    let updatedWiki = {
      title: req.body.title,
      body: req.body.body,
      private: true,
      userId: req.user.id
    }

    wikiQueries.updateWiki(req, updatedWiki, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(401, "/");
      } else {
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  }
}
