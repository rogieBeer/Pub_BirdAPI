const express = require('express')
const router = express.Router()
const Bird = require('../models/bird')
const fetch = require('node-fetch');
const wiki = require('wikijs').default
const cors = require('cors');

// Get
router.get('/', async (req, res) => {
    try {
        const birds = await Bird.find()
        res.setHeader('Content-Type', 'application/json');
        res.json(birds)
    }catch (err) {
        res.status(500).json({message: err.message})
    }
})


// Get Bird by ID
router.get('/:id', getBirdID, (req, res) => {
    res.send(res.bird)
})


// Create
router.post('/', cors(), async (req, res) => {
    try {
        let search = req.body.binomialName
        // Uses wiki api to get general page info
        let wikiSearch = await fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=1&srsearch=" + search)
        .then(resp => resp.json())
        wikiSearch = wikiSearch.query.search[0]
    
        // https://api.gbif.org/
        let gbif = await fetch("https://api.gbif.org/v1/species/?name=" + search)
        .then(resp => resp.json())
    
        // Uses wiki api to get summary
        let pageSummary = await wiki().page(search).then(page => page.summary())
    
        // Uses Xeno Canto api to grab all sonographs and audio files
        let xenoCanto = await fetch("https://www.xeno-canto.org/api/2/recordings?query=" + search)
        .then(resp => resp.json())
    
        gbif = gbif.results[0]
        // creates the ID from the binomial name
        let createID = search
        createID = createID.replace(/\s/g, "_")
        createID = createID.toLowerCase()
        // Creates a Bird
        const bird = new Bird()
        bird._id = createID;
        bird.binomialName = req.body.binomialName
        if (gbif.genus != null) {
            bird.genus = gbif.genus
        }
        if (gbif.order != null) {
            bird.order = gbif.order
        }
        if (wikiSearch.title != null) {
            bird.commonName = wikiSearch.title
        }
        let species = gbif.species
        if (gbif.species != null) {
            bird.species = species.substr(species.indexOf(" ") + 1);
        }
        if (wikiSearch.pageid != null) {
            bird.wikiID = wikiSearch.pageid
        }
        if (pageSummary != null) {
            bird.summary = pageSummary
        }
        if (xenoCanto != null) {
            bird.xenoCanto = xenoCanto.recordings[0]
        }
        if (req.body.uploadedAudio != null) {
            bird.uploadedAudio = req.body.uploadedAudio
        }
        if (req.body.habitat != null) {
            bird.habitat = req.body.habitat
        }
        if (req.body.statusEndemic != null) {
            bird.statusEndemic = req.body.statusEndemic
        }
        if (req.body.modules != null) {
            bird.modules = req.body.modules
        }
        if (req.body.confusiable != null) {
            bird.confusiable = req.body.confusiable
        }
        if (req.body.callLevel != null) {
            bird.callLevel = req.body.callLevel
        }
        if (req.body.mainImage != null) {
            bird.mainImage = req.body.mainImage
        }
        if (req.body.maoriNames != null) {
            bird.maoriNames = req.body.maoriNames
        }
        bird.dir = "https://heroku-birdv2-api.herokuapp.com/birds/" + createID
        bird.showContent = true
        bird.showxenoCanto = true
        if (wikiSearch.title == null || xenoCanto.recordings[0] == null){
            res.status(400).json({message: err.message})
        }
        else {
            try {
                const newBird = await bird.save()
                res.setHeader('Content-Type', 'application/json');
                res.status(201).json(newBird)
            }catch (err){
                res.status(400).json({message: err.message})
            }
        }
    } catch (error) {
        res.status(400).json({message: err.message})
    }
   
    
})

// Update
router.patch('/:id', getBirdID, async (req, res) => {
    if (req.body.commonName != null) {
        res.bird.commonName = req.body.commonName
    }
    if (req.body.order != null) {
        res.bird.order = req.body.order
    }
    if (req.body.genus != null) {
        res.bird.genus = req.body.genus
    }
    if (req.body.species != null) {
        res.bird.species = req.body.species
    }
    if (req.body.binomialName != null) {
        res.bird.binomialName = req.body.binomialName
    }
    if (req.body.maoriNames != null) {
        res.bird.maoriNames = req.body.maoriNames
    }
    if (req.body.summary != null) {
        res.bird.summary = req.body.summary
    }
    if (req.body.conservationStatus != null) {
        res.bird.conservationStatus = req.body.conservationStatus
    }
    if (req.body.statusEndemic != null) {
        res.bird.statusEndemic = req.body.statusEndemic
    }
    if (req.body.habitat != null) {
        res.bird.habitat = req.body.habitat
    }
    if (req.body.modules != null) {
        res.bird.modules = req.body.modules
    }
    if (req.body.confusiable != null) {
        res.bird.confusiable = req.body.confusiable
    }
    if (req.body.callLevel != null) {
        res.bird.callLevel = req.body.callLevel
    }
    if (req.body.uploadedAudio != null) {
        res.bird.uploadedAudio = req.body.uploadedAudio
    }
    if (req.body.mainImage != null) {
        res.bird.mainImage = req.body.mainImage
    }
    try {
        const updatedBird = await res.bird.save()

        res.json(updatedBird)
    }
    catch (err) {
        res.status(400).json({message: err.message})
    }
})

// Delete
router.delete('/:id', getBirdID, async (req, res) => {
    try {
        await res.bird.remove()
        res.json({message: 'Bird Deleted'})
    }
    catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.options('*', cors())

async function getBirdID(req, res, next) {
    let bird
    try {
        bird = await Bird.findById(req.params.id)
        if (bird == null) {
            return res.status(404).json({message: 'Cannot find Bird',
        body : req.body})
        }
    }catch (err){
        return res.status(500).json({message: err.message})
    }
    res.bird = bird
    next()
}


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 


module.exports = router