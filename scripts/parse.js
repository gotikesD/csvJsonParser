const fs = require('fs');
const csv2json = require('csv2json');
const generateBooks =  require('./json/book.js');
const generateAuthors =  require('./json/author.js');
const bookReadStream = fs.createReadStream('../generated/csv/books.csv');
const authorReadStream = fs.createReadStream('../generated/csv/authors.csv');
const bookToAuthorsWriteStream = fs.createWriteStream('../generated/json/bookToAuthors.json');

let authorsTemp = [];
let bookToAuthorsChunk = {
  book : null,
  authors : []
}

Promise.all([ generateBooks(), generateAuthors() ])
       .then(() => {
          Promise.all([ readBooks(), readAuthors() ])
                 .then(() => {
                   console.log('Finished')
                 })
                 .catch((e) => {
                   console.log(e)
                 })
       })
       .catch((e) => {
         console.log(e)
       })


function readBooks() {
  return new Promise((resolve, reject) => {
      bookReadStream
      .pipe(csv2json())
      .on('data', (data) => {
        if(!bookToAuthorsChunk.book) {
          if(data.toString().indexOf('{') === 0 ) {
            bookToAuthorsChunk.book = JSON.parse(data.toString())
          }
        }

        if(bookToAuthorsChunk.book) {
          bookReadStream.pause()
          detectData()
        }
      })
      .on('finish', () => {
        resolve()
      })
      .on('error', (e) => {
        reject(e)
      })
    })
}


function readAuthors() {
  return new Promise((resolve, reject) => {
      authorReadStream
      .pipe(csv2json())
      .on('data', (data) => {
        if(authorsTemp.length < 5) {
          if(data.toString().indexOf('{') === 0 ) {
            authorsTemp.push(JSON.parse(data.toString()))
          }
        }

        if(authorsTemp.length === 5) {
          authorReadStream.pause()
          detectData()
        }
      })
      .on('finish', () => {
        resolve()
      })
      .on('error', (e) => {
        reject(e)
      })
    })
}






function detectData() {
  if(bookReadStream.isPaused() && authorReadStream.isPaused()) {
     console.log('!')
    let arrayLength =  Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    while(bookToAuthorsChunk.authors.length <= arrayLength) {
      let index = Math.floor(Math.random() * (authorsTemp.length - 1)) + 1;
      let elem = authorsTemp.splice(index, 1);
      bookToAuthorsChunk.authors.push(elem[0]);
    }
    bookToAuthorsWriteStream.write(`\n,${JSON.stringify(bookToAuthorsChunk, null , 2, 'utf-8')}`, () => {
      bookToAuthorsChunk = {
        book : null,
        authors : []
      };
      bookReadStream.resume()
      authorReadStream.resume()
    }) 
  }
}

  




