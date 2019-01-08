/*
  Filter down to h1 and s2 attributes
*/
var rvnquery = require('../index')
var bql = {
  v: 3,
  q: {
    db: ["c", "u"],
    find: { "out.h1": "6d02" },
    limit: 5,
    project: { "out.$": 1, "_id": 0 }
  },
  r: {
    f: "[.[] | .out[0] | { code: .h1, msg: .s2} ]"
  }
};
(async function() {
  let db = await rvnquery.init({
    url: process.env.url ? process.env.url : "mongodb://localhost:27017"
  })
  let response = await db.read(bql)
  console.log("Response = ", JSON.stringify(response, null, 2))
  db.exit()
})();
