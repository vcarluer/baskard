var persistency = function() {}
var fs = require('fs')
var path = require('path')

persistency.setTestMode = function(activate) {
    this.testMode = activate
}

persistency.getPath = function(key) {
    var storePath = 'localstorage'
    if (this.testMode) storePath = storePath + "test"
    if (key) storePath += "/" + key
    return storePath
}

persistency.store = function(data, callback) {
    var self = this
    
    this.createBasePath(() => {
        self.nextIndex((index) => {
            var key = index.toString()
            var storePath = path.join(self.getPath(), key)
            console.log("storing " + storePath)
            fs.writeFile(storePath, data, 'utf8', (err) => {
                if (err) console.log(err)
                callback(key)
            })    
        })    
    })   
}

persistency.createBasePath = function(callback) {
    var basepath = this.getPath(), self = this
    fs.exists(basepath, (exists) => {
        if (!exists) {
            fs.mkdir(basepath, (err) => {
                callback()
            })
        } else {
            callback()   
        }
    })
}
persistency.nextIndex = function(callback) {
    var index = this.getPath('index')
    fs.exists(index, (exists) => {
        if (!exists) {
            fs.writeFile(index, '0', (err) => {
                callback(0)
            })
        } else {
            fs.readFile(index, (err, data) => {
                var next = parseInt(data)
                next = next + 1
                fs.writeFile(index, next, (err) => {
                    callback(next)
                })
            })
        }
    })
}

persistency.read = function(key, callback) {
    var storePath = this.getPath(key)
    fs.readFile(storePath, (err, data) => {
        if (err) {
            console.log(err)
            return
        }
        
        callback(JSON.parse(data))
    })
}

module.exports = persistency