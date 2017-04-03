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
          if(!bookReadStream.isPaused()) {
             bookWriteStream.write(data.toString()) 
          }

          if(!bookToAuthorsChunk.book) {
            if(data.toString().indexOf('{') === 0) {    
              bookToAuthorsChunk.book = JSON.parse(data.toString()) 
            }
          }

          if(bookToAuthorsChunk.book) {
            bookReadStream.pause()
            detectFullfieldData()
            
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

        if(!authorsReadStream.isPaused()) {
             authorsWriteStream.write(data.toString()) 
        }

        if(authorsTemp.length < 5 &&  data.toString().indexOf('{') === 0 ) {
          authorsTemp.push(JSON.parse(data.toString()))
        }

        if(authorsTemp.length === 5) {
          authorsReadStream.pause()
          detectFullfieldData()
        }   
    })
    .on('finish', () => {
      resolve()
    })
  })
}

  
function detectFullfieldData() {

         if(bookToAuthorsChunk.book) {
            if(authorsTemp.length < 5) {
              bookReadStream.pause()
              authorsReadStream.resume()
            } else {
              authorsTemp = []
              console.log(bookToAuthorsChunk.book)
              bookToAuthorsChunk.book = null
            }
          } else {
              bookReadStream.resume()
          }

        //  const addNewLine = chunkCounter ? ',\n' : '';
        //  if(bookToAuthorsChunk.book) {

        //     bookToAuthorsWriteStream.write(`${addNewLine}${JSON.stringify(bookToAuthorsChunk, null , 2, 'utf-8')}`, () => {
        //       console.log(bookToAuthorsChunk)
        //       // bookToAuthorsChunk = {
        //       //   book : null,
        //       //   authors : []
        //       // }
               
        //     }) 
           
        //     chunkCounter++;
        //  }
         
        // }

        
        // if(authorsTemp.length === 5 ) {
        //   bookToAuthorsChunk.authors = authorsTemp
        // }
        // bookToAuthorsChunk.book = null

   
        // bookToAuthorsChunk.book = null
        // if(bookReadStream.isPaused()) {
        //   bookReadStream.resume()
        // }
        // if(authorsReadStream.isPaused()) {
        //   authorsReadStream.resume()
        // }
      //  let arrayLength =  Math.floor(Math.random() * (4 - 1 + 1)) + 1;
      //   while(bookToAuthorsChunk.authors.length <= arrayLength) {
      //     let index = Math.floor(Math.random() * (authorsTemp.length - 1)) + 1;
      //     let elem = authorsTemp.splice(index, 1);
      //     bookToAuthorsChunk.authors.push(elem[0]);
      //    }
      //    const addNewLine = chunkCounter ? ',\n' : '';
      //    bookToAuthorsWriteStream.write(`${addNewLine}${JSON.stringify(bookToAuthorsChunk, null , 2, 'utf-8')}`) 
      //    chunkCounter++;

      //  } 
      
}


