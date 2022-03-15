<template>
  <v-app>
    <v-main style="background:#F5F5F5;height: auto;" class="pa-0 fill-height">
      <v-container :class="{ 'pa-0': $vuetify.breakpoint.sm || $vuetify.breakpoint.xs }">
        <Register />
      </v-container>
    </v-main>
    <footer style="background: #F5F5F5">
      <div class="pa-8 d-flex flex-warp justify-center fill-wdith">
        <router-link to="/" class="link-caption mr-8">プライバシーポリシー</router-link>
        <router-link to="/" class="link-caption mr-8">利用規約</router-link>
      </div>
    </footer>
    
    <router-view/>
  </v-app>
</template>

<script>
import Register from '@/components/Register.vue'

export default {
  name: 'account',
  components: {
    Register
  },
}
</script>
