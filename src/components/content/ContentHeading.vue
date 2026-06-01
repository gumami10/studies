<template>
  <!-- eslint-disable vue/no-v-html -->
  <component :is="tag" v-if="tag !== 'heading'" v-html="block.text" />
  <h4 v-else v-html="block.text" />
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({ block: { type: Object, required: true } })

const tag = computed(() => {
  const type = props.block.type
  if (type === 'heading') return 'heading'
  return type
})
</script>
