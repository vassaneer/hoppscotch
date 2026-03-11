<script setup lang="ts">
import { watch, onMounted } from "vue"

const props = defineProps<{
  isOpen: boolean
  shouldExpand: boolean
}>()

const emit = defineEmits<{ expand: [] }>()

// Synchronous check-and-expand. No nextTick needed: we read the current prop
// values immediately, so there is no async gap where a double-toggle could
// flip the node back closed.
const tryExpand = () => {
  if (props.shouldExpand && !props.isOpen) emit("expand")
}

// Cascade: when a parent expands its children mount, each child's onMounted
// fires and expands it if needed, revealing grandchildren, and so on.
onMounted(tryExpand)

// Tab switch (or async tab-state load on refresh): for already-mounted nodes
// the watch fires when shouldExpand changes false → true.
watch(
  () => props.shouldExpand,
  (should) => {
    if (should) tryExpand()
  }
)
</script>
