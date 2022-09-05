const typeDefs = `
  type User {
    id:         ID!
    created_at: DateTime!
    email:      String
    phone:      String
    name:       String
    bio:        String
    avatar:     String
    age:        Int
    sex:        String
    messages:   [Message]
  }

  type Event {
    id:         ID!
    author_id:  ID!
    photo:      String!
    title:      String!
    text:       String
    slots:      Int
    time:       DateTime!
    latitude:   Float
    longitude:  Float
    matches:    [Match]
  }

  type Message {
    id:         ID!
    text:       String!
    time:       DateTime!
    author:     User!
  }

  type Match {
    id:         ID!
    user_id:    ID!
    event_id:   ID!
    accepted:   Boolean
  }

  scalar DateTime

  type Query {
    user(id: ID!): User
    messages(event_id: ID!): [Message]
    matches(author_id: ID!): [Match]
  }

  type Mutation {
    postMessage(author_id: ID!, event_id: ID!, text: String!): Message!
    postEvent(
      author_id: ID!,
      photo:     String!,
      title:     String!,
      text:      String!,
      slots:     Int!,
      time:      DateTime,
      latitude:  Float!,
      longitude: Float!
    ): Event!
    editUser(id: ID!, name: String!, age: Int!, sex: String!, bio: String, avatar: String): User!
    createMatch(user_id: ID!, event_id: ID!): Match!
  }

  type Subscription {
    messages(event_id: ID!): Message!
    matches(event_id: ID!): Match!
  }

`

export default typeDefs