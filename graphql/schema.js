const graphql = require('graphql');
const connectionString = 'postgres://developer:f7b391b19acafeb16ba6f1e4676a617e@37.57.205.178:5432/departamento';
const pgp = require('pg-promise')();
const db = {}
db.conn = pgp(connectionString);

const {
   GraphQLObjectType,
   GraphQLID,
   GraphQLString,
   GraphQLBoolean,
   GraphQLList,
   GraphQLSchema
} = graphql;

const StudentType = new GraphQLObjectType({
   name: 'Students',
   fields: () => ({
      id: { type: GraphQLID },
      first_name: { type: GraphQLString },
      last_name: { type: GraphQLString }
   })
})

const GroupType = new GraphQLObjectType({
    name: 'Groups',
    fields: () => ({
       id: { type: GraphQLID },
       acronym: { type: GraphQLString }
    })
 })

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
       students_by_group: {
       type: new GraphQLList(StudentType),
       args: { id: { type: GraphQLID } },
       resolve(parentValue, args) {
          const query = `select id, first_name, last_name from "user" inner join group_students gs on "user".id = gs.user_id where group_id = ${args.id}`;
          return db.conn.many(query)
             .then(data => {
                return data;
             })
             .catch(err => {
                 return 'The error is', err;
             });
       }
       },
       students: {
          type: new GraphQLList(StudentType),
          resolve() {
             const query = `SELECT * FROM "user"`;
             return db.conn.many(query)
                .then(data => {
                   return data;
                })
                .catch(err => {
                    return 'The error is', err;
                });
          }
       },
       groups: {
          type: new GraphQLList(GroupType),
          resolve() {
             const query = `select "g".id, acronym from program inner join "group" g on program.id = g.program_id`;
             return db.conn.many(query)
                .then(data => {
                   return data;
                })
                .catch(err => {
                    return 'The error is', err;
                });
          }
          },
    }
 })
module.exports = new GraphQLSchema({
   query: RootQuery
})