<template>
  <dl class="glossary">
    <template v-for="(term, i) in block.terms" :key="i">
      <dt>{{ term.text }}</dt>
      <dd v-if="block.definitions[i]">{{ block.definitions[i].text }}</dd>
    </template>
  </dl>
</template>

<script setup lang="ts">
defineProps({ block: { type: Object, required: true } })
</script>

<style scoped>
.glossary {
  display: grid;
  grid-template-columns: minmax(180px, max-content) 1fr;
  gap: 0.5rem 1.5rem;
  margin: 1rem 0;
}

.glossary dt {
  color: var(--p-primary-300);
  font-weight: 600;
  margin-top: 0;
}

.glossary dd {
  margin: 0;
  color: var(--p-surface-200);
}

@media (max-width: 640px) {
  .glossary {
    grid-template-columns: 1fr;
    gap: 0.25rem 0;
  }

  .glossary dd {
    margin-bottom: 0.75rem;
  }
}
</style>
