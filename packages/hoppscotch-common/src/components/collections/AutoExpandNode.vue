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

// `onMounted` handles the cascade: when a parent expands, its children
// mount and each child fires `onMounted`, triggering expansion if needed.
// This cascades all the way down to the target folder.
onMounted(tryExpand)

// `watch` (without immediate) handles tab switches after initial render —
// when `shouldExpand` changes from false → true for already-mounted nodes.
watch(() => props.shouldExpand, tryExpand)
</script>
