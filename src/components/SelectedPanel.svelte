<script lang="ts">
  import type { AnyData } from '../types';
  import { WebSocketClient } from '../lib/api/websocketClient';

  const wsClient = new WebSocketClient();

  const handleAddSector = () => {
    const newSectorType = item.level === 'view' ? 'sector' : 'view';
    wsClient.sendCreate({ 
      id: 0,
      projectId: item.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: item.id,
      name: 'New ' + newSectorType,
      level: newSectorType,
      x: item.x,
      y: item.y,
      width: 100,
      height: 100,
      rotation: 0,
      scale: 1,
    });
  };

  const handleDeleteSector = () => {
    console.log('Delete sector', item);
    wsClient.sendDelete(item);
  };

  let { item } = $props<{ item: AnyData | null }>();
</script>

{#if item}
  <div class="panel selected">
    <button onclick={handleAddSector}>Add sector inside</button>
    <button onclick={handleDeleteSector}>Delete sector</button>
    <div class="property">
      <span class="property-label">ID:</span>
      <span>{item.id}</span>
    </div>
    <div class="property">
      <span class="property-label">Name:</span>
      <span>{item.name}</span>
    </div>
    <div class="property">
      <span class="property-label">Type:</span>
      <span>{item.level}</span>
    </div>
    <div class="property">
      <span class="property-label">Position:</span>
      <span>({Math.round(item.x)}, {Math.round(item.y)})</span>
    </div>
    <div class="property">
      <span class="property-label">Size:</span>
      <span>{Math.round(item.width)} x {Math.round(item.height)}</span>
    </div>
    <div class="property">
      <span class="property-label">Rotation:</span>
      <span>{Math.round(item.rotation)}°</span>
    </div>
    <div class="property">
      <span class="property-label">Scale:</span>
      <span>{item.scale.toFixed(2)}</span>
    </div>
  </div>
{/if}
