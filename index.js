const express = require("express")
const { graphqlHTTP } = require("express-graphql"); // Correct import
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql')
const app = express()

const authors = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];
  const books = [
    { id: 1, title: "JavaScript Basics", authorId: 1 },
    { id: 2, title: "Learning Python", authorId: 2 },
    { id: 3, title: "Web Development Essentials", authorId: 3 },
    { id: 4, title: "React for Beginners", authorId: 1 },
    { id: 5, title: "Mastering Node.js", authorId: 2 },
    { id: 6, title: "Introduction to AI", authorId: 3 },
    { id: 7, title: "GraphQL Deep Dive", authorId: 1 },
    { id: 8, title: "CSS Secrets", authorId: 2 },
    { id: 9, title: "Machine Learning Guide", authorId: 3 },
    { id: 10, title: "The Art of Coding", authorId: 1 },
  ];

// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name:'HelloWorld',
//         fields:()=>({
//             message:{ 
//                 type:GraphQLString,
//                  resolve:()=>"Hello world"
//             }
//         })
//     })
// })

const BookType = new GraphQLObjectType({
    name : 'Book',
    description : 'List of book with authors',
    fields : () =>({
        id : { type : new GraphQLNonNull(GraphQLInt)},
        title : { type : new GraphQLNonNull(GraphQLString)} ,
        authorId : { type : new GraphQLNonNull(GraphQLString)} ,
        author : {
            type : AuthorType,
            resolve : (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description : 'List of Authors',
    fields : () =>({
        id : { type : new GraphQLNonNull(GraphQLInt)},
        name : { type : new GraphQLNonNull(GraphQLString)} ,
        // books : {
        //     type : BookType,
        //     resolve : (author) => {
        //         return books.find(book => book.authorId === author.id)
        //     }
        // }
        books : {
            type : new GraphQLList(BookType),
            resolve : (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name : "Query",
    description : 'Root Query',
    fields: () => ({
        book:{
            type: BookType,
            description: 'book',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books:{
            type: new GraphQLList(BookType),
            description: 'list of books',
            resolve: () => books
        },
        authors:{
            type: new GraphQLList(AuthorType),
            description: 'list of Author',
            resolve: () => authors
        },
        author:{
            type: AuthorType,
            description: 'Author',
            args : {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id == args.id)
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: "add a book",
            args: {
                title: { type: new GraphQLNonNull(GraphQLString)},
                authorId: { type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length+1,
                    title: args.title,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "add a author",
            args: {
                name: { type: new GraphQLNonNull(GraphQLString)},
                authorId: { type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const author = {
                    id: args.authorId,
                    name: args.name,
                }
                authors.push(author)
                return author
            }
        },
        removeBook: {
            type: BookType,
            description: "Remove a Book with ID",
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const bookIndex = books.findIndex(book => book.id === args.id);
                if (bookIndex === -1) {
                    throw new Error("Book not found");
                }
                const removedBook = books.splice(bookIndex, 1)[0]; // Remove the book from the array
                return removedBook; // Return the removed book
            }
        },
        updateBook: {
            type: BookType,
            description: "Update a Book",
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt)},
                title: { type: new GraphQLNonNull(GraphQLString)},
                authorId: { type: new GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const bookIndex = books.findIndex(book => book.id === args.id);
                if (bookIndex === -1) {
                    throw new Error("Book not found");
                }
                const book = {
                    id : args.id,
                    title : args.title,
                    authorId : args.authorId
                }
                const removedBook = books.splice(bookIndex, 1)[0]; 
                books.push(book)
                return book;
            }
        },
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql',graphqlHTTP({
    graphiql:true,
    schema:schema
}))

app.listen(8080,()=>{
    console.log("server listening")
})