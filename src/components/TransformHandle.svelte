<!-- Component for transform handles -->
<script lang="ts">
  import type { BaseSector } from '../lib/types';

  export let item: BaseSector;
  export let ctx: CanvasRenderingContext2D;
  export let hoveredHandle: string | null = null;
  export let parentTransform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };

  const handleSize = 8;

  export function draw() {
    const totalScale = item.scale * parentTransform.scale;
    
    ctx.save();
    
    // Apply parent transform
    ctx.translate(parentTransform.x, parentTransform.y);
    ctx.rotate((parentTransform.rotation * Math.PI) / 180);
    ctx.scale(parentTransform.scale, parentTransform.scale);
    
    // Apply item transform
    ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.scale, item.scale);

    // Draw transform frame
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    ctx.setLineDash([]);

    // Draw resize handles
    const handles = {
      'left': { x: -item.width / 2, y: 0 },
      'right': { x: item.width / 2, y: 0 },
      'top': { x: 0, y: -item.height / 2 },
      'bottom': { x: 0, y: item.height / 2 },
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

    ctx.restore();
  }

  export function isNearHandle(pos: { x: number; y: number }): string | null {
    const handleSize = 16; // Larger hit area
    const totalRotation = (item.rotation + parentTransform.rotation) * Math.PI / 180;
    const totalScale = item.scale * parentTransform.scale;
    const globalX = parentTransform.x + item.x;
    const globalY = parentTransform.y + item.y;
    
    const cos = Math.cos(-totalRotation);
    const sin = Math.sin(-totalRotation);
    
    const relX = (pos.x - globalX) / totalScale;
    const relY = (pos.y - globalY) / totalScale;
    
    const transformedX = relX * cos - relY * sin;
    const transformedY = relX * sin + relY * cos;

    // Check resize handles with padding
    const padding = handleSize;
    const handles = {
      'left': { x: -item.width / 2 - padding / 2, y: 0 },
      'right': { x: item.width / 2 + padding / 2, y: 0 },
      'top': { x: 0, y: -item.height / 2 - padding / 2 },
      'bottom': { x: 0, y: item.height / 2 + padding / 2 },
      'bottom-right': { x: item.width / 2 + padding / 2, y: item.height / 2 + padding / 2 },
      'rotate': { x: 0, y: -item.height / 2 - 20 - padding / 2 },
    };

    for (const [handle, point] of Object.entries(handles)) {
      const distance = Math.sqrt(
        Math.pow(transformedX - point.x, 2) + 
        Math.pow(transformedY - point.y, 2)
      );
      if (distance < handleSize) {
        return handle;
      }
    }

    return null;
  }
</script>
