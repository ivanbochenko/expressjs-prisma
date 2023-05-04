import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './src/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type Event = {
  __typename?: 'Event';
  author?: Maybe<User>;
  author_id: Scalars['ID'];
  id: Scalars['ID'];
  latitude?: Maybe<Scalars['Float']>;
  longitude?: Maybe<Scalars['Float']>;
  matches?: Maybe<Array<Maybe<Match>>>;
  photo?: Maybe<Scalars['String']>;
  slots?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
  time: Scalars['DateTime'];
  title: Scalars['String'];
};

export type EventD = {
  __typename?: 'EventD';
  author?: Maybe<User>;
  author_id: Scalars['ID'];
  distance?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  latitude?: Maybe<Scalars['Float']>;
  longitude?: Maybe<Scalars['Float']>;
  matches?: Maybe<Array<Maybe<Match>>>;
  photo?: Maybe<Scalars['String']>;
  slots?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
  time: Scalars['DateTime'];
  title: Scalars['String'];
};

export type Match = {
  __typename?: 'Match';
  accepted?: Maybe<Scalars['Boolean']>;
  dissmised?: Maybe<Scalars['Boolean']>;
  event?: Maybe<Event>;
  event_id: Scalars['ID'];
  id: Scalars['ID'];
  user?: Maybe<User>;
  user_id: Scalars['ID'];
};

export type Message = {
  __typename?: 'Message';
  author: User;
  id: Scalars['ID'];
  text: Scalars['String'];
  time: Scalars['DateTime'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptMatch: Match;
  createMatch: Match;
  deleteEvent: Event;
  deleteMatch: Match;
  deleteUser?: Maybe<User>;
  editUser: User;
  postEvent: Event;
  postMessage: Message;
  postReview: Review;
};


export type MutationAcceptMatchArgs = {
  id: Scalars['ID'];
};


export type MutationCreateMatchArgs = {
  dismissed: Scalars['Boolean'];
  event_id: Scalars['ID'];
  user_id: Scalars['ID'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteMatchArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationEditUserArgs = {
  age: Scalars['Int'];
  avatar?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  sex: Scalars['String'];
};


export type MutationPostEventArgs = {
  author_id: Scalars['ID'];
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  photo: Scalars['String'];
  slots: Scalars['Int'];
  text: Scalars['String'];
  time?: InputMaybe<Scalars['DateTime']>;
  title: Scalars['String'];
};


export type MutationPostMessageArgs = {
  author_id: Scalars['ID'];
  event_id: Scalars['ID'];
  text: Scalars['String'];
};


export type MutationPostReviewArgs = {
  author_id: Scalars['ID'];
  stars: Scalars['Int'];
  text: Scalars['String'];
  user_id: Scalars['ID'];
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
  id: Scalars['ID'];
};


export type QueryEventsArgs = {
  author_id: Scalars['ID'];
};


export type QueryFeedArgs = {
  latitude: Scalars['Float'];
  longitude: Scalars['Float'];
  maxDistance: Scalars['Int'];
  user_id: Scalars['ID'];
};


export type QueryLastEventArgs = {
  author_id: Scalars['ID'];
};


export type QueryMatchesArgs = {
  user_id: Scalars['ID'];
};


export type QueryMessagesArgs = {
  event_id: Scalars['ID'];
};


export type QueryReviewsArgs = {
  user_id: Scalars['ID'];
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};

export type Review = {
  __typename?: 'Review';
  author?: Maybe<User>;
  id: Scalars['ID'];
  stars: Scalars['Int'];
  text: Scalars['String'];
  time: Scalars['DateTime'];
  user?: Maybe<User>;
};

export type Subscription = {
  __typename?: 'Subscription';
  messages: Message;
};


export type SubscriptionMessagesArgs = {
  event_id: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  age?: Maybe<Scalars['Int']>;
  avatar?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['DateTime']>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  messages?: Maybe<Array<Maybe<Message>>>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  reviews?: Maybe<Array<Maybe<Review>>>;
  sex?: Maybe<Scalars['String']>;
  stars?: Maybe<Scalars['Int']>;
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
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  Event: ResolverTypeWrapper<Event>;
  EventD: ResolverTypeWrapper<EventD>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Match: ResolverTypeWrapper<Match>;
  Message: ResolverTypeWrapper<Message>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Review: ResolverTypeWrapper<Review>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  DateTime: Scalars['DateTime'];
  Event: Event;
  EventD: EventD;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Match: Match;
  Message: Message;
  Mutation: {};
  Query: {};
  Review: Review;
  String: Scalars['String'];
  Subscription: {};
  User: User;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  author?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  author_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Match']>>>, ParentType, ContextType>;
  photo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slots?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EventDResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EventD'] = ResolversParentTypes['EventD']> = {
  author?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  author_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  distance?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Match']>>>, ParentType, ContextType>;
  photo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slots?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MatchResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = {
  accepted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  dissmised?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  event_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  acceptMatch?: Resolver<ResolversTypes['Match'], ParentType, ContextType, RequireFields<MutationAcceptMatchArgs, 'id'>>;
  createMatch?: Resolver<ResolversTypes['Match'], ParentType, ContextType, RequireFields<MutationCreateMatchArgs, 'dismissed' | 'event_id' | 'user_id'>>;
  deleteEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'id'>>;
  deleteMatch?: Resolver<ResolversTypes['Match'], ParentType, ContextType, RequireFields<MutationDeleteMatchArgs, 'id'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  editUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationEditUserArgs, 'age' | 'id' | 'name' | 'sex'>>;
  postEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationPostEventArgs, 'author_id' | 'latitude' | 'longitude' | 'photo' | 'slots' | 'text' | 'title'>>;
  postMessage?: Resolver<ResolversTypes['Message'], ParentType, ContextType, RequireFields<MutationPostMessageArgs, 'author_id' | 'event_id' | 'text'>>;
  postReview?: Resolver<ResolversTypes['Review'], ParentType, ContextType, RequireFields<MutationPostReviewArgs, 'author_id' | 'stars' | 'text' | 'user_id'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id'>>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['Event']>>>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'author_id'>>;
  feed?: Resolver<Maybe<Array<Maybe<ResolversTypes['EventD']>>>, ParentType, ContextType, RequireFields<QueryFeedArgs, 'latitude' | 'longitude' | 'maxDistance' | 'user_id'>>;
  lastEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryLastEventArgs, 'author_id'>>;
  matches?: Resolver<Maybe<Array<Maybe<ResolversTypes['Match']>>>, ParentType, ContextType, RequireFields<QueryMatchesArgs, 'user_id'>>;
  messages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType, RequireFields<QueryMessagesArgs, 'event_id'>>;
  reviews?: Resolver<Maybe<Array<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType, RequireFields<QueryReviewsArgs, 'user_id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
};

export type ReviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Review'] = ResolversParentTypes['Review']> = {
  author?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  stars?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  time?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  messages?: SubscriptionResolver<ResolversTypes['Message'], "messages", ParentType, ContextType, RequireFields<SubscriptionMessagesArgs, 'event_id'>>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  age?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  messages?: Resolver<Maybe<Array<Maybe<ResolversTypes['Message']>>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviews?: Resolver<Maybe<Array<Maybe<ResolversTypes['Review']>>>, ParentType, ContextType>;
  sex?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stars?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
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

