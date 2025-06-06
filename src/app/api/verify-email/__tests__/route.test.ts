import { GET } from '../route';

describe('verify-email API', () => {
  it('returns 400 when token is missing', async () => {
    const request = { url: 'http://localhost/api/verify-email' } as any;
    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});
