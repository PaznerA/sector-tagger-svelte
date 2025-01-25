<script lang="ts">
  import type { AnyData } from '../types';

  let { item } = $props<{ item: AnyData | null }>();
</script>

{#if item}
  <div class="panel selected">
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
