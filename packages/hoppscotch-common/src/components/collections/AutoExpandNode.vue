<script lang="ts">
// Symbol used to provide/inject the active expand-path set.
// MyCollections and TeamCollections provide this; AutoExpandNode injects it.
export const EXPAND_PREFIXES_KEY = Symbol("expandPrefixes")
</script>

<script setup lang="ts">
import { inject, watch, type ComputedRef } from "vue"

const props = defineProps<{
  isOpen: boolean
  nodeId: string
}>()

const emit = defineEmits<{ expand: [] }>()

const expandPrefixes = inject<ComputedRef<Set<string>> | null>(
  EXPAND_PREFIXES_KEY,
  null
)

// Expand this node whenever the active-path set changes to include it:
//   - immediate: true  → handles cascade on mount and page-refresh async load
//   - watching expandPrefixes.value only (NOT isOpen) → a user-initiated
//     collapse is never overridden; the node only re-opens on the next
//     actual tab switch or page load
watch(
  () => expandPrefixes?.value,
  (prefixes) => {
    if (prefixes?.has(props.nodeId) && !props.isOpen) emit("expand")
  },
  { immediate: true }
)
</script>
