<script lang="ts">
  import type { BaseSector } from '../types';

  let { hoveredItem } = $props<{ hoveredItem: BaseSector | null }>();
</script>

{#if hoveredItem}
  <div class="panel hover">
    <div class="property">
      <span class="property-label">Name:</span>
      <span>{hoveredItem.name}</span>
    </div>
    <div class="property">
      <span class="property-label">Type:</span>
      <span>{hoveredItem.level}</span>
    </div>
  </div>
{/if}
