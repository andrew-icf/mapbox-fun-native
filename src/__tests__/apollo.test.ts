import { client } from '../apollo';
import { GET_RECOMMENDED_LOADS } from '../features/loads/queries';

describe('Apollo client', () => {
  it('routes load queries to the local schema', async () => {
    const { data } = await client.query({ query: GET_RECOMMENDED_LOADS });
    expect(data?.recommendedLoads).toHaveLength(6);
  });
});