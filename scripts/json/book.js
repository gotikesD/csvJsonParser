const fs = require('fs');
const csv2json = require('csv2json');

module.exports = function() {
    return new Promise((resolve, reject) => {
      fs.createReadStream('../generated/csv/books.csv')
      .pipe(csv2json())
      .pipe(fs.createWriteStream('../generated/json/book.json', 'utf-8'))
      .on('finish', () => {
        resolve()
      })
    })
}