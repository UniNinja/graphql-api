import fetch from 'node-fetch'
import {readFileSync} from 'fs'
import {makeExecutableSchema} from 'graphql-tools'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import {MongoClient} from 'mongodb'
import {PassThrough} from 'stream'

const app = express()
const MAJOR_VERSION_NUMBER = '/v1'
const uri = 'mongodb://' + process.env.MONGODB_USERNAME +
  ':' + process.env.MONGODB_PASSWORD +
  '@unininja-cluster-shard-00-00-d1bwx.mongodb.net:27017,' +
  'unininja-cluster-shard-00-01-d1bwx.mongodb.net:27017,' +
  'unininja-cluster-shard-00-02-d1bwx.mongodb.net:27017' +
  '/uni?ssl=true&replicaSet=unininja-cluster-shard-0&authSource=admin'

let database = null
let dbConnection = null

const schema = makeExecutableSchema({
  typeDefs: readFileSync('schema.graphql', 'utf8'),
  resolvers: {
    Query: {
      university: (obj, args, context) => getUniversity(args.pubukprn),
      universities: () => getUniversities(),
      courses: (obj, args, context) => getCourses(args.pubukprn),
      course: (obj, args, context) => getCourseInfo(args.pubukprn, args.kiscourseid, args.isFullTime)
    },
    University: {
      courses: (obj, args, context) => getCourses(obj.pubukprn),
      campuses: (obj, args, context) => {
        return obj.campuses.map(campus => ({
          name: campus.name,
          location: campus.location,
          locationType: campus.locationType,
          nearestTrainStation: campus.nearestStation,
          averageRent: campus.averageRent
        }))
      }
    },
    Campus: {
      nearestTrainStation: (obj, args, context) => {
        if (obj.nearestTrainStation) {
          return {
            name: obj.nearestTrainStation.name,
            code: obj.nearestTrainStation.code,
            location: obj.nearestTrainStation.location,
            distance: obj.nearestTrainStation.distance
          }
        } else {
          return null
        }
      }
    },
    TrainStation: {
      location: (obj, args, context) => ({lat: obj.location.lat, lon: obj.location.lon})
    }
  }
})

/**
  * Returns a list of all universities with their Name & pubukprn.
  * @return {Object}  promise - The json list of all universities.
  */
function getUniversities () {
  return database.collection('unis').find().toArray()
}

/**
  * Gets specific information for the requested university from MongoDB & Unistats.
  * @param {string} pubukprn - The university identifier.
  * @return {JSON OBJECT} promise - the JSON oject of university information.
  */

function getUniversity (pubukprn) {
  return database.collection('unis').findOne({ pubukprn: pubukprn })
}

/**
  * Gets all the courses for a specific university.
  * This will never usually be called by itself, but through a university.
  * @param {string} pubukprn - The university identifier.
  * @return {Array[Objects]} promise - An array of JSON objects for courses for the university.
  */
function getCourses (pubukprn) {
  const promise = fetch('http://data.unistats.ac.uk/api/v4/KIS/Institution/' + pubukprn + '/Courses.json?pageSize=300', {
    headers: {
      'Authorization': 'Basic ' + process.env.UNISTATS_AUTH
    }
  }).then(function (response) {
    return response.json()
  }).then(res => {
    const uniStatsResponse = res
    let newJson = []

    for (let i = 0; i < uniStatsResponse.length; i++) {
      let newInnerJson = {}
      newInnerJson.title = uniStatsResponse[i].Title
      newInnerJson.kiscourseid = uniStatsResponse[i].KisCourseId
      newInnerJson.isFullTime = uniStatsResponse[i].KisMode
      newJson.push(newInnerJson)
    }

    return newJson
  }).then(res => {
    const courses = []
    for (let i = 0; i < res.length; i++) {
      courses.push(getCourseInfo(pubukprn, res[i].kiscourseid, res[i].isFullTime))
    }
    return courses
  }).catch(err => { throw new Error(err) })
  return promise
}

const send401Unauthorized = (res) => {
  res.status(401).set('WWW-Authenticate', 'Basic realm=\'UniNinja API\'').send({
    'errors': [
      {
        'message': 'You must be authorised to use the UniNinja API.'
      }
    ]
  })
}

const send503ServerError = (res, msg) => {
  const message = msg || 'An internal server error occurred whilst using the UniNinja API. Please try again later.'
  res.status(503).send({
    'errors': [
      {
        'message': message
      }
    ]
  })
}

app.use(MAJOR_VERSION_NUMBER, (req, res, next) => {
  MongoClient.connect(uri).then(connection => {
    dbConnection = connection
    database = connection.db(process.env.MONGODB_DATABASE)
    next()
  }).catch(err => {
    send503ServerError(res, err.message)
  })
})

app.use(MAJOR_VERSION_NUMBER, (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (authHeader) {
    const apiKey = Buffer.from(authHeader.substring(6), 'base64').toString().split(':', 1)[0]
    database.collection('keys').find({key: apiKey}).toArray(function (err, result) {
      if (err) {
        send503ServerError(res, err.message)
      } else {
        if (result.length > 0) {
          next()
        } else {
          send401Unauthorized(res)
        }
      }
    })
  } else {
    send401Unauthorized(res)
  }
})

/**
  * Gets specific information for the requested university from MongoDB & Unistats.
  * @param {string} pubukprn - The university identifier.
  * @param {string} kiscourseid - The course identifier.
  * @return {JSON OBJECT} promise - the JSON oject of course information.
  */
function getCourseInfo (pubukprn, kiscourseid, fullTime) {
  return fetch('http://data.unistats.ac.uk/api/v4/KIS/Institution/' + pubukprn + '/Course/' + kiscourseid + '/' + fullTime + '.json', {
    headers: {
      'Authorization': 'Basic ' + process.env.UNISTATS_AUTH
    }
  }).then(function (response) {
    return response.json()
  }).then(function (myJson) {
    return new Promise((resolve, reject) => {
      let placement = false
      let yearAbroad = false

      if (myJson.SandwichAvailable > 0) {
        placement = true
      }
      if (myJson.YearAbroadAvailable > 0) {
        yearAbroad = true
      }

      let returnJson = {}

      returnJson.title = myJson.KisAimLabel + ' ' + (myJson.Honours ? '(Hons) ' : '') + myJson.Title
      returnJson.kiscourseid = kiscourseid
      returnJson.isFullTime = fullTime === 'FullTime'
      returnJson.courseURL = myJson.CoursePageUrl

      if (myJson.LengthInYears) {
        returnJson.years = parseInt(myJson.LengthInYears)
      }

      returnJson.placementYearAvailable = placement
      returnJson.yearAbroadAvailable = yearAbroad
      returnJson.degreeLabel = myJson.KisAimLabel
      returnJson.isHons = myJson.Honours

      if (returnJson) {
        resolve(returnJson)
      } else {
        reject(new Error('Something went wrong but the promise flagged it up'))
      }
    })
  })
}

function graphqlMiddlewareWrapper (graphqlMiddleware) {
  return (req, res, next) => {
    const resProxy = new PassThrough()
    resProxy.headers = new Map()
    resProxy.statusCode = 200
    resProxy.setHeader = (name, value) => {
      resProxy.headers.set(name, value)
    }
    res.graphqlResponse = (cb) => {
      res.statusCode = resProxy.statusCode
      resProxy.headers.forEach((value, name) => {
        res.setHeader(name, value)
      })
      resProxy.pipe(res).on('finish', cb)
    }
    graphqlMiddleware(req, resProxy).then(() => next(), next)
  }
}

app.use(MAJOR_VERSION_NUMBER, graphqlMiddlewareWrapper(graphqlHTTP({schema, graphiql: true})), (req, res, next) => {
  dbConnection.close()
  res.graphqlResponse(next)
})

app.get('/', (req, res) => {
  res.redirect('https://uni.ninja')
})

app.listen('3000', _ => { console.log('Server is listening on port 3000...') })
