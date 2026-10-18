import { graphql } from 'graphql';
import { filterLoadsByOrigin, localSchema } from '../localSchema';
import { mockLoads } from '../mockLoads';

type LoadsResult = {
  recommendedLoads: { id: string; ratePerMile: number; origin: { city: string } }[];
};

describe('filterLoadsByOrigin', () => {
  it('returns every load when there is no search text', () => {
    expect(filterLoadsByOrigin(mockLoads)).toHaveLength(6);
    expect(filterLoadsByOrigin(mockLoads, '   ')).toHaveLength(6);
  });

  it('matches origin city partially and case-insensitively', () => {
    const results = filterLoadsByOrigin(mockLoads, 'chi');
    expect(results.map((load) => load.id)).toEqual(['2', '4']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterLoadsByOrigin(mockLoads, 'Atlantis')).toEqual([]);
  });
});

describe('localSchema', () => {
  it('computes ratePerMile from rate and miles', async () => {
    const result = await graphql({
      schema: localSchema,
      source: '{ recommendedLoads { id ratePerMile origin { city } } }',
    });
    expect(result.errors).toBeUndefined();

    const data = result.data as LoadsResult;
    const madison = data.recommendedLoads.find((load) => load.id === '1');
    expect(madison?.ratePerMile).toBeCloseTo(3.18, 2); // $1,350 over 425 miles
  });

  it('filters by the originCity argument', async () => {
    const result = await graphql({
      schema: localSchema,
      source: 'query ($city: String) { recommendedLoads(originCity: $city) { id ratePerMile origin { city } } }',
      variableValues: { city: 'Chicago' },
    });

    const data = result.data as LoadsResult;
    expect(data.recommendedLoads.map((load) => load.origin.city)).toEqual(['Chicago', 'Chicago']);
  });
});