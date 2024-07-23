import sequelize from './index';
import User from './UserModel';
import { Sequelize } from 'sequelize-typescript';

// const db = {
//   Sequelize:Sequelize,
//   sequelize : sequelizeInstance,
//   User:User
// }

const syncDatabase = async () => {
    console.log("Sync check")
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing the database:', error);
    }
};

export default syncDatabase;