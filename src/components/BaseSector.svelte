<!-- Base component for all sector types -->
<script lang="ts">
  import type { BaseSector } from '../lib/types';
  
  export let item: BaseSector;
  export let selected = false;
  export let hovered = false;
  export let transforming = false;
  export let ctx: CanvasRenderingContext2D;
  export let parentTransform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  } = { x: 0, y: 0, scale: 1, rotation: 0 };

  const colors: Record<BaseSector['level'], string> = {
    page: '#3498db',
    view: '#2ecc71',
    sector: '#e74c3c',
  };

  export function draw() {
    const totalScale = item.scale * parentTransform.scale;
    const totalRotation = item.rotation + parentTransform.rotation;
    
    ctx.save();
    
    // Apply parent transform
    ctx.translate(parentTransform.x, parentTransform.y);
    ctx.rotate((parentTransform.rotation * Math.PI) / 180);
    ctx.scale(parentTransform.scale, parentTransform.scale);
    
    // Apply item transform
    ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.scale, item.scale);

    // Draw rectangle
    ctx.strokeStyle = colors[item.level];
    ctx.lineWidth = 2;
    ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);

    // Draw selection
    if (selected) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    }

    // Draw hover
    if (!transforming && hovered) {
      ctx.strokeStyle = '#9b59b6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  export function getGlobalTransform() {
    return {
      x: parentTransform.x + item.x,
      y: parentTransform.y + item.y,
      scale: parentTransform.scale * item.scale,
      rotation: parentTransform.rotation + item.rotation,
    };
  }

  export function isPointInside(pos: { x: number; y: number }): boolean {
    // Transform point to local coordinates
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

    return (
      transformedX >= -item.width / 2 &&
      transformedX <= item.width / 2 &&
      transformedY >= -item.height / 2 &&
      transformedY <= item.height / 2
    );
  }
</script>
