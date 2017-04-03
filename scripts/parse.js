const csv2json = require('csv2json');
const fs = require('fs');
const { startMemoryCheck } = require('../utils/memory.js');
const { CONSOLE_CYCLE, MAX_MEMORY_USAGE } = require('../config/')

console.time('Parsing Script Working Time');

let bookToAuthorsChunk = {
	book: null,
	authors: []
};

let authorsTemp = [];
var chunkCounter = 0;

const bookWriteStream = fs.createWriteStream('../generated/json/book.json', 'utf-8');
const authorsWriteStream = fs.createWriteStream('../generated/json/authors.json', 'utf-8');
const bookToAuthorsWriteStream = fs.createWriteStream('../generated/json/bookToAuthors.json', 'utf-8');
const bookReadStream  = fs.createReadStream('../generated/csv/books.csv');
const authorsReadStream  = fs.createReadStream('../generated/csv/authors.csv');

const interval = setInterval(() => { 
  
  let mem = startMemoryCheck()
  console.log(`Memory used - ${mem}`)
  // if(mem > MAX_MEMORY_USAGE) {
  //   console.log('Max memory usage reached!')
  //   interval.unref()
  //   process.exit()
  // }
} , CONSOLE_CYCLE)


bookToAuthorsWriteStream.write('[\n', 'utf-8')



Promise.all([ writeAuthors() , writeBooks()])
       .then(() => {
          console.timeEnd('Parsing Script Working Time');
          console.log('Generating JSON finished!');
          bookToAuthorsWriteStream.write('\n]', 'utf-8');
          interval.unref()
       });


function writeBooks() {
  return new Promise((resolve, reject) => {
      bookReadStream
      .pipe(csv2json())
      .on('data', (data) => {
          bookReadStream.pause();
          if(!bookToAuthorsChunk.book) {
            bookReadStream.resume()
            bookWriteStream.write(data.toString()) 
            if(data.toString().indexOf('{') === 0) {
              bookToAuthorsChunk.book = JSON.parse(data.toString()) 
            }
          }

          if(bookToAuthorsChunk.book) {
               bookReadStream.pause();
          }

       
           
      })
      .on('finish', () => {
        resolve()
      })
    })
} 

function writeAuthors() {
  return new Promise((resolve, reject) => {
    authorsReadStream.pipe(csv2json())
    .on('data', (data) => {

        authorsReadStream.pause();

        if(authorsTemp.length != 5) {
          authorsWriteStream.write(data.toString()) 
          authorsReadStream.resume();
        }

        if(authorsTemp.length === 5 && bookToAuthorsChunk.book) {
          detectFullfieldData()
        }
        
        if(data.toString().indexOf('{') === 0 && authorsTemp.length <= 5) { 
            authorsTemp.push(JSON.parse(data.toString()))
        }
  
       
    })
    .on('finish', () => {
      resolve()
    })
  })
}

  


	

  

function detectFullfieldData() {

      console.log(bookToAuthorsChunk)
      // if(authorsTemp.length === 5 ) {
      //   authorsReadStream.pause()
    
      //   console.log(bookToAuthorsChunk)

      // }
      bookToAuthorsChunk.book = null
      // if(bookToAuthorsChunk.book && bookToAuthorsChunk.authors.length) {
      //   console.log(bookToAuthorsChunk)
      // }
      // let arrayLength =  Math.floor(Math.random() * (4 - 1 + 1)) + 1;

      // while(bookToAuthorsChunk.authors.length <= arrayLength) {
      //   let index = Math.floor(Math.random() * (authorsTemp.length - 1)) + 1;
      //   let elem = authorsTemp.splice(index, 1);
      //   bookToAuthorsChunk.authors.push(elem[0]);
      // }    

      // console.log(bookToAuthorsChunk)

      // bookToAuthorsChunk = {
      //   book : null,
      //   authors : []
      // }


      
      // const addNewLine = chunkCounter ? ',\n' : '';
      // bookToAuthorsWriteStream.write(`${addNewLine}${JSON.stringify(bookToAuthorsChunk, null , 2, 'utf-8')}`)
      // console.log('BOOKS_AUTHORS CHUNK  ',bookToAuthorsChunk)
      // chunkCounter++;


      // authorsReadStream.resume();
      // bookReadStream.resume()
  }