<template>
  <div class="login-container">
    <h2>Login to WWWOpoly</h2>
    <form @submit.prevent="handleLogin">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { login } from '../services/api';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: null
    };
  },
  methods: {
    async handleLogin() {
      try {
        const data = await login(this.email, this.password);
        localStorage.setItem('token', data.token);
        this.$router.push('/dashboard');
      } catch (err) {
        this.error = 'Login failed. Check your credentials.';
      }
    }
  }
};
</script>

<style>
/* Basic styles */
.login-container {
  max-width: 400px;
  margin: auto;
  text-align: center;
}
</style>