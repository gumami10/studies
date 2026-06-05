<template>
  <div class="table-wrap">
    <table>
      <tr v-for="(row, ri) in block.rows" :key="ri">
        <!-- eslint-disable vue/no-v-html -->
        <component
          :is="ri === 0 ? 'th' : 'td'"
          v-for="(cell, ci) in row.cells"
          :key="ci"
          :colspan="cell.span"
          v-html="cell.html"
        />
        <!-- eslint-enable vue/no-v-html -->
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps({ block: { type: Object, required: true } })
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
  max-width: 100%;
  border-radius: 10px;
  border: 1px solid var(--p-surface-800);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

th,
td {
  border: none;
  border-bottom: 1px solid var(--p-surface-800);
  border-right: 1px solid var(--p-surface-800);
  padding: 0.7rem 0.9rem;
  text-align: left;
}

th:last-child,
td:last-child {
  border-right: none;
}

tr:last-child td {
  border-bottom: none;
}

th {
  background: var(--p-surface-800);
  color: var(--p-primary-300);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tr:nth-child(even) {
  background: var(--p-surface-900);
}

tr:hover {
  background: var(--p-surface-800);
}
</style>
