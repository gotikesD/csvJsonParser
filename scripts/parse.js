const fs = require('fs');
const csv = require('csv-streamify');

const generateBooks = require('./json/book.js');
const generateAuthors = require('./json/author.js');
const bookReadStream = fs.createReadStream('../generated/csv/books.csv');
const authorReadStream = fs.createReadStream('../generated/csv/authors.csv');
const bookToAuthorsWriteStream = fs.createWriteStream('../generated/json/bookToAuthors.json');


const newBookReadStream = bookReadStream.pipe(csv({columns: true, objectMode: true}));

const newAuthorsReadStream = authorReadStream.pipe(csv({columns: true, objectMode: true}));

const {startMemoryCheck} = require('../utils/memory.js')


const interval = setInterval(() => {
    let mem = startMemoryCheck();
    console.log(`Memory used - ${mem}`);
}, 300).unref();


let authorsTemp = [];
let bookToAuthorsChunk = {
    book: null,
    authors: []
}
let linesCount = 0;

// Promise.all([ generateBooks(), generateAuthors() ])
Promise.resolve()
    .then(() => {

        bookToAuthorsWriteStream.write(`[\n`)
        Promise.all([readBooks(), readAuthors()])
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
    });


function readBooks() {
    return new Promise((resolve, reject) => {


        newBookReadStream
            .on('data', (data) => {
                console.log('INSIDE BOOK DATA', data);

                if (!bookToAuthorsChunk.book) {
                    console.log('NO BOOK');
                    bookToAuthorsChunk.book = data;
                }

                if (bookToAuthorsChunk.book) {
                    newBookReadStream.pause();
                    console.log('BOOK STREAM PAUSED', newBookReadStream.isPaused())
                    detectData();
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

        newAuthorsReadStream
            .on('data', (data) => {

                console.log('INSIDE AUTHORS DATA', data)

                if (authorsTemp.length < 5) {
                    console.log('TEMP BEFORE', authorsTemp.length)
                    authorsTemp.push(data)
                    console.log('AUTHORS ARRAY', authorsTemp)
                    console.log('TEMP AFTER', authorsTemp.length)
                }


                if (authorsTemp.length === 5) {
                    newAuthorsReadStream.pause()
                    console.log('AUTHOR STREAM PAUSED', newAuthorsReadStream.isPaused())
                    detectData()
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


function detectData() {
    if (bookToAuthorsChunk.book && authorsTemp.length === 5) {
        console.log('INSIDE RULE');
        let arrayLength = Math.round(Math.random() * (4));
        while (bookToAuthorsChunk.authors.length <= arrayLength) {
            let index = Math.round(Math.random() * (authorsTemp.length - 1));
            let elem = authorsTemp.splice(index, 1);
            bookToAuthorsChunk.authors.push(elem[0]);
        }

        let newLine = linesCount ? ',\n' : ''
        bookToAuthorsWriteStream.write(`${newLine}${JSON.stringify(bookToAuthorsChunk, null, 2)}`);
        bookToAuthorsChunk = {
            book: null,
            authors: []
        };
        linesCount += 1;
        newBookReadStream.resume();
        console.log('BOOK STREAM RESUMED', newBookReadStream.isPaused())
        newAuthorsReadStream.resume();
        console.log('AUTHOR STREAM RESUMED', newAuthorsReadStream.isPaused())
    }
}

  




