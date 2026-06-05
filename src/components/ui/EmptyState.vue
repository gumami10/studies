<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <i class="pi pi-star"></i>
    </div>
    <h3>No starred sections yet</h3>
    <p>Click the star icon next to any section while studying to save it here.</p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 5rem 1.5rem;
  color: var(--p-surface-400);
  background: var(--p-surface-900);
  border: 1px dashed var(--p-surface-700);
  border-radius: 14px;
}

.empty-state-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--p-surface-800);
  color: var(--p-primary-400);
  font-size: 1.75rem;
  margin-bottom: 1.25rem;
}

.empty-state h3 {
  color: var(--p-surface-0);
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.empty-state p {
  margin: 0;
  color: var(--p-surface-400);
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
</style>
