import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Load } from './types';

export type RecommendedLoadsData = { recommendedLoads: Load[] };
export type RecommendedLoadsVariables = { originCity?: string };

export const GET_RECOMMENDED_LOADS: TypedDocumentNode<RecommendedLoadsData, RecommendedLoadsVariables> = gql`
  query GetRecommendedLoads($originCity: String) {
    recommendedLoads(originCity: $originCity) {
      id
      carrier
      badge
      origin { city state }
      destination { city state }
      pickupDate
      rate
      ratePerMile
      miles
      equipment
      weightLbs
      lengthFt
      fullLoad
      postedMinutesAgo
    }
  }
`;