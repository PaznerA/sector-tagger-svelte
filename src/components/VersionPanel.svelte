<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { WebSocketClient } from '../lib/api/websocketClient';
  import type { BaseSector, ProjectVersion } from '../lib/types';

  const dispatch = createEventDispatcher<{
    rollback: BaseSector;
  }>();
  const wsClient = new WebSocketClient();

  const { projectId, transformItem } = $props<{
    projectId: number;
    transformItem: BaseSector | null;
  }>();

  let isExpanded = $state(false);
  let versions = $state<ProjectVersion[]>([]);
  let newVersionNote = $state('');
  let isLoading = $state(false);

  $effect(() => {
    if (isExpanded) {
      loadVersions();
    }
  });

  async function loadVersions() {
    isLoading = true;
    try {
      versions = await wsClient.getProjectVersions(projectId);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      isLoading = false;
    }
  }

  async function createVersion() {
    if (!newVersionNote.trim()) return;
    
    try {
      await wsClient.createProjectVersion(projectId, newVersionNote);
      newVersionNote = '';
      await loadVersions();
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  }

  async function rollbackToVersion(version: ProjectVersion) {
    if (!transformItem) return;
    
    try {
      const sectorVersion = await wsClient.getSectorVersionByProjectVersion(
        transformItem.id,
        version.id,
      );
      if (sectorVersion) {
        dispatch('rollback', sectorVersion);
      }
    } catch (error) {
      console.error('Failed to rollback:', error);
    }
  }
</script>

<div class="version-panel">
  <button class="toggle" onclick={() => isExpanded = !isExpanded}>
    {isExpanded ? '▼' : '▶'} Version History
  </button>

  {#if isExpanded}
    <div class="content">
      <div class="new-version">
        <input 
          type="text" 
          bind:value={newVersionNote}
          placeholder="Version note..."
        />
        <button class="create" onclick={createVersion}>
          Create
        </button>
      </div>

      {#if isLoading}
        <div class="loading">Loading versions...</div>
      {:else if versions.length === 0}
        <div class="empty">No versions yet</div>
      {:else}
        <div class="versions">
          {#each versions as version}
            <div class="version">
              <div class="version-info">
                <span class="version-number">v{version.version}</span>
                <span class="version-date">
                  {new Date(version.createdAt).toLocaleString()}
                </span>
              </div>
              {#if version.note}
                <div class="version-note">{version.note}</div>
              {/if}
              <button 
                class="rollback"
                onclick={() => rollbackToVersion(version)}
                disabled={!transformItem}
              >
                Rollback
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .version-panel {
    width: 100%;
  }

  .toggle {
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-weight: 500;
    opacity: 0.8;
  }

  .toggle:hover {
    opacity: 1;
  }

  .content {
    margin-top: 0.5rem;
  }

  .new-version {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  input {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 0.9rem;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .versions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .version {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem;
    border-radius: 4px;
  }

  .version-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 0.25rem;
  }

  .version-note {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  button {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: #4a9eff;
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
  }

  button.create {
    width: auto;
    padding: 0.5rem 1rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background: #3182ce;
  }

  .loading, .empty {
    text-align: center;
    padding: 0.5rem;
    opacity: 0.7;
    font-size: 0.9rem;
  }
</style>
