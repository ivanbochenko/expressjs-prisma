import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Event = {
  __typename?: 'Event';
  author?: Maybe<User>;
  author_id: Scalars['String']['output'];
  id: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  matches?: Maybe<Array<Maybe<Match>>>;
  photo: Scalars['String']['output'];
  slots: Scalars['Int']['output'];
  text: Scalars['String']['output'];
  time: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type EventD = {
  __typename?: 'EventD';
  author?: Maybe<User>;
  author_id: Scalars['String']['output'];
  distance: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  matches?: Maybe<Array<Maybe<Match>>>;
  photo: Scalars['String']['output'];
  slots: Scalars['Int']['output'];
  text: Scalars['String']['output'];
  time: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type Match = {
  __typename?: 'Match';
  accepted?: Maybe<Scalars['Boolean']['output']>;
  dissmised?: Maybe<Scalars['Boolean']['output']>;
  event?: Maybe<Event>;
  event_id: Scalars['String']['output'];
  id: Scalars['String']['output'];
  user?: Maybe<User>;
  user_id: Scalars['String']['output'];
};

export type Message = {
  __typename?: 'Message';
  author: User;
  id: Scalars['String']['output'];
  text: Scalars['String']['output'];
  time: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptMatch?: Maybe<Match>;
  block?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  createMatch?: Maybe<Match>;
  deleteEvent?: Maybe<Event>;
  deleteMatch?: Maybe<Match>;
  editUser?: Maybe<User>;
  postEvent: Event;
  postMessage?: Maybe<Message>;
  postReview?: Maybe<Review>;
};


export type MutationAcceptMatchArgs = {
  id: Scalars['String']['input'];
};


export type MutationBlockArgs = {
  id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationCreateMatchArgs = {
  dismissed: Scalars['Boolean']['input'];
  event_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteMatchArgs = {
  id: Scalars['String']['input'];
};


export type MutationEditUserArgs = {
  age: Scalars['Int']['input'];
  avatar?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  sex: Scalars['String']['input'];
};


export type MutationPostEventArgs = {
  author_id: Scalars['String']['input'];
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  photo: Scalars['String']['input'];
  slots: Scalars['Int']['input'];
  text: Scalars['String']['input'];
  time?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};


export type MutationPostMessageArgs = {
  author_id: Scalars['String']['input'];
  event_id: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


export type MutationPostReviewArgs = {
  author_id: Scalars['String']['input'];
  stars: Scalars['Int']['input'];
  text: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  event?: Maybe<Event>;
  events?: Maybe<Array<Maybe<Event>>>;
  feed?: Maybe<Array<Maybe<EventD>>>;
  lastEvent?: Maybe<Event>;
  matches?: Maybe<Array<Maybe<Match>>>;
  messages?: Maybe<Array<Maybe<Message>>>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  user?: Maybe<User>;
};


export type QueryEventArgs = {
  id: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  author_id: Scalars['String']['input'];
};


export type QueryFeedArgs = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
  maxDistance: Scalars['Int']['input'];
  user_id: Scalars['String']['input'];
};


export type QueryLastEventArgs = {
  author_id: Scalars['String']['input'];
};


export type QueryMatchesArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryMessagesArgs = {
  event_id: Scalars['String']['input'];
};


export type QueryReviewsArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export type Review = {
  __typename?: 'Review';
  author?: Maybe<User>;
  id: Scalars['String']['output'];
  stars: Scalars['Int']['output'];
  text: Scalars['String']['output'];
  time: Scalars['DateTime']['output'];
  user?: Maybe<User>;
};

export type Subscription = {
  __typename?: 'Subscription';
  messages: Message;
};


export type SubscriptionMessagesArgs = {
  event_id: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  age?: Maybe<Scalars['Int']['output']>;
  avatar?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  messages?: Maybe<Array<Maybe<Message>>>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  recievedReviews?: Maybe<Array<Maybe<Review>>>;
  sex?: Maybe<Scalars['String']['output']>;
  stars?: Maybe<Scalars['Int']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Event: ResolverTypeWrapper<Event>;
  EventD: ResolverTypeWrapper<EventD>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Match: ResolverTypeWrapper<Match>;
  Message: ResolverTypeWrapper<Message>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Review: ResolverTypeWrapper<Review>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Event: Event;
  EventD: EventD;
  Float: Scalars['Float']['output'];
  Int: Scalars['Int']['output'];
  Match: Match;
  Message: Message;
  Mutation: {};
  Query: {};
  Review: Review;
  String: Scalars['String']['output'];
  Subscription: {};
  User: User;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  author?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  author_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Match']>>>, ParentType, ContextType>;
  photo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slots?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EventDResolvers<ContextType = any, ParentType extends ResolversParentTypes['EventD'] = ResolversParentTypes['EventD']> = {
  author?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  author_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  distance?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  latitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  longitude?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Match']>>>, ParentType, ContextType>;
  photo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slots?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MatchResolvers<ContextType = any, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = {
  accepted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  dissmised?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  event_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  acceptMatch?: Resolver<Maybe<ResolversTypes['Match']>, ParentType, ContextType, RequireFields<MutationAcceptMatchArgs, 'id'>>;
  block?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType, RequireFields<MutationBlockArgs, 'id' | 'user_id'>>;
  createMatch?: Resolver<Maybe<ResolversTypes['Match']>, ParentType, ContextType, RequireFields<MutationCreateMatchArgs, 'dismissed' | 'event_id' | 'user_id'>>;
  deleteEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'id'>>;
  deleteMatch?: Resolver<Maybe<ResolversTypes['Match']>, ParentType, ContextType, RequireFields<MutationDeleteMatchArgs, 'id'>>;
  editUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationEditUserArgs, 'age' | 'id' | 'name' | 'sex'>>;
  postEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationPostEventArgs, 'author_id' | 'latitude' | 'longitude' | 'photo' | 'slots' | 'text' | 'title'>>;
  postMessage?: Resolver<Maybe<ResolversTypes['Message']>, ParentType, ContextType, RequireFields<MutationPostMessageArgs, 'author_id' | 'event_id' | 'text'>>;
  postReview?: Resolver<Maybe<ResolversTypes['Review']>, ParentType, ContextType, RequireFields<MutationPostReviewArgs, 'author_id' | 'stars' | 'text' | 'user_id'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id'>>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'author_id'>>;
  feed?: Resolver<Maybe<Array<Maybe<ResolversTypes['EventD']>>>, ParentType, ContextType, RequireFields<QueryFeedArgs, 'latitude' | 'longitude' | 'maxDistance' | 'user_id'>>;
  lastEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryLastEventArgs, 'author_id'>>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Match']>>>, ParentType, ContextType, RequireFields<QueryMatchesArgs, 'user_id'>>;
  messages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType, RequireFields<QueryMessagesArgs, 'event_id'>>;
  reviews?: Resolver<Maybe<Array<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType, RequireFields<QueryReviewsArgs, 'user_id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
};

export type ReviewResolvers<ContextType = any, ParentType extends ResolversParentTypes['Review'] = ResolversParentTypes['Review']> = {
  author?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stars?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  messages?: SubscriptionResolver<ResolversTypes['Message'], "messages", ParentType, ContextType, RequireFields<SubscriptionMessagesArgs, 'event_id'>>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  messages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recievedReviews?: Resolver<Maybe<Array<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType>;
  sex?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stars?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  EventD?: EventDResolvers<ContextType>;
  Match?: MatchResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Review?: ReviewResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

