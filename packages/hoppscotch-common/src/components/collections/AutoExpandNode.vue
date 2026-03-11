<script setup lang="ts">
import { watch, onMounted } from "vue"

const props = defineProps<{
  isOpen: boolean
  shouldExpand: boolean
}>()

const emit = defineEmits<{ expand: [] }>()

const tryExpand = () => {
  if (props.shouldExpand && !props.isOpen) emit("expand")
}

// Cascade: when a parent expands, child nodes mount and their onMounted
// fires, expanding them if they're in the active path.
onMounted(tryExpand)

// Tab switch / async tab-state load on refresh: for already-mounted nodes,
// fires when shouldExpand changes false → true.
watch(
  () => props.shouldExpand,
  (should) => {
    if (should) tryExpand()
  }
)

// Re-expand when a node in the active path is collapsed (e.g. user manually
// collapses it while on the active tab — shouldExpand never changes so the
// watcher above doesn't fire). This keeps the active request always visible.
watch(
  () => props.isOpen,
  (open) => {
    if (!open) tryExpand()
  }
)
</script>
