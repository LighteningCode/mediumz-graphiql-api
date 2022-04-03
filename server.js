const express = require("express");
const { graphqlHTTP: expressGraphql } = require("express-graphql");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");
const { authors, articles } = require("./data");

const app = express();

const ArticleType = new GraphQLObjectType({
  name: "Article",
  description: "This requests a an artile",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    subTitle: { type: GraphQLNonNull(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
    image: { type: GraphQLNonNull(GraphQLString) },
    readTime: { type: GraphQLNonNull(GraphQLString) },
    date: { type: GraphQLNonNull(GraphQLString) },
    author: {
      type: AuthorType,
      resolve: (article) => {
        return authors.find((author) => article.authorId === author.id);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This requests an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    image: { type: GraphQLNonNull(GraphQLString) },
    articles: {
      type: new GraphQLList(ArticleType),
      resolve: (author) => {
        return articles.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    article: {
      type: ArticleType,
      description: "Single article",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (_, args) => articles.find((book) => book.id === args.id),
    },
    articles: {
      type: new GraphQLList(ArticleType),
      description: "List of articles",
      resolve: () => articles,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of authors",
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: "Single Author",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (_, args) => authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addArticle: {
      type: ArticleType,
      description: "Add an Article",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (_, args) => {
        const article = {
          id: articles.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        articles.push(article);
        return article;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add an author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name,
        };
        authors.push(author);
        return author;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  expressGraphql({
    graphiql: true,
    schema: schema,
  })
);

app.listen(5000, () => console.log(`Server is running`));
