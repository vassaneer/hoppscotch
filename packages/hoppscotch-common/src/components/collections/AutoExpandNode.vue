<script lang="ts">
// Symbol used to provide/inject the active expand-path set.
// MyCollections and TeamCollections provide this; AutoExpandNode injects it.
export const EXPAND_PREFIXES_KEY = Symbol("expandPrefixes")
</script>

<script setup lang="ts">
import { inject, watchEffect, type ComputedRef } from "vue"

const props = defineProps<{
  isOpen: boolean
  nodeId: string
}>()

const emit = defineEmits<{ expand: [] }>()

// Injected directly from the owning collection component — bypasses slot
// prop propagation so deeply-nested nodes react immediately when the active
// tab changes, without waiting for intermediate TreeBranch re-renders.
const expandPrefixes = inject<ComputedRef<Set<string>> | null>(
  EXPAND_PREFIXES_KEY,
  null
)

// Single reactive effect handles all three cases in one place:
//  1. Initial mount with shouldExpand already true (e.g. page refresh)
//  2. Tab switch: expandPrefixes changes → should becomes true
//  3. Manual collapse while on active tab: isOpen flips false, should still true
watchEffect(
  () => {
    const should = expandPrefixes?.value?.has(props.nodeId) ?? false
    if (should && !props.isOpen) emit("expand")
  },
  { flush: "post" }
)
</script>
