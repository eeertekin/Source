// .src files support

var fs = require('fs'),
    ejs = require('ejs'),
    getHeaderAndFooter = require('../headerFooter/headerFooter').getHeaderAndFooter;

var userTemplatesDir = __dirname + "/../../user/views/",
    coreTemplatesDir = __dirname + "/../views/";

function serveContent(filePath, pathToSpec, res) {
    fs.exists(filePath, function(exists) {

        if(exists) {
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) {
                    res.send(err);
                } else {

                    var info = {
                        title: "New spec",
                        author: "Anonymous"
                    };

                    if(fs.existsSync(pathToSpec + 'info.json')) {
                        info = require(pathToSpec + 'info.json');
                    }

                    var headerFooter = getHeaderAndFooter();

                    var template;

                    if(fs.existsSync(userTemplatesDir + "index.ejs")) {
                        template = fs.readFileSync(userTemplatesDir + "index.ejs", "utf-8");
                    } else {
                        template = fs.readFileSync(coreTemplatesDir + "index.ejs", "utf-8");
                    }

                    var html = ejs.render(template, {
                        title: info.title,
                        author: info.author,
                        content: data,
                        header: headerFooter.header,
                        footer: headerFooter.footer
                    });

                    res.send(html);
                }

            });
        } else {
            res.status(404).render('index', {
                title: "Spec not found",
                author: "Source",
                content: "Sorry, page not found"
            });
        }
    });
}

function doRedirect(pathToSpec, specURI, res) {
    fs.exists(pathToSpec + "index.src", function(exists) {
        if(exists) {
            res.redirect(specURI + "index.src")
        } else {
            res.redirect(specURI + "index.html")
        }
    });
}

global.app.set('view engine', 'ejs');
global.app.get('/:dir/:spec/:file.src', function(req, res){
    var dir = req.params.dir
            , spec = req.params.spec
            , file = req.params.file
            , pathToSpec = __dirname + "/../../" + global.opts.common.pathToSpecs + '/' + dir + "/" + spec + "/"
            , specFile = file + ".src";

    var filePath =  pathToSpec + specFile;

    serveContent(filePath, pathToSpec, res)

});

global.app.get('/:dir/:spec/:sub/:file.src', function(req, res){
    var dir = req.params.dir
            , spec = req.params.spec
            , sub = req.params.sub
            , file = req.params.file
            , pathToSpec = __dirname + "/../../" + global.opts.common.pathToSpecs + '/' + dir + "/"  + spec + "/" + sub + "/"
            , specFile = file + ".src";

    var filePath =  pathToSpec + specFile;

    serveContent(filePath, pathToSpec, res)

});

/*
* if *.src file exists - show templated content, else show static html
* */
global.app.get('/:dir/:spec/', function(req, res){
    var dir = req.params.dir
            , spec = req.params.spec
            , specURI = dir + "/" + spec + "/"
            , pathToSpec = __dirname + "/../../" + global.opts.common.pathToSpecs + '/' + dir + "/" + spec + "/";

    doRedirect(pathToSpec, specURI, res);
});

global.app.get('/:dir/:spec/:sub/', function(req, res){
    var dir = req.params.dir
            , sub = req.params.sub || ""
            , spec = req.params.spec
            , specURI = dir + "/" + spec + "/" + sub + "/"
            , pathToSpec = __dirname + "/../../" + global.opts.common.pathToSpecs + '/' + dir + "/" + spec + "/" + sub + "/";

    doRedirect(pathToSpec, specURI, res);
});

exports.getHeaderAndFooter = getHeaderAndFooter;