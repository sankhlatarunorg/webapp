
const {Sequelize,DataTypes} = require('sequelize')

const sequelize = new Sequelize(
    "postgres",
    "postgres",
    "Renuka16@",
    {
        host: "localhost",
        dialect: "postgres",
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
