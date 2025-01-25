<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import SelectedPanel from './SelectedPanel.svelte';
  import HoverPanel from './HoverPanel.svelte';
  import type { BaseSector } from '../lib/api/types';
  import { WebSocketClient } from '../lib/api/websocketClient';
  import '../styles/panels.css';

  const { projectId } = $props<{projectId: number}>();
  
  const dispatch = createEventDispatcher();
  const wsClient = new WebSocketClient('ws://192.168.0.108:4321');

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let isDragging = $state(false);
  let isResizing = $state(false);
  let isRotating = $state(false);
  let dragStartX = $state(0);
  let dragStartY = $state(0);
  let startX = $state(0);
  let startY = $state(0);
  let startWidth = $state(0);
  let startHeight = $state(0);
  let startRotation = $state(0);
  let startAngle = $state(0);
  let resizeHandle = $state('');
  let currentHandle = $state('');
  let draggedItem = $state<BaseSector | null>(null);
  let selectedId = $state<number | null>(null);
  let hoveredId = $state<number | null>(null);
  let transformingId = $state<number | null>(null);
  let hoveredHandle = $state<string | null>(null);
  let items: BaseSector[] = [];
  let width = 800;
  let height = 600;

  let selectedItem = $derived(() => {
    const found = items.find((item: BaseSector) => item.id === selectedId);
    return found ?? null;
  });
  let hoveredItem = $derived(() => {
    const found = items.find((item: BaseSector) => item.id === hoveredId);
    return found ?? null;
  });

  function updateCursor() {
    if (!canvas) return;
    
    if (isDragging) {
      canvas.style.cursor = 'grabbing';
    } else if (isResizing || isRotating) {
      canvas.style.cursor = 'pointer';
    } else if (hoveredHandle) {
      switch (hoveredHandle) {
        case 'top-left':
        case 'bottom-right':
          canvas.style.cursor = 'nw-resize';
          break;
        case 'top-right':
        case 'bottom-left':
          canvas.style.cursor = 'ne-resize';
          break;
        case 'rotate':
          canvas.style.cursor = 'grab';
          break;
      }
    } else if (hoveredId !== null) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'default';
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    
    // Update canvas size on client
    if (typeof window !== 'undefined') {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    // Fetch initial project data
    fetch(`/api/projects/${projectId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to fetch project');
      })
      .then(project => {
        items = project.items;
      })
      .catch(error => {
        console.error('Failed to load project:', error);
      });

    // Connect WebSocket after getting initial data
    wsClient.connect(projectId);
    const unsubscribe = wsClient.onMessage((message) => {
      if (message.type === 'sync') {
        items = message.items;
        draw();
      }
    });
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      wsClient.disconnect();
    };
  });

  onDestroy(() => {
  });

  function handleResize() {
    if (typeof window !== 'undefined') {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      draw();
    }
  }

  function getMousePos(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw items in order: pages first, then views, then sectors
    const orderedItems = [...items].sort((a: BaseSector, b: BaseSector) => {
      const levels: Record<BaseSector['level'], number> = { page: 0, view: 1, sector: 2 };
      return levels[a.level] - levels[b.level];
    });

    orderedItems.forEach(item => {
      drawItem(item);
    });
  }

  function drawItem(item: BaseSector) {
    const colors: Record<BaseSector['level'], string> = {
      page: '#3498db',
      view: '#2ecc71',
      sector: '#e74c3c',
    };

    ctx.save();
    ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.scale, item.scale);

    // Draw rectangle
    ctx.strokeStyle = colors[item.level];
    ctx.lineWidth = 2;
    ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);

    // Draw selection
    if (item.id === selectedId) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    }

    // Draw hover
    if (!transformingId && item.id === hoveredId) {
      ctx.strokeStyle = '#9b59b6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.setLineDash([]);
    }

    // Draw transform handles
    if (item.id === transformingId) {
      const handleSize = 8;
      
      // Draw transform frame
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.setLineDash([]);

      // Draw resize handles
      const handles = {
        'top-left': { x: -item.width / 2, y: -item.height / 2 },
        'top-right': { x: item.width / 2, y: -item.height / 2 },
        'bottom-left': { x: -item.width / 2, y: item.height / 2 },
        'bottom-right': { x: item.width / 2, y: item.height / 2 },
      };

      for (const [handle, pos] of Object.entries(handles)) {
        ctx.fillStyle = handle === hoveredHandle ? '#f1c40f' : '#3498db';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw rotation handle and line
      ctx.strokeStyle = hoveredHandle === 'rotate' ? '#f1c40f' : '#3498db';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -item.height / 2);
      ctx.lineTo(0, -item.height / 2 - 20);
      ctx.stroke();

      ctx.fillStyle = hoveredHandle === 'rotate' ? '#f1c40f' : '#3498db';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -item.height / 2 - 20, handleSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function getAngle(center: { x: number, y: number }, point: { x: number, y: number }) {
    return Math.atan2(point.y - center.y, point.x - center.x) * 180 / Math.PI;
  }

  function isNearHandle(pos: { x: number, y: number }, item: BaseSector): string | null {
    if (item.id !== transformingId) return null;

    const handleSize = 8;
    const center = {
      x: item.x + item.width / 2,
      y: item.y + item.height / 2,
    };
    const angle = (item.rotation * Math.PI) / 180;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);

    // Transform mouse position relative to center
    const relX = pos.x - center.x;
    const relY = pos.y - center.y;
    const transformedX = relX * cos - relY * sin;
    const transformedY = relX * sin + relY * cos;

    // Check resize handles
    const handles = {
      'top-left': { x: -item.width / 2, y: -item.height / 2 },
      'top-right': { x: item.width / 2, y: -item.height / 2 },
      'bottom-left': { x: -item.width / 2, y: item.height / 2 },
      'bottom-right': { x: item.width / 2, y: item.height / 2 },
      'rotate': { x: 0, y: -item.height / 2 - 20 },
    };

    for (const [handle, point] of Object.entries(handles)) {
      if (Math.abs(transformedX - point.x) < handleSize && Math.abs(transformedY - point.y) < handleSize) {
        return handle;
      }
    }

    return null;
  }

  function handleMouseDown(e: MouseEvent) {
    const pos = getMousePos(e);
    const clickedItem = findClickedItem(pos);

    if (clickedItem) {
      draggedItem = clickedItem;
      
      if (transformingId === clickedItem.id) {
        const handle = isNearHandle(pos, clickedItem);
        if (handle) {
          currentHandle = handle;
          const center = {
            x: clickedItem.x + clickedItem.width / 2,
            y: clickedItem.y + clickedItem.height / 2,
          };
          
          if (handle === 'rotate') {
            isRotating = true;
            startAngle = getAngle(center, pos);
            startRotation = clickedItem.rotation;
          } else {
            isResizing = true;
            startWidth = clickedItem.width;
            startHeight = clickedItem.height;
            
            // Transform initial mouse position
            const angle = (clickedItem.rotation * Math.PI) / 180;
            const cos = Math.cos(-angle);
            const sin = Math.sin(-angle);
            const relX = pos.x - center.x;
            const relY = pos.y - center.y;
            dragStartX = relX * cos - relY * sin;
            dragStartY = relX * sin + relY * cos;
          }
          return;
        }
      }
      
      isDragging = true;
      startX = clickedItem.x;
      startY = clickedItem.y;
      dragStartX = pos.x;
      dragStartY = pos.y;
      selectedId = clickedItem.id;
    } else {
      selectedId = null;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    const pos = getMousePos(e);
    
    if (isDragging && draggedItem) {
      const deltaX = pos.x - dragStartX;
      const deltaY = pos.y - dragStartY;
      const newX = startX + deltaX;
      const newY = startY + deltaY;
      
      updateItemPosition(draggedItem.id, newX, newY);
      draw();
    } else if (isResizing && draggedItem) {
      const center = {
        x: draggedItem.x + draggedItem.width / 2,
        y: draggedItem.y + draggedItem.height / 2,
      };
      const angle = (draggedItem.rotation * Math.PI) / 180;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);

      // Transform mouse position relative to center and rotation
      const relX = pos.x - center.x;
      const relY = pos.y - center.y;
      const transformedX = relX * cos - relY * sin;
      const transformedY = relX * sin + relY * cos;

      let newWidth = startWidth;
      let newHeight = startHeight;
      const scale = 2;

      // Calculate deltas for both dimensions
      const deltaX = (transformedX - dragStartX) * scale;
      const deltaY = (transformedY - dragStartY) * scale;

      // Maintain aspect ratio if shift is pressed
      const aspectRatio = startWidth / startHeight;
      const keepAspectRatio = e.shiftKey;

      // Size constraints based on level
      const minSize = draggedItem.level === 'page' ? 100 : 
                     draggedItem.level === 'view' ? 50 : 20;
      const maxSize = draggedItem.level === 'page' ? 2000 : 
                     draggedItem.level === 'view' ? 1000 : 500;

      switch (currentHandle) {
        case 'top-left':
          if (keepAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = startWidth - delta;
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = startWidth - deltaX;
            newHeight = startHeight - deltaY;
          }
          break;
        case 'top-right':
          if (keepAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = startWidth + delta;
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = startWidth + deltaX;
            newHeight = startHeight - deltaY;
          }
          break;
        case 'bottom-left':
          if (keepAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = startWidth - delta;
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = startWidth - deltaX;
            newHeight = startHeight + deltaY;
          }
          break;
        case 'bottom-right':
          if (keepAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = startWidth + delta;
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = startWidth + deltaX;
            newHeight = startHeight + deltaY;
          }
          break;
      }

      // Apply size constraints
      newWidth = Math.max(minSize, Math.min(maxSize, newWidth));
      newHeight = Math.max(minSize, Math.min(maxSize, newHeight));
      
      updateItemSize(draggedItem.id, newWidth, newHeight);
      draw();
    } else if (isRotating && draggedItem) {
      const center = {
        x: draggedItem.x + draggedItem.width / 2,
        y: draggedItem.y + draggedItem.height / 2,
      };
      const currentAngle = getAngle(center, pos);
      const deltaAngle = currentAngle - startAngle;
      
      // Snap to 45° increments if shift is pressed
      let newAngle = startRotation + deltaAngle;
      if (e.shiftKey) {
        newAngle = Math.round(newAngle / 45) * 45;
      }
      
      updateItemRotation(draggedItem.id, newAngle);
      draw();
    } else {
      // Check for hover over handles first
      if (transformingId) {
        const transformingItem = items.find(item => item.id === transformingId);
        if (transformingItem) {
          hoveredHandle = isNearHandle(pos, transformingItem);
          updateCursor();
        }
      }

      // Then check for hover over items
      const hovered = findClickedItem(pos);
      hoveredId = hovered?.id ?? null;
      if (!hoveredHandle) {
        updateCursor();
      }
      draw();
    }
  }

  function handleMouseUp() {
    isDragging = false;
    isResizing = false;
    isRotating = false;
    draggedItem = null;
    currentHandle = '';
    updateCursor();
  }

  function findClickedItem(pos: { x: number; y: number }): BaseSector | null {
    // Search in reverse order to find top-most item first
    return [...items].reverse().find(item => {
      return (
        pos.x >= item.x &&
        pos.x <= item.x + item.width &&
        pos.y >= item.y &&
        pos.y <= item.y + item.height
      );
    }) ?? null;
  }

  function isNearCorner(pos: { x: number, y: number }, item: BaseSector): boolean {
    const cornerSize = 10;
    const corners = [
      { x: item.x, y: item.y },
      { x: item.x + item.width, y: item.y },
      { x: item.x, y: item.y + item.height },
      { x: item.x + item.width, y: item.y + item.height },
    ];

    return corners.some(corner => {
      return (
        Math.abs(pos.x - corner.x) < cornerSize &&
        Math.abs(pos.y - corner.y) < cornerSize
      );
    });
  }

  function updateItemPosition(id: number, x: number, y: number) {
    const item = items.find(item => item.id === id);
    if (item) {
      item.x = x;
      item.y = y;
      wsClient.updateItem(item);
      items = [...items]; // Trigger reactivity
    }
  }

  function updateItemSize(id: number, width: number, height: number) {
    const item = items.find(item => item.id === id);
    if (item) {
      item.width = width;
      item.height = height;
      wsClient.updateItem(item);
      items = [...items]; // Trigger reactivity
    }
  }

  function updateItemRotation(id: number, rotation: number) {
    const item = items.find(item => item.id === id);
    if (item) {
      item.rotation = rotation;
      wsClient.updateItem(item);
      items = [...items]; // Trigger reactivity
    }
  }

  function toggleTransform() {
    if (transformingId === selectedId) {
      transformingId = null;
    } else {
      transformingId = selectedId;
    }
  }
</script>

<div class="panel controls">
  <button on:click={toggleTransform} disabled={!selectedId}>
    {transformingId ? 'End Transform' : 'Start Transform'}
  </button>
</div>

<canvas
  bind:this={canvas}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
></canvas>

{#if selectedId && selectedItem()}
  <SelectedPanel item={selectedItem()} />
{/if}

{#if hoveredId && hoveredId !== selectedId && hoveredItem()}
  <HoverPanel item={hoveredItem()} />
{/if}

<style>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    cursor: pointer;
  }

  .panel.controls {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  button {
    padding: 8px 16px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
</style>
