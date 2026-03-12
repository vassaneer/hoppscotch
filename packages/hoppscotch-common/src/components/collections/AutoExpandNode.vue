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
//   - flush: 'post' → callback runs after Vue has updated the DOM, so
//     props.isOpen is always the latest rendered value. Without this,
//     a concurrent reactive change (e.g. setupRESTTabsPersistence rebuilding
//     the tab map) can fire the watcher a second time while props.isOpen is
//     still stale-false, causing a double-toggle that closes the node.
//   - immediate: true → fires after the component's first post-mount flush,
//     handling both the cascade-on-mount case and the page-refresh async load.
//   - watching expandPrefixes.value only (NOT isOpen) → a user-initiated
//     collapse is never overridden; the node only re-opens on the next
//     actual tab switch or page load.
watch(
  () => expandPrefixes?.value,
  (prefixes) => {
    if (prefixes?.has(props.nodeId) && !props.isOpen) emit("expand")
  },
  { immediate: true, flush: "post" }
)
</script>
