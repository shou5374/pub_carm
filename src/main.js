import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

// Google Firebaseを使用.
import firebase from 'firebase'
var firebaseConfig  = {
  apiKey: "AIzaSyBdzDbyefwqxAMqASIACsz5zwg2277_nmw",
  authDomain: "carm-656b1.firebaseapp.com",
  projectId: "carm-656b1",
  storageBucket: "carm-656b1.appspot.com",
  messagingSenderId: "255102075430",
  appId: "1:255102075430:web:897b1783294bf3e2329ce7",
  measurementId: "G-EE8PE7W1ZW",
}
firebase.initializeApp(firebaseConfig);

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
