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
