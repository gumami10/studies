<template>
  <dl class="glossary">
    <template v-for="(term, i) in block.terms" :key="i">
      <dt>{{ term.text }}</dt>
      <dd v-if="block.definitions[i]">{{ block.definitions[i].text }}</dd>
    </template>
  </dl>
</template>

<script setup>
defineProps({ block: { type: Object, required: true } })
</script>
