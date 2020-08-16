const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require("graphql");

const app = express();

const authors = [
    {id: 1, name:'J. K. Rowling'},
    {id: 2, name:'J. K. R. Tolkien'},
    {id: 3, name:'Brent Weeks'}
]

const books = [
    { id:1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id:2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id:3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id:4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id:5, name: 'The Two Towers', authorId: 2 },
    { id:6, name: 'Harry Potter and the Chamber of Secrets', authorId: 3 },
]

const bookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Book written by author',
    fields: ()=>({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId :{ type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: (book)=>{
                return authors.find(author => author.id === book.authorId)
            }
         }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Author of book',
    fields: ()=>({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(bookType),
            resolve: (author)=>{
                return books.filter(book=>book.authorId===author.id)
            }
        }
       
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: bookType,
            description: 'Single book',
            args:{
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book=> book.id===args.id)
        },
        books: {
            type: new GraphQLList(bookType),
            description: 'List of books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'Single author',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author=> author.id===args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: bookType,
            description: "Add book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve:(parent,args)=>{
                const book = { id: books.length +1, name : args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve:(parent,args)=>{
                const author = { id: authors.length +1, name : args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
app.listen(5000, () => console.log("server Running"));
