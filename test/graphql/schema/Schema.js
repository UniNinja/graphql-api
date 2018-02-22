const graphql = require('graphql')

const Universities = require('../../models/Universities')
const fakeDatabase = {};
// fill the fakeDatabase with some todos
(function() {
  const universities = ["Sussex", "Brighton"];
  universities.map(universities => {
    const newUniversities = new Universities(universities);
    fakeDatabase[newUniversities.id] = newUniversities
  });
})()

// define the Universities type for graphql
const UniversitiesType = new graphql.GraphQLObjectType({
  name: 'universities',
  description: 'a university item',
  fields: {
    id: {type: graphql.GraphQLInt},
    name: {type: graphql.GraphQLString},
    //done: {type: graphql.GraphQLBoolean}
  }
})

// define the queries of the graphql Schema
const query = new graphql.GraphQLObjectType({
  name: 'UniversitiesQuery',
  fields: {
    universities: {
      type: new graphql.GraphQLList(UniversitiesType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, {id}) => {
        if (id)
          return [fakeDatabase[id]];
        return Object.values(fakeDatabase);
      }
    }
  }
})


// define the mutations of the graphql Schema
const mutation = new graphql.GraphQLObjectType({
  name: 'UniversitiesMutation',
  fields: {
    createUniversities: {
      type: new graphql.GraphQLList(UniversitiesType),
      args: {
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {name}) => {
        const newUniversities = new Universities(name);
        fakeDatabase[newUniversities.id] = newUniversities;
        return Object.values(fakeDatabase);
      }
    },
    checkUniversities: {
      type: new graphql.GraphQLList(UniversitiesType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        //fakeDatabase[id].done = true;
        return Object.values(fakeDatabase);
      }
    },
    deleteUniversities: {
      type: new graphql.GraphQLList(UniversitiesType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        delete fakeDatabase[id];
        return Object.values(fakeDatabase);
      }
    }
  }
})

// create and exports the graphql Schema
module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})
