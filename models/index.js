const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
}

db.models.Course = require('./course.js') (sequelize);

sequelize.authenticate()
  .then(() => {
    console.log('connected to DB');
  });

module.exports = db;