const fs = require('fs');
const csv2json = require('csv2json');
const generateBooks =  require('./json/book.js');
const generateAuthors =  require('./json/author.js');
const bookReadStream = fs.createReadStream('../generated/csv/books.csv');
const authorReadStream = fs.createReadStream('../generated/csv/authors.csv');
const bookToAuthorsWriteStream = fs.createWriteStream('../generated/json/bookToAuthors.json');


const { startMemoryCheck } = require('../utils/memory.js')

const csv = require('csv-streamify')


const interval = setInterval(() => { 
	let mem = startMemoryCheck()
    console.log(`Memory used - ${mem}`);
} , 300).unref();
  

let authorsTemp = [];
let bookToAuthorsChunk = {
  book : null,
  authors : []
}
let linesCount = 0;

Promise.all([ generateBooks(), generateAuthors() ])
       .then(() => {
          bookToAuthorsWriteStream.write(`[\n`)
          Promise.all([ readAuthors(),readBooks()  ])
                 .then(() => {
                   bookToAuthorsWriteStream.write(`\n]`)
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
      const newBookReadStream = bookReadStream.pipe(csv2json())

      newBookReadStream
      .on('data', (data) => {

        if(bookToAuthorsChunk.book) {    
          newBookReadStream.pause()
        }

        if(!bookToAuthorsChunk.book) {
              if(data.toString().indexOf('{') === 0 ) {
                  bookToAuthorsChunk.book = JSON.parse(data.toString())
                  detectData()
                  newBookReadStream.resume()
              }
          }

        

      })
      .on('finish', () => {
         console.log('FINISH BOOKS')
        resolve()
      })
      .on('end', () => {
         console.log('END FINISH BOOKS')
        
      })
      .on('error', (e) => {
        reject(e)
      })
    })
}



function readAuthors() {
  return new Promise((resolve, reject) => {
    const newAuthorsReadStream = authorReadStream.pipe(csv2json());
    newAuthorsReadStream
      .on('data', (data) => {

        if(authorsTemp.length === 5) {  
          newAuthorsReadStream.pause()
          detectData()
          newAuthorsReadStream.resume()        
        }

        if(authorsTemp.length < 5 && !newAuthorsReadStream.isPaused()) {
          if(data.toString().indexOf('{') === 0 ) {
            authorsTemp.push(JSON.parse(data.toString()))    
          }
        }
      })
      .on('finish', () => {
        console.log('FINISH AUTHORS')
        resolve()
      })
      .on('error', (e) => {
        reject(e)
      })
    })
}


function detectBooks() {
  if(bookToAuthorsChunk.book) {
    
  }
}



function detectData() {   
  if(bookToAuthorsChunk.book && authorsTemp.length === 5) {
    let arrayLength =  Math.round(Math.random() * (4));
    while(bookToAuthorsChunk.authors.length <= arrayLength) {
      let index = Math.round(Math.random() * (authorsTemp.length - 1));
      let elem = authorsTemp.splice(index, 1);
      bookToAuthorsChunk.authors.push(elem[0]);
    }
      let newLine = linesCount ? ',\n' : ''
      bookToAuthorsWriteStream.write(`${newLine}${JSON.stringify(bookToAuthorsChunk, null , 2, 'utf-8')}`)
      bookToAuthorsChunk = {
        book : null,
        authors : []
      };
      linesCount += 1; 
  }
}

  




