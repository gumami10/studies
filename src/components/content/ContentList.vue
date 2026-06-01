<template>
  <component :is="tag" :class="{ check: block.listType === 'check' }">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <li v-for="(item, i) in block.items" :key="i" :colspan="item.span" v-html="item.html" />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({ block: { type: Object, required: true } })

const tag = computed(() => (props.block.listType === 'ol' ? 'ol' : 'ul'))
</script>
