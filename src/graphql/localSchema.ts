import { makeExecutableSchema } from '@graphql-tools/schema';
import { mockLoads, type MockLoad } from './mockLoads';

const typeDefs = /* GraphQL */ `
  enum LoadBadge {
    HIGH_OUTBOUND
    HIGH_RATE
  }

  type Location {
    city: String!
    state: String!
  }

  type Load {
    id: ID!
    carrier: String!
    badge: LoadBadge
    origin: Location!
    destination: Location!
    pickupDate: String!
    rate: Int!
    ratePerMile: Float!
    miles: Int!
    equipment: String!
    weightLbs: Int!
    lengthFt: Int!
    fullLoad: Boolean!
    postedMinutesAgo: Int!
  }

  type Query {
    recommendedLoads(originCity: String): [Load!]!
  }
`;

export function filterLoadsByOrigin(loads: MockLoad[], originCity?: string | null) {
  const query = originCity?.trim().toLowerCase();
  if (!query) return loads;
  return loads.filter((load) => load.origin.city.toLowerCase().includes(query));
}

const resolvers = {
  Query: {
    recommendedLoads: (_: unknown, args: { originCity?: string | null }) =>
      filterLoadsByOrigin(mockLoads, args.originCity),
  },
  Load: {
    ratePerMile: (load: MockLoad) => load.rate / load.miles,
  },
};

export const localSchema = makeExecutableSchema({ typeDefs, resolvers });