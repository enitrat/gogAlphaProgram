/* pages/api/verify.js */
import {ethers} from 'ethers'
import {users} from '../../utils/users'
import {connectToDatabase} from "../../utils/mondogb";

export default async function verify(req, res) {
  let authenticated = false
  const {address, signature} = req.query
  try {
    let {db} = await connectToDatabase();
    const mongoQuery = {address: address};
    let user = await db.collection("users").findOne(mongoQuery)
    console.log(user);
    if (!user) {
      res.status(500);
    } else {
      const decodedAddress = ethers.utils.verifyMessage(user.nonce.toString(), signature)
      if (address.toLowerCase() === decodedAddress.toLowerCase()) authenticated = true
      res.status(200).json({authenticated})
    }
  } catch (err) {
    res.status(500);
  }
}