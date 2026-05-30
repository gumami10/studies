<template>
  <div
    id="highlight-toolbar"
    :style="{ display: show ? 'flex' : 'none', top: posY, left: posX }"
    @click.stop
  >
    <button
      class="hl-btn"
      data-color="yellow"
      style="background: #ffe066"
      title="Yellow"
      @click="$emit('apply', 'yellow')"
    />
    <button
      class="hl-btn"
      data-color="green"
      style="background: #90ee90"
      title="Green"
      @click="$emit('apply', 'green')"
    />
    <button
      class="hl-btn"
      data-color="blue"
      style="background: #87ceeb"
      title="Blue"
      @click="$emit('apply', 'blue')"
    />
    <button
      class="hl-btn"
      data-color="pink"
      style="background: #ffb6c1"
      title="Pink"
      @click="$emit('apply', 'pink')"
    />
    <button class="hl-btn-remove" title="Remove highlight" @click="$emit('remove')">X</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  position: { type: Object, default: () => ({ top: 0, left: 0 }) },
})

defineEmits(['apply', 'remove'])

const posY = computed(() => {
  const top = (props.position?.top ?? 0) - 44
  return `${Math.max(top, 8)}px`
})

const posX = computed(() => {
  const left = (props.position?.left ?? 0) - 92
  return `${Math.max(left, 8)}px`
})
</script>
