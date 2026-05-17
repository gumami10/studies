<template>
  <component :is="tag" v-if="tag !== 'heading'" v-html="block.text" />
  <h4 v-else v-html="block.text" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ block: { type: Object, required: true } })

const tag = computed(() => {
  const type = props.block.type
  if (type === 'heading') return 'heading'
  return type
})
</script>
