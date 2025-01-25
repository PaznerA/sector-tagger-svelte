import type { Project } from './types';

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Example Project',
    items: [
      {
        id: 1,
        name: 'Page 1',
        level: 'page',
        x: 50,
        y: 50,
        width: 800,
        height: 600,
        rotation: 0,
        scale: 1,
      },
      {
        id: 2,
        name: 'Header',
        level: 'view',
        x: 50,
        y: 50,
        width: 800,
        height: 100,
        rotation: 0,
        scale: 1,
        parentId: 1,
      },
      {
        id: 3,
        name: 'Logo',
        level: 'sector',
        x: 60,
        y: 60,
        width: 80,
        height: 80,
        rotation: 0,
        scale: 1,
        parentId: 2,
      },
    ],
  },
];
