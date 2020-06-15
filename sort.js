const fs = require("fs");
// 词频 = fs.readFileSync('词频数组.json')
词频 = require('./尾词频数组.json')
词频 = 词频.sort((a,b)=>{
  return b.count - a.count
})
console.log(词频)
fs.writeFileSync("尾词频数组.json", JSON.stringify(词频), "utf8");