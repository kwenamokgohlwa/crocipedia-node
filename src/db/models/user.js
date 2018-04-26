'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: {
     type: DataTypes.STRING,
     allowNull: false
   },
    email: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
       isEmail: { msg: "must be a valid email" }
     }
   },
   password: {
     type: DataTypes.STRING,
     allowNull: false
   },
   role: {
     type: DataTypes.INTEGER,
     allowNull: false,
     defaultValue: 0
   }
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });

    User.hasMany(models.Collaborator, {
      foreignKey: "userId",
      as: "collaborators"
    });

    User.afterUpdate((user) => {
      if(user.role == 0){
        models.Wiki.findAll({
          where: {
              private: true
            }
        })
        .then((wikis) => {
          wikis.forEach((wiki) => {
            let updatedWiki = {
              private: false
            }

            wiki.update(updatedWiki, {
              fields: Object.keys(updatedWiki)
            })
          });
        });
      }
    });

  };

  User.prototype.isPremium = function() {
    return this.role === 1;
  };

  User.prototype.isAdmin = function() {
    return this.role === 2;
  };



  return User;
};
