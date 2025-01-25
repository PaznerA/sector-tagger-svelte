import type { APIRoute } from 'astro';
import { mockProjects } from '../../../lib/api/mockData';

export const GET: APIRoute = async ({ params }) => {
  const id = parseInt(params.id || '0');
  const project = mockProjects.find(p => p.id === id);

  if (!project) {
    return new Response(JSON.stringify({ error: 'Project not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return new Response(JSON.stringify(project), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export function getStaticPaths() {
  return mockProjects.map(project => ({
    params: { id: project.id.toString() },
  }));
}
