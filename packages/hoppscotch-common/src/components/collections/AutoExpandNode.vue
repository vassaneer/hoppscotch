<script setup lang="ts">
import { watch } from "vue"

const props = defineProps<{
  isOpen: boolean
  shouldExpand: boolean
}>()

const emit = defineEmits<{ expand: [] }>()

// When this node is in the path to the active request and is currently
// collapsed, trigger expansion. The `immediate` flag handles the case
// where a parent was just expanded and this child mounts already needing
// to be open (cascading expansion down to the target folder).
watch(
  () => props.shouldExpand,
  (should) => {
    if (should && !props.isOpen) emit("expand")
  },
  { immediate: true }
)
</script>
