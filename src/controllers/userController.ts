import { Request, Response } from 'express';
import Users from '../models/UserModel';
import sequelize from '../models';

sequelize.sync()
    .then(() => {
        console.log('Database synchronized');
    })
    .catch(err => {
        console.error('Database synchronization error:', err);
    });

const getUserList = async (req: Request, res: Response) => {
    const fetchResult = await  Users.findAll(); 
    console.log(fetchResult)
    try {
        const fetchResult = await  Users.findAll();
        res.json(fetchResult); 
        console.log(fetchResult)
    } catch (err:any){
        console.log("err",err.Message)
    }
    return fetchResult;
   // res.send({'Message':fetchResult})
}

export default getUserList;