<script setup lang="ts">
import { watch, onMounted, nextTick } from "vue"

const props = defineProps<{
  isOpen: boolean
  shouldExpand: boolean
}>()

const emit = defineEmits<{ expand: [] }>()

const tryExpand = async () => {
  if (!props.shouldExpand || props.isOpen) return
  await nextTick()
  // Re-check after tick: props may have changed while awaiting,
  // and toggleChildren is a toggle — calling it twice would close the node.
  if (!props.shouldExpand || props.isOpen) return
  emit("expand")
}

// Cascade: when a parent expands, child nodes mount and onMounted triggers
// expansion, which reveals grandchildren, and so on recursively.
onMounted(tryExpand)

// Tab switch: for already-mounted (visible) nodes, fire when shouldExpand
// changes from false → true.
watch(
  () => props.shouldExpand,
  (should) => {
    if (should) tryExpand()
  }
)
</script>
