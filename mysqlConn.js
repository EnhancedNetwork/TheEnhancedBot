const config = require('./config.json');
var exports = module.exports = {};
const mysql = require("mysql2");
let con;

exports.createCon = function () {
  con = mysql.createPool({
    connectionLimit: 100,
    host: config.utils.HOSTNAME,
    user: config.utils.DBUSERNAME,
    password: config.utils.DBPASSWORD,
    database: config.utils.DATABASE,
    debug: false
  });
  con.getConnection((err, connection) => {
    if(err) throw err;
    console.log('connected as id ' + connection.threadId);
  });
}

exports.check = async function (query) {
  if(!con) this.createCon();
  return new Promise((resolve, reject) => {
    con.query( query,  (err, result, fields)  =>  {
      if (err) reject(err);
      if (!result) resolve(false)
      resolve(result);
    });
  });
}
