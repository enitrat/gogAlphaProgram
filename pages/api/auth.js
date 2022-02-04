import { users } from '../../utils/users'
import {connectToDatabase} from "../../utils/mondogb";

export default async function auth(req, res) {
  const {address} = req.query
  try {
    let {db} = await connectToDatabase();
    const mongoQuery = {address: address};
    let user = await db.collection("users").findOne(mongoQuery)
    console.log(user);
    if (!user) {
      user = {
        address,
        nonce: Math.floor(Math.random() * 10000000)
      }
      await db.collection("users").insertOne(user)
    } else {
      const nonce = Math.floor(Math.random() * 10000000)
      user.nonce = nonce
      await db.collection("users").replaceOne(mongoQuery, user)
    }
    res.status(200).json(user)
  }catch(err){
    res.status(500);
  }
}