/* pages/api/verify.js */
import {ethers} from 'ethers'
import {users} from '../../utils/users'
import {connectToDatabase} from "../../utils/mondogb";
import XLSX from "xlsx"
import fs from "fs"
import * as path from "path";

export default async function exportData(req, res) {
  console.log("data in")
  if (req.method !== 'GET') {
    res.status(400).send({message: 'Only GET requests allowed'})
    return
  }
  console.log(req.body);
  console.log("post")
  let {db} = await connectToDatabase();
  // console.log(db);
  try {
    let users = await db.collection("users").find({},{projection:{_id:0,nonce:0}}).toArray()
    // console.log(users)
    let files = []
    for (let each in users){
      files.push(users[each]);
    }
    var obj = files.map((e) => {
      return e
    });

    var newWB = XLSX.utils.book_new();
    var newWS = XLSX.utils.json_to_sheet(obj);
    XLSX.utils.book_append_sheet(newWB,newWS,"alpha-applicants")
    const exportDir = path.resolve('./public')
    if (!fs.existsSync(exportDir)){
      fs.mkdirSync(exportDir);
    }
    XLSX.writeFile(newWB,path.join(exportDir,"gogalpha.xlsx"));
    var filePath =path.join(exportDir,"gogalpha.xlsx") ;
    var stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': stat.size
    });
    var readStream = fs.createReadStream(filePath);
// We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
    // res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(500).json({result: "failure"})
  }
}