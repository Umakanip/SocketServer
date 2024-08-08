import { Sequelize } from 'sequelize-typescript';


const sequelize = new Sequelize('chatapp', 'mssqldb', 'mssqldb@123', {
  host: 'localhost',
  dialect: 'mssql',
  dialectOptions: {
      options: {
          encrypt: true, // Use this if you're on Windows Azure
          trustServerCertificate: true // Use this for self-signed certificates
      }
  }
});

// Test the connection
sequelize.authenticate()
  .then(() => {
      console.log('Connection has been established successfull')


      });
export default sequelize;



// import { Sequelize } from 'sequelize-typescript';

//import { dbConfig } from './dbconfig';

// Convert port to number
//const port: number = parseInt(dbConfig.PORT, 1433);

// const sequelize = new Sequelize({
//   dialect: 'mssql',
//   // host: 'DESKTOP-MN080F3',  // Use the correct host URL
//   host: 'localhost',  // Use the correct host URL
//   port: 1433,
//   database: 'chatapp',
//   logging: false, 
//   username: 'mssqldb',
//   password: 'mssqldb@123',
//   dialectOptions: {
//     trustServerCertificate: false,  // Trust the server certificate
//   },
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
//  // logging: console.log,  // Enable SQL logging
// });

// const db = {};
// db.Sequelize = Sequelize;
// db.sequelize = sequelize;
// db.User = require('./user.ts')(sequelize, Sequelize)

// const User = {}
// const db = {
//   Sequelize:Sequelize,
//   sequelize : sequelize,
//   User:require('./user.ts')(sequelize, Sequelize)

// }

// db.sequelize.sync({ force: false })
//   .then(() => {
//     console.log('yes re-sync done! and db connected successfully')
//   })
//   .catch((err)=>{
//     console.log('Error:',err)
//   })
  
// // export {db}
// export default sequelize;