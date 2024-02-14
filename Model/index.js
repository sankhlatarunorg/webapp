
const {Sequelize,DataTypes} = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false
    }
);

sequelize.authenticate().then(() => {
    console.log(`Database connected to discover`)
}).catch((err) => {
    console.log(`Start your Database: `+err)
})

const database = {}
database.Sequelize = Sequelize
database.sequelize = sequelize

//connecting to model
database.users = require('./userModel') (sequelize, DataTypes,Sequelize)

//exporting the module
module.exports = database
