var chai = require('chai')
var expect = chai.expect
var persistency = require('../Node/persistencyFile.js')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf')

describe('persistencyFile', function() {
    before((done) => {
        persistency.setTestMode(true)
        rimraf(persistency.getPath(), () => {
            done()    
        })
    })
    
   it ('should give storage path', function() {
       var path = persistency.getPath()
       expect(path).to.equal('localstoragetest')
   })
   
   it('should store new document in new file', function(done) {
       persistency.store(JSON.stringify({ data: 'test'}), function(key) {
           var filePath = persistency.getPath(key)
            fs.exists(filePath, function(exists) {
                expect(exists).to.be.true
                done()
            })    
       })
   })
   
   it('should give path for key', function() {
       var key = 'file'
       expect(persistency.getPath(key)).to.equal('localstoragetest/file')
   })
   
   it('should read data from file', function(done) {
       var expectedData = "myData"
       persistency.store(JSON.stringify({ data: expectedData}), function(key) {
           persistency.read(key, function(readData) {
               expect(readData.data).to.equal(expectedData)
               done()
           })
       })
   })
   
   it('should give a unique key', (done) => {
       var json = JSON.stringify({})
       persistency.store(json, (key1) => {
           persistency.store(json, (key2) => {
               expect(key1).not.to.equal(key2)
               done()
           })
       })
   })
   
   // todo: update and index
})