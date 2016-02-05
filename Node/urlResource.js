var urlResource = function() {};
urlResource.parse = function(path) {
    if (!path) return [];
    var resourcesPath = path;
    if (path.slice(0, 1) === "/") {
        resourcesPath = resourcesPath.slice(1);
    }
    
    if (!resourcesPath) return [];
    if (resourcesPath.slice(-1) === "/") {
        resourcesPath = resourcesPath.slice(0, resourcesPath.length - 1);    
    }
    
    var resources = resourcesPath.split(/\//);    
    return resources;
};

module.exports = urlResource;