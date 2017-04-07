// const fs = require('fs');
// // const csv2json = require('csv2json');
//
// module.exports = function() {
//     return new Promise((resolve, reject) => {
//       fs.createReadStream('../generated/csv/authors.csv')
//       .pipe(csv2json())
//       .pipe(fs.createWriteStream('../generated/json/author.json', 'utf-8'))
//       .on('finish', () => {
//         resolve()
//       })
//     })
// }