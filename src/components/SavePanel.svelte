<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { BaseSector } from '../lib/types';

  const dispatch = createEventDispatcher<{
    saved: void;
    undo: void;
  }>();

  const { projectId, transformItem, pendingChanges, autosaveEnabled } = $props<{
    projectId: number;
    transformItem: BaseSector | null;
    pendingChanges: BaseSector[];
    autosaveEnabled: boolean;
  }>();

  function saveProject() {
    dispatch('saved');
  }

  function undoChanges() {
    dispatch('undo');
  }

  if (autosaveEnabled) {
    saveProject();
  }
</script>

{#if transformItem && !autosaveEnabled}
  <div class="save-panel">
    <div class="actions">
      <button 
        onclick={saveProject} 
        disabled={pendingChanges.length === 0}
      >
        Save changes
      </button>
      <button 
        onclick={undoChanges}
        disabled={pendingChanges.length === 0}
      >
        Undo changes
      </button>
    </div>
  </div>
  {#if pendingChanges.length > 0}
    <div class="pending-changes">
      <span>Pending changes: {pendingChanges.length}</span>
    </div>
  {/if}
{/if}

{#if autosaveEnabled}
  {#if pendingChanges.length > 0}
    <div class="pending-changes">
      <span>Pending changes: {pendingChanges.length}</span>
    </div>
  {/if}
{/if}

<style>
  .save-panel {
    padding: 0;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .pending-changes {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    opacity: 0.8;
    text-align: center;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #4a9eff;
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background: #3182ce;
  }
</style>
