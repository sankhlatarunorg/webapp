
const {Sequelize,DataTypes} = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: process.env.DB_DIALECT || 'postgres',
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
database.DataTypes = DataTypes

//connecting to model
database.users = require('./userModel') (sequelize, DataTypes,Sequelize)

//exporting the module
module.exports = database
