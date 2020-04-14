var express = require('express');
var app = express();
var mongoose = require('mongoose');
var sm = require('sitemap')
const fs = require('fs');
var timestamp = require("unix-timestamp")
const Fuse = require("fuse.js");


const port = 8080;

// Set Static Path
app.use(express.static("public"));

// SITEMAP



var sitemap = sm.createSitemap({
    hostname: 'https://www.cgbookcase.com',
    cacheTime: 6000,        // 6 sec - cache purge period
    urls: [
        { url: '/textures', changefreq: 'weekly', priority: 1 },
        { url: '/tutorials', changefreq: 'weekly', priority: 1 },
        { url: '/blog', changefreq: 'weekly', priority: 0.8 },
        { url: '/blog/new-site-and-roadmap-for-texture-creation-course', changefreq: 'monthly', priority: 0.5 },
        { url: '/texture-course', changefreq: 'monthly', priority: 0.8 },
        { url: '/privacy-and-cookies', changefreq: 'monthly', priority: 0.2 },
        { url: '/license-information', changefreq: 'monthly', priority: 0.2 },
        { url: '/tutorials/how-to-create-3d-interactive-web-experiences-in-blender-verge-3d', changefreq: 'monthly', priority: 0.3 },
        { url: '/textures/how-to-use-pbr-textures-in-blender', changefreq: 'monthly', priority: 0.6 },
        { url: '/textures/how-to-use-pbr-textures-in-godot', changefreq: 'monthly', priority: 0.6 },
        { url: '/textures/how-to-use-pbr-textures-in-unreal-engine', changefreq: 'monthly', priority: 0.6 },
        { url: '/request-a-texture', changefreq: 'monthly', priority: 0.6 },
    ]
});

fs.readFile('public/textures.json', (err, data_posts) => {
    if (err) throw err;
    const allTextures = JSON.parse(data_posts);

    let textureURLs = [];
    for (let i = 0; i < allTextures.length; i++) {
        textureURLs.push(allTextures[i].url);
    }

    for (let i = 0; i < allTextures.length; i++) {
        sitemap.add({ url: '/textures/' + textureURLs[i], changefreq: 'monthly', priority: 0.2 })
    }
});

app.get('/sitemap.xml', function (req, res) {
    sitemap.toXML(function (err, xml) {
        if (err) {
            return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});


// ROUTES
app.get("/", function (req, res) {
    fs.readFile('public/textures.json', (err2, data_posts) => {
        if (err2) throw err2;
        let allTextures = JSON.parse(data_posts);

        fs.readFile('public/patrons.json', (err3, data_patrons) => {
            if (err3) throw err3;
            let allPatrons = JSON.parse(data_patrons);

            res.render("home.ejs", { textures: allTextures, patrons: allPatrons });
        });


    });
});

app.get("/texture-course", function (req, res) {
    res.render("texture-course.ejs");
});


function searchInObject(arr, searchKey) {
    return arr.filter(function (obj) {
        return Object.keys(obj).some(function (key) {
            return obj[key].includes(searchKey);
        })
    });
}

app.get("/blog", function (req, res) {

    fs.readFile('public/blog/articles.json', (err, data_posts) => {
        if (err) throw err;
        let blogPosts = JSON.parse(data_posts);
        console.log(blogPosts);
       
        res.render("blog.ejs", {posts: blogPosts});

    });
});

app.get("/blog/:url", function (req, res) {
    fs.readFile('public/blog/articles.json', (err, data_posts) => {
        if (err) throw err;
        let blogPosts = JSON.parse(data_posts);
        console.log(blogPosts);
        let post = searchInObject(blogPosts, req.params.url)[0];
        console.log()
        console.log(req.params.url)
        console.log(post)
        console.log()

        fs.readFile('public/textures.json', (err2, data_posts) => {
            if (err2) throw err2;
            let allTextures = JSON.parse(data_posts);
            res.render("blog/_view_blog_post.ejs", { post: post, textures: allTextures});

        });
    });

});

// app.get("/blog/new-site-and-roadmap-for-texture-creation-course", function (req, res) {
//     res.render("new-site.ejs");
// });



app.get("/privacy-and-cookies", function (req, res) {
    res.render("privacy-and-cookies.ejs");
});

app.get("/license-information", function (req, res) {
    res.render("license-information.ejs");
});

app.get("/tutorials", function (req, res) {
    res.redirect("/learn")
});


app.get("/learn", function (req, res) {
    res.render("tutorials.ejs");
});

app.get("/license-information", function (req, res) {
    res.render("license-information.ejs");
});


app.get("/tutorials/how-to-create-3d-interactive-web-experiences-in-blender-verge-3d", function (req, res) {
    res.redirect("/learn/how-to-create-3d-interactive-web-experiences-in-blender-verge-3d");
});

app.get("/learn/how-to-create-3d-interactive-web-experiences-in-blender-verge-3d", function (req, res) {
    res.render("view_tutorial.ejs", { path: "v3d_interior", year: "2018", req: req });
});

app.get("/learn/immersion-vr-substance-designer-breakdowns", function (req, res) {
    res.redirect("/learn/immersion-vr-substance-designer-material-breakdowns");
});

app.get("/learn/immersion-vr-substance-designer-material-breakdowns", function (req, res) {
    res.render("view_breakdowns.ejs", { path: "v3d_interior", year: "2018", req: req });

});


app.get("/textures", function (req, res) {

    var color = req.query.color;
    var search = req.query.search;
    console.log("SEARCH")
    console.log(search)
    if (search == "") {
        console.log("empty string");
    } else {
        console.log("isches nöd")
    }

    var resolution = 1
    if (req.query.resolution) {
        resolution = Number(req.query.resolution);
    }

    var category = req.query.category;
    var page = 1;

    if (req.query.page) {
        page = Number(req.query.page);
    }
    var offset = page - 1;
    var limit = 64;

    if (color == "all") { color = ""; }

    var searchObject = {};

    if (color != "" && color != undefined) {
        Object.assign(searchObject, { "colors": color })
    }

    if (search != "" && search != undefined) {
        Object.assign(searchObject, { "tags": search })
    }

    if (category != "All" && category != undefined) {
        Object.assign(searchObject, { "category": category })
    }

    console.log("==========================");
    console.log(searchObject);
    console.log("==========================");





    fs.readFile('public/textures.json', (err, data_posts) => {
        if (err) throw err;
        const allTextures = JSON.parse(data_posts);

        let bShouldSort = false;
        if (search) bShouldSort = false; // might change this to true later, when implementing a feature for the user to sort by date, relevance or popularity

        const options = {
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2,
            findAllMatches: true,
            threshold: 0.2,
            shouldSort: bShouldSort,
            keys: ["title", "tags", "category"]
        }

        const fuse = new Fuse(allTextures, options);



        function applyFilters(in_array, out_array, bSubobject) {
            in_array.forEach((e) => {

                let obj;
                (bSubobject) ? obj = e.item : obj = e;

                // Check if color is in array
                let bHasColor = false;

                console.log("cate")
                console.log(category)



                obj.colors.forEach(e_color => {
                    if (e_color == color || color == "" || color == undefined) {
                        bHasColor = true;
                    }
                })

                console.log(bHasColor)

               

                console.log(obj.resolution)
                if (obj.resolution >= resolution && (category == "All" || obj.category == category || category == undefined) && bHasColor) {
                    out_array.push(obj);
                }
            })
        }

        let validResults = [];

        if (search == "" || search == undefined) {
            console.log("yaaay")
            console.log(allTextures.length)

            applyFilters(allTextures, validResults, false);

        } else {
            console.log("nicht leer")

            let searchResults = fuse.search(search);
            applyFilters(searchResults, validResults, true);
        }

        console.log(validResults.length.toString(), "textures found")


        // Skipping textures at the start of the array
        console.log(validResults[0]);
        validResults = validResults.slice(offset * limit, offset * limit + limit);
        console.log(validResults[0]);


        console.log("Offset:", offset)
        console.log("Limit:", limit)
        console.log("**:", offset * limit)
        console.log("Reduced to", validResults.length.toString())


        // // Limit the amount of textures
        // if (validResults.length > limit) validResults.length = limit;


        console.log("Reduced to", validResults.length.toString())


        fs.readFile('public/blog/articles.json', (err2, data_posts) => {
            if (err2) throw err2;
            let blogPosts = JSON.parse(data_posts);
            //console.log(blogPosts);

            fs.readFile('public/patrons.json', (err3, data_patrons) => {
                if (err3) throw err3;
                let allPatrons = JSON.parse(data_patrons);



                res.render("textures.ejs", { textures: validResults, patrons: allPatrons, req: req, limit: limit, blogPost: blogPosts[0] });

            });


        });

    });
});


app.get("/textures/how-to-use-pbr-textures-in-blender", function (req, res) {
    res.render("blender-guide.ejs", { textures: "null", req: req });
});

app.get("/textures/how-to-use-pbr-textures-in-unreal-engine", function (req, res) {
    res.render("unreal-guide.ejs", { textures: "null", req: req });
});

app.get("/textures/how-to-use-pbr-textures-in-godot", function (req, res) {
    res.render("godot-guide.ejs", { textures: "null", req: req });
});


app.get("/textures/:url", function (req, res) {

    fs.readFile('public/textures.json', (err2, data_posts) => {
        if (err2) throw err2;
        let allTextures = JSON.parse(data_posts);

        const options = {
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2,
            findAllMatches: true,
            threshold: 0,
            keys: ["url"]
        }

        const fuse = new Fuse(allTextures, options);
        let searchResults = fuse.search(req.params.url);

        console.log(searchResults[0].item)

        res.render("view_texture.ejs", { texture: searchResults[0].item, req: req });


    });
});

app.get("/request-a-texture", function (req, res) {
    res.render("texture-requests.ejs");
});


// Redirect old "/downloads" to "/textures"
app.get("/downloads", function (req, res) {
    res.redirect('/textures');
});

app.get("/downloads/:url", function (req, res) {
    res.redirect('/textures/' + req.params.url);
});

// Other routes



// Textures.one

app.get("/textures-list", function (req, res) {
    fs.readFile('public/textures.json', (err, data_posts) => {
        if (err) throw err;
        const allTextures = JSON.parse(data_posts);
        let textureURLs = [];
        for (let i = 0; i < allTextures.length; i++) {
            textureURLs.push(allTextures[i].url)
        }
        res.render("textures-list-one.ejs", { textures: textureURLs });
    });
});


// 404 page
app.use(function (req, res, next) {
    res.render("404.ejs");
});


app.listen(port, "localhost", function () {
    console.log("Eeeh, de Server lauft uf Port " + port);
});