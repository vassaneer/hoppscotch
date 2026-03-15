<template>
  <div class="flex min-h-screen flex-col items-center justify-between">
    <div
      class="flex flex-1 flex-col items-center justify-center w-full max-w-sm px-4"
    >
      <div class="flex justify-center py-6">
        <img src="/logo.svg" alt="Hoppscotch" class="w-16" />
      </div>

      <div v-if="done" class="text-center space-y-4">
        <icon-lucide-check-circle class="w-10 h-10 text-green-500 mx-auto" />
        <h1 class="text-xl text-secondaryDark">Password set successfully!</h1>
        <p class="text-secondaryLight">You are now signed in.</p>
        <HoppButtonPrimary label="Go to Hoppscotch" @click="goToApp" />
      </div>

      <div v-else-if="tokenError" class="text-center space-y-2">
        <icon-lucide-alert-triangle class="w-10 h-10 text-red-500 mx-auto" />
        <h1 class="text-xl text-secondaryDark">Invalid or expired link</h1>
        <p class="text-secondaryLight">
          This password setup link is invalid or has expired. Please ask your
          admin to send a new invitation.
        </p>
      </div>

      <template v-else>
        <h1 class="text-2xl text-secondaryDark mb-6">Set your password</h1>
        <form class="flex flex-col space-y-4 w-full" @submit.prevent="submit">
          <HoppSmartInput
            v-model="password"
            type="password"
            placeholder=" "
            input-styles="floating-input"
            label="New Password (min. 8 characters)"
          />
          <HoppSmartInput
            v-model="confirmPassword"
            type="password"
            placeholder=" "
            input-styles="floating-input"
            label="Confirm Password"
          />
          <p v-if="mismatch" class="text-red-500 text-sm">
            Passwords do not match.
          </p>
          <HoppButtonPrimary
            :loading="loading"
            type="submit"
            label="Set Password & Sign In"
          />
        </form>
      </template>
    </div>

    <footer class="p-4">
      <HoppButtonSecondary
        class="!font-bold tracking-wide !text-secondaryDark"
        label="HOPPSCOTCH"
        to="/"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import axios from "axios"
import { onMounted, ref } from "vue"
import { platform } from "@hoppscotch/common/platform"
import { initializeApp } from "@hoppscotch/common/helpers/app"

const token = ref("")
const password = ref("")
const confirmPassword = ref("")
const loading = ref(false)
const done = ref(false)
const tokenError = ref(false)
const mismatch = ref(false)

onMounted(() => {
  initializeApp()
  const params = new URLSearchParams(window.location.search)
  const t = params.get("token")
  if (!t) {
    tokenError.value = true
  } else {
    token.value = t
  }
})

const submit = async () => {
  mismatch.value = false
  if (password.value !== confirmPassword.value) {
    mismatch.value = true
    return
  }
  loading.value = true
  try {
    await axios.post(
      `${import.meta.env.VITE_BACKEND_API_URL}/auth/local/set-password`,
      { token: token.value, password: password.value },
      { withCredentials: true }
    )
    await platform.auth.performAuthInit()
    done.value = true
  } catch (e: any) {
    tokenError.value = true
    console.error(e)
  }
  loading.value = false
}

const goToApp = () => {
  window.location.href = "/"
}
</script>

<route lang="yaml">
meta:
  layout: empty
</route>
