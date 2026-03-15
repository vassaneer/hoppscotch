<template>
  <main class="flex h-screen flex-col justify-center items-center flex-1">
    <div class="flex flex-col items-center px-4 w-full max-w-sm">
      <div class="flex justify-center py-6">
        <img src="/logo.svg" alt="hoppscotch-logo" class="w-20" />
      </div>

      <div v-if="done" class="text-center space-y-4">
        <icon-lucide-check-circle class="w-10 h-10 text-green-500 mx-auto" />
        <h1 class="text-xl text-secondaryDark">Password set successfully!</h1>
        <p class="text-secondaryLight">You are now signed in.</p>
        <HoppButtonPrimary label="Go to Dashboard" @click="goToDashboard" />
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
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { auth } from '~/helpers/auth';

const token = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const done = ref(false);
const tokenError = ref(false);
const mismatch = ref(false);

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const t = params.get('token');
  if (!t) {
    tokenError.value = true;
  } else {
    token.value = t;
  }
});

const submit = async () => {
  mismatch.value = false;
  if (password.value !== confirmPassword.value) {
    mismatch.value = true;
    return;
  }
  loading.value = true;
  try {
    await auth.setPassword(token.value, password.value);
    done.value = true;
  } catch (e: any) {
    const msg = e?.response?.data?.message ?? '';
    if (msg.includes('expired') || msg.includes('invalid')) {
      tokenError.value = true;
    }
    console.error(e);
  }
  loading.value = false;
};

const goToDashboard = () => {
  window.location.href = import.meta.env.VITE_ADMIN_URL;
};
</script>

<route lang="yaml">
meta:
  layout: empty
</route>
