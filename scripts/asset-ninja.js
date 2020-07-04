const fs = require('fs');
var timestamp = require("unix-timestamp")

fs.readFile('public/textures.json', (err, data_posts) => {
    if (err) throw err;
    const data = JSON.parse(data_posts);

    let allTextures = [];

    console.log("Length", data.length)
    let numberAdded = 0;
    for (let x = 0; x < data.length; x++) {
        if (data[x].category == "Leaves & Plants" || data[x].category == "Patterns" || data[x].category == "Surface Imperfections" || ( data[x].cgbID >= 408  && data[x].cgbID <= 433 ) ) {
            //console.log("Skipped", data[x].title);
            continue;
        }

        numberAdded++;
        let mapObjects = {}

        // console.log("Adding", data[x].title + "...")
        // console.log(data[x].category, "cgbID:", data[x].cgbID)

        for (let i = data[x].resolution; i > 0; i--) {
            //console.log("Res: " + i);


            if ((data[x].category == "Metal" || data[x].title == "Copper Tiles 01" || data[x].title == "Thin Stainless Steel Tiles 01") && data[x].files.includes("Metallic") == false) {
                console.log(data[x].title, "needs a white metallic map in", i + "K resolution.")

                let currentObject = {
                    file: {
                        url: "https://www.cgbookcase.com/textures/Metallic.png",
                        format: 'png'
                    },
                    type: "Metallic",
                    variants: [
                        {
                            Format: "png",
                            Resolution: i + "k"
                        }
                    ]
                }

                mapObjects[i + "K_" + "Metallic"] = currentObject;
            }



            for (let j = 0; j < data[x].files.length; j++) {


                let typeMap = [
                    { cgb: "AO", ninja: "Ambient Occlusion" },
                    { cgb: "Base_Color", ninja: "Base Color" },
                    { cgb: "Height", ninja: "Displacement" },
                    { cgb: "Mask", ninja: "Mask" },
                    { cgb: "Normal", ninja: "Normal" },
                    { cgb: "Roughness", ninja: "Roughness" },
                    { cgb: "Base_Color_A", ninja: "Base Color" },
                    { cgb: "Base_Color_B", ninja: "Base Color Var 1" },
                    { cgb: "Base_Color_C", ninja: "Base Color Var 2" },
                    { cgb: "Metallic", ninja: "Metallic" },
                    { cgb: "Variation", ninja: "Variation" },
                ]


                function filterIt(arr, searchKey) {

                    return arr.filter(function (obj) {
                        return Object.keys(obj).some(function (key) {
                            return obj[key].includes(searchKey);
                        })
                    });
                }

                // console.log()
                // console.log("find", data[x].files[j])
                // console.log("Asset Ninja calls this", filterIt(typeMap, data[x].files[j])[0].ninja);
                // console.log()



                let currentObject = {
                    file: {
                        url: "https://cdn.cgbookcase.cloud/file/cgbookcase/textures/downloads/" + data[x].file + "/" + data[x].file + "_" + i + "K_" + data[x].files[j] + ".png",
                        format: 'png'
                    },
                    type: filterIt(typeMap, data[x].files[j])[0].ninja,
                    variants: [
                        {
                            Format: "png",
                            Resolution: i + "k"
                        }
                    ]
                }

                mapObjects[i + "K_" + data[x].files[j]] = currentObject;
                //console.log(mapObjects);
            }
        }

        var releaseDateUnix = timestamp.fromDate(data[x].releasedate);

        //console.log(timestamp.fromDate("2019-05-01"))

        // if (data[x].releasedate) {
        //     console.log("TRUEEE")
        //     releaseDateUnix = timestamp.fromDate(data[x].releasedate)
        // }


        
        let textureObject = {
            assetId: data[x].url,
            typeUid: 'surface.maps',
            title: data[x].title,
            description: null,
            url: 'https://www.cgbookcase.com/textures/' + data[x].url,
            // tags: [
            //     'Planks',
            //     'Seamless'
            // ],
            tags: data[x].tags,
            licenseUid: 'cc.cc0.1',
            publishedOn: releaseDateUnix,
            y: 1,
            objects: mapObjects,
        }

        let t = data[x].title;
        let id = data[x].cgbID;
        if (t == "Bark 08" || t == "Bark 09") {
            textureObject.y = 3;
        }
        
        if (t == "Yield Line Road Marking 01") {
            textureObject.y = 0.125;
        }

        if (id >= 281 && id <= 316) {
            textureObject.y = 0.5;
        }

        

        allTextures.push(textureObject)
        //console.log("Added:", textureObject.title)

    }




    let json = JSON.stringify(allTextures, null, 2);

    fs.writeFile('public/asset-ninja.json', json, (err) => {
        if (err) throw err;
        console.log('Data written to file');
        console.log(numberAdded)
    });
    

});



