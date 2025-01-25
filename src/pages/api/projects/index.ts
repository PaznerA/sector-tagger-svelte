import type { APIRoute } from 'astro';
import { mockProjects } from '../../../lib/api/mockData';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(mockProjects), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
