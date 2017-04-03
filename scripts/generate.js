const fs = require('fs');
const csv = require('csv');
const { startMemoryCheck } = require('../utils/memory.js')
const { BOOKS_COUNT, AUTHORS_COUNT, CONSOLE_CYCLE, MAX_MEMORY_USAGE } = require('../config/')
console.time('Generating Script Working Time');

let finish = {
  stream1 : false,
  stream2 : false
}

let booksCounter = 0;
let authorsCounter = 0;


const interval = setInterval(() => { 
  
	let mem = startMemoryCheck()
    console.log(`Memory used - ${mem}`);
	if(mem > MAX_MEMORY_USAGE) {
    console.log('Max memory usage reached!');
    interval.unref();
    process.exit();
	}
} , CONSOLE_CYCLE)




Promise.all([generateBook(), generateAuthors()])
       .then(() => {
        console.log('Generating CSV finished!')
        console.timeEnd('Generating Script Working Time');
        interval.unref()
       })


//Generating books

function generateBook() {
  return new Promise((resolve, reject) => {
    csv.generate({seed: 1, columns: ['int', 'int'], length: BOOKS_COUNT })
    .pipe(csv.parse())
    .pipe(csv.transform(function(record){

        if(booksCounter > 0) {
          record[0] = `id${booksCounter}`
          record[1] = `title${booksCounter}`
        } else {
            record[0] = `id`,
            record[1] = `title`
        }
        
        booksCounter++;
        return record
 
    }))
    .pipe(csv.stringify())
    .pipe(fs.createWriteStream('../generated/csv/books.csv'))
    .on('finish', () => {
      resolve()
    })
  })
}


//Generating authors

function generateAuthors() {
  return new Promise((resolve, reject) => {
    csv.generate({seed: 1, columns: ['int', 'int', 'int'],length : AUTHORS_COUNT })
    .pipe(csv.parse())
    .pipe(csv.transform(function(record){
        if(authorsCounter > 0) {
          record[0] = `id${authorsCounter}`
          record[1] = `firstName${authorsCounter}`
          record[2] = `lastName${authorsCounter}`
        } else {
          record[0] = `id`
          record[1] = `firstName`
          record[2] = `lastName`
        }
 
        authorsCounter++;
        return record
    }))
    .pipe(csv.stringify())
    .pipe(fs.createWriteStream('../generated/csv/authors.csv'))
    .on('finish', () => {
      resolve()
    })
  })
}

