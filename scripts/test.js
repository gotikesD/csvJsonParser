const { BOOKS_COUNT, AUTHORS_COUNT } = require('../config/');
const fs = require('fs');
const CSV = require('csv-string');
const _  = require('lodash');


function readFile(path, flag) {
	return new Promise((resolve, reject) => {
		fs.readFile(__dirname + path, 'utf-8', (err,data) => {
			if(err) {
				console.log(err)
			}
			
			resolve(data)
		})
	})
}

describe("Testing csv length", function(){
	this.timeout(15000);

    it("Books csv length",(done) => {

    	readFile('/../generated/csv/books.csv')
			.then((data) => {
				const arr = CSV.parse(data);
	    		if(arr.length === BOOKS_COUNT ) {
	    			done()
	    		}
			})
	})

	it("Authors csv length",(done) => {
	    readFile('/../generated/csv/authors.csv')
			.then((data) => {
				const arr = CSV.parse(data);
	    		if(arr.length === AUTHORS_COUNT ) {
	    			done()
	    		}
			})
		})

})


describe("Testing json fullfield", function(){
	this.timeout(15000);
	it("Books csv and json equality",(done) => {
    	readFile('/../generated/csv/books.csv')
			.then((books) => {
				readFile('/../generated/json/book.json')
				.then((jsonBooks) => {
					//First csv line are headers
					if(CSV.parse(books).slice(1).length === JSON.parse(jsonBooks).length) {
						done()
					}
				})
			})
		})

	it("Authors csv and json equality",(done) => {
    	readFile('/../generated/csv/authors.csv')
			.then((authors) => {
				readFile('/../generated/json/authors.json')
				.then((jsonAuthors) => {
					//First csv line are headers
					if(CSV.parse(authors).slice(1).length === JSON.parse(jsonAuthors).length) {
						done()
					}
				})
			})
		})

	it("Books in booksToAuthors",(done) => {
    	readFile('/../generated/csv/books.csv')
			.then((books) => {
				readFile('/../generated/json/bookToAuthors.json')
				.then((bookToAuthors) => {
					// First csv line are headers

					if(CSV.parse(books).slice(1).length === JSON.parse(bookToAuthors).length) {
						done()
					}
				})
			})
		})
	})

describe("Testing json fullfield",function() {
	this.timeout(15000);

	it("Books csv and json equality",(done) => {
    	readFile('/../generated/csv/books.csv')
			.then((books) => {
				readFile('/../generated/json/bookToAuthors.json')
				.then((bookToAuthors) => {
					let totalAuthorsCount = 0;
					let err = false;
					JSON.parse(bookToAuthors).forEach((e) => { 
						totalAuthorsCount += e.authors.length
						if(e.authors.length != 2) {
							err = true
						}
					})
					if(!err) {
						done()
					}
				})
			})
		})
	})

