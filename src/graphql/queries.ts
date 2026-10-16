import { gql, type TypedDocumentNode } from '@apollo/client';

export type GetCountryData = {
  country: {
    name: string;
    capital: string | null;
    currency: string | null;
  } | null;
};

export type GetCountryVariables = { code: string };

export const GET_COUNTRY: TypedDocumentNode<GetCountryData, GetCountryVariables> = gql`
  query GetCountry($code: ID!) {
    country(code: $code) {
      name
      capital
      currency
    }
  }
`;