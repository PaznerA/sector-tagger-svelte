<script lang="ts">
  import type { AnyData } from '../types';

  let { item } = $props<{ item: AnyData | null }>();
</script>

{#if item}
  <div class="panel hover">
    <div class="property">
      <span class="property-label">Name:</span>
      <span>{item.name}</span>
    </div>
    <div class="property">
      <span class="property-label">Type:</span>
      <span>{item.level}</span>
    </div>
  </div>
{/if}
