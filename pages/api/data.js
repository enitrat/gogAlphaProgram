/* pages/api/verify.js */
import {ethers} from 'ethers'
import {users} from '../../utils/users'
import {connectToDatabase} from "../../utils/mondogb";

export default async function data(req, res) {
  console.log("data in")
  if (req.method !== 'POST') {
    res.status(400).send({message: 'Only POST requests allowed'})
    return
  }
  console.log(req.body);
  let success = false
  const {address, signature, formData} = req.body
  const decodedAddress = ethers.utils.verifyMessage(JSON.stringify(formData), signature)
  if (address.toLowerCase() === decodedAddress.toLowerCase()) success = true
  if(success){
    console.log("post")
    let {db} = await connectToDatabase();
    console.log(db);
    try {
      const mongoQuery = {address: address};
      let user = await db.collection("users").findOne(mongoQuery)
      user = {...user, ...formData}
      await db.collection("users").replaceOne(mongoQuery, user)
      res.status(200).json({result: "success"});
    } catch (e) {
      console.log(e);
      res.status(500).json({result: "failure"})
    }
  }
}