'use strict';

const faker = require("faker");

let users = [];

for(let i = 1 ; i <= 10; i++){
  users.push({
    username: faker.name.findName(),
    email: faker.internet.email(),
    password: "1234567",
    role: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
