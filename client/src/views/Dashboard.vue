<template>
    <div>
      <h2>Welcome, {{ user?.name }}</h2>
      <p>Credits: {{ user?.credits }}</p>
  
      <h3>Your Websites</h3>
      <ul>
        <li v-for="site in user?.websites" :key="site.id">{{ site.name }}</li>
      </ul>
  
      <button @click="buyNewWebsite">Buy a Website</button>
    </div>
  </template>
  
  <script>
  import { fetchUserData, buyWebsite } from '../services/api';
  
  export default {
    data() {
      return {
        user: null
      };
    },
    async created() {
      await this.loadUser();
    },
    methods: {
      async loadUser() {
        try {
          const token = localStorage.getItem('token');
          this.user = await fetchUserData(token);
        } catch (err) {
          console.error('Error fetching user data', err);
        }
      },
      async buyNewWebsite() {
        try {
          const token = localStorage.getItem('token');
          await buyWebsite(token, 'example-website-id'); // Replace with actual website ID
          await this.loadUser();
        } catch (err) {
          console.error('Error buying website', err);
        }
      }
    }
  };
  </script>