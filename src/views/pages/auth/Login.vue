<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const email = ref('');
const password = ref('');
const checked = ref(false);
const errorMessage = ref('');

const mockLogin = async () => {
    try {
        const res = await axios.get('/demo/data/users.json');
        const users = res.data;

        const user = users.find(u => u.username === email.value && u.password === password.value);

        if (!user) {
            errorMessage.value = '❌ Invalid credentials';
            return;
        }

        // zapis do localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('role', user.role);
        localStorage.setItem('username', user.username);

        // przekierowanie
        router.push('/');
    } catch (err) {
        console.error('Login error:', err);
        errorMessage.value = 'Błąd podczas logowania.';
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)"
            >
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <router-link to="/" class="block text-center mb-8">
                            <img
                                src="/demo/images/intelight/logo-en.svg"
                                alt="Intelight Logo"
                                class="h-14 object-contain mx-auto mb-6 cursor-pointer"
                            />
                        </router-link>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                            Welcome to Intelight Central Battery!
                        </div>
                        <span class="text-muted-color font-medium">Sign in to continue</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Login</label>
                        <InputText id="email1" type="text" placeholder="Login (admin/client)" class="w-full md:w-[30rem] mb-8" v-model="email" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false" />

                        <div v-if="errorMessage" class="text-red-500 text-sm mb-3 text-center">{{ errorMessage }}</div>

                        <Button label="Sign In" class="w-full" @click="mockLogin" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye,
.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
