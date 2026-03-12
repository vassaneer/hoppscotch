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

// Guards against calling toggleChildren() (a TOGGLE) twice before TreeBranch
// has re-rendered to update props.isOpen back to true.
//
// Problem: when collections and the tab map both load asynchronously in
// setupLater(), they fire reactive changes in the same flush cycle. The
// watch's immediate call runs synchronously (emits expand, queuing a
// TreeBranch re-render). But that re-render hasn't happened yet when the
// post-flush watcher fires a second time — props.isOpen is still stale-false
// — so toggleChildren() is called again, closing the node.
//
// Guard: once we emit expand, set expandEmitted = true so any subsequent
// fires of the watcher are no-ops until the expand actually takes effect
// (props.isOpen becomes true, which resets the flag).
let expandEmitted = false

// Expand this node when the active-path set changes to include its ID.
//   - immediate: true  → fires synchronously during setup (mount-time cascade
//                         and page-refresh async load).
//   - flush: 'post'    → subsequent (non-immediate) fires run after renders,
//                         giving props.isOpen the most up-to-date value.
//   - Source is expandPrefixes.value only (NOT isOpen) → user-initiated
//     collapses are never overridden; the node only re-opens on the next
//     actual tab switch or page load.
watch(
  () => expandPrefixes?.value,
  (prefixes) => {
    if (prefixes?.has(props.nodeId) && !props.isOpen && !expandEmitted) {
      expandEmitted = true
      emit("expand")
    }
  },
  { immediate: true, flush: "post" }
)

// Reset the guard when the expand takes visible effect (isOpen → true) or
// the node is intentionally closed by the user (isOpen → false).
// This allows subsequent tab switches to trigger re-expansion.
watch(
  () => props.isOpen,
  (isOpen) => {
    expandEmitted = isOpen
  }
)
</script>
