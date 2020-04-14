const Fuse = require("fuse.js");
const fs = require('fs');

const list = [
    {
        title: "Bark 09",
        resolution: 4,
        colors: [
            "brown",
            "green"
        ],
        category: "Bark",
        tags: [
            "bark",
            "wood",
            "forest",
            "tree",
            "nature",
        ]
    },

    {
        title: "Square Tiles 02",
        resolution: 2,
        colors: [
            "white",
            "grey"
        ],
        category: "Tiles",
        tags: [
            "bark tree",
            "bathroom",
            "interior",
            "kitchen",
            "floor",
        ]
    },

    {
        title: "Rag 01",
        resolution: 2,
        colors: [
            "blue",
        ],
        category: "Fabric",
        tags: [
            "cloth",
            "fabric",
            "rag",
            "cleaning",
        ]
    },
]

fs.readFile('public/textures.json', (err, data_posts) => {
    if (err) throw err;
    const allTextures = JSON.parse(data_posts);
    
    const options = {
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        findAllMatches: true,
        threshold: 0.2,
        shouldSort: true,

        keys: ["title", "tags", "category"]
    }
    
    const fuse = new Fuse(allTextures, options);
    
    const result = fuse.search("rocks");
    
    
    console.log("Result:")
    console.log(result)
    
    console.log("")
    
    console.log(result.length.toString(), "textures found")
});


//console.log(result[1].matches[0]);