<script lang="ts">
  import type { AnyData } from '../types';
  import { WebSocketClient } from '../lib/api/websocketClient';
    import BaseSector from './BaseSector.svelte';

  const wsClient = new WebSocketClient();

  const handleAddSector = () => {
    const newSectorType = selectedItem.level === 'view' ? 'sector' : 'view';
    wsClient.createSector({ 
      projectId: selectedItem.projectId,
      parentId: selectedItem.id,
      name: 'New ' + newSectorType,
      level: newSectorType,
      x: selectedItem.x,
      y: selectedItem.y,
      width: 100,
      height: 100,
      rotation: 0,
      scale: 1,
    });
  };

  const handleDeleteSector = () => {
    wsClient.deleteSector(selectedItem.id);
  };

  let { selectedItem } = $props<{ selectedItem: BaseSector | null }>();
</script>

{#if selectedItem}
  <div class="panel selected">
    <button onclick={handleAddSector}>Add sector inside</button>
    <button onclick={handleDeleteSector}>Delete sector</button>
    <div class="property">
      <span class="property-label">ID:</span>
      <span>{selectedItem.id}</span>
    </div>
    <div class="property">
      <span class="property-label">Name:</span>
      <span>{selectedItem.name}</span>
    </div>
    <div class="property">
      <span class="property-label">Type:</span>
      <span>{selectedItem.level}</span>
    </div>
    <div class="property">
      <span class="property-label">Position:</span>
      <span>({Math.round(selectedItem.x)}, {Math.round(selectedItem.y)})</span>
    </div>
    <div class="property">
      <span class="property-label">Size:</span>
      <span>{Math.round(selectedItem.width)} x {Math.round(selectedItem.height)}</span>
    </div>
    <div class="property">
      <span class="property-label">Rotation:</span>
      <span>{Math.round(selectedItem.rotation)}°</span>
    </div>
    <div class="property">
      <span class="property-label">Scale:</span>
      <span>{selectedItem.scale?.toFixed(2)}</span>
    </div>
  </div>
{/if}
