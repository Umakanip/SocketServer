const { DataTypes,Model } = require('sequelize');
//const sequelize = require('../config/database');
import sequelize from "../models/index";
class Users extends Model {}
Users.init({
    UserID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
   
PasswordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    FirstName: {
        type: DataTypes.STRING
    },
    LastName: {
        type: DataTypes.STRING
    },
    ProfilePicture: {
        type: DataTypes.BLOB('long')
    },
    Status: {
        type: DataTypes.STRING,
        defaultValue: 'Offline'
    },
    LastSeen: {
        type: DataTypes.DATE
    },
    IsMaster: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},  {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Make sure this matches your table name exactly
    timestamps: false // Disable timestamps (createdAt, updatedAt)
});

export default Users;
// const Users = sequelize.define('Users', {
//     UserID: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     Username: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     Email: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     PasswordHash: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     FirstName: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     LastName: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     ProfilePicture: {
//         type: DataTypes.BLOB,
//         allowNull: false
//     },
//     Status: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     LastSeen: {
//         type: DataTypes.DATE,
//         allowNull: false
//     },
//     IsMaster: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
// });

// export default Users;