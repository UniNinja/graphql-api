const graphql = require('graphql')
const University = require('../../models/University')

const fakeDatabase = {};

// fill the fakeDatabase with some universities
(function() {
  const universities = ["Sussex", "Brighton", "Surrey"];
  universities.map(university => {
    const newUniversity = new University(university);
    fakeDatabase[newUniversity.id] = newUniversity
  });
})()

// define the University type for graphql
const UniversityType = new graphql.GraphQLObjectType({
  name: 'university',
  description: 'a university item',
  fields: {
    id: {type: graphql.GraphQLInt},
    name: {type: graphql.GraphQLString},
    //done: {type: graphql.GraphQLBoolean}
  }
})

// define the queries of the graphql Schema
const query = new graphql.GraphQLObjectType({
  name: 'UniversityQuery',
  fields: {
    university: {
      type: new graphql.GraphQLList(UniversityType),
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
  name: 'UniversityMutation',
  fields: {
    createUniversity: {
      type: new graphql.GraphQLList(UniversityType),
      args: {
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {name}) => {
        const newUniversity = new University(name);
        fakeDatabase[newUniversity.id] = newUniversity;
        return Object.values(fakeDatabase);
      }
    },
    // checkUniversity: {
    //   type: new graphql.GraphQLList(UniversityType),
    //   args: {
    //     id: {
    //       type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    //     }
    //   },
    //   resolve: (_, {id}) => {
    //     //fakeDatabase[id].done = true;
    //     return Object.values(fakeDatabase);
    //   }
    // },
    deleteUniversity: {
      type: new graphql.GraphQLList(UniversityType),
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
