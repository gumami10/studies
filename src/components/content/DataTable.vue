<template>
  <table>
    <tr v-for="(row, ri) in block.rows" :key="ri">
      <component
        :is="ri === 0 ? 'th' : 'td'"
        v-for="(cell, ci) in row.cells"
        :key="ci"
        :colspan="cell.span"
        v-html="cell.html"
      />
    </tr>
  </table>
</template>

<script setup lang="ts">
defineProps({ block: { type: Object, required: true } })
</script>
