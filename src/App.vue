<template>
  <div id="app">
    <v-app>
      <v-container id="nav" class="mx-auto">
        <v-row dense>
          <v-spacer></v-spacer>
          <v-col v-if="userOtherInfo.name" cols="10">
            <router-link to="/">Home</router-link> |
            <router-link to="/accountManagement">Account</router-link> |
            <router-link to="/carManagement">Car</router-link> |
            <router-link to="/report">Report</router-link> 
          </v-col>
          <v-col v-if="userOtherInfo.name==null" cols="10">
            <router-link to="/about">About</router-link> |
            <router-link to="/account">Account</router-link>
          </v-col>
          <v-spacer></v-spacer>
          <v-icon large @click="clickBtn">mdi-account-circle</v-icon>
        </v-row>
      </v-container>

      <router-view/>

      
      <v-dialog v-model="accountDialog" width="500">
        <v-card>
          <v-card-title class="headline grey lighten-2">アカウント</v-card-title>

          <v-container class="px-3">
            <v-text-field v-model="userOtherInfo.displayName" label="displayName" outlined readonly></v-text-field>
          </v-container>

          <v-container class="px-3">
            <v-text-field v-model="userOtherInfo.activeGroup" label="activeGroup" outlined readonly></v-text-field>
          </v-container>

          <v-divider></v-divider>
          <v-container v-if="userOtherInfo.name" class="px-3">
            <v-btn @click="signOut" block height="48px" outlined color="error">サインアウト</v-btn>
          </v-container>
          <v-container class="px-3">
            <v-btn @click="accountDialog = false" block height="48px" outlined color="success">閉じる</v-btn>
          </v-container>
        </v-card>
      </v-dialog>

    </v-app>
  </div>
</template>

<script>
  import firebase from 'firebase'
  import "firebase/auth"

  export default {
    data: () => ({
      db: firebase.firestore(),
      accountDialog: false,
    }),
    created() {
      const _this = this;
      const ref = this.db.collection('user');
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // ref.doc(user.uid).get().then(function(doc){
            // if (doc.exists && _this.$store.state.userOtherInfo.name!=user.uid){ // こっちはサインインとサインアウト時のみ実行される
          ref.doc(user.uid).onSnapshot(function(doc){
            if (doc.exists){
              console.log("ユーザ付加情報が作成済のため、セット ユーザ付加側ID: " + _this.$store.state.userOtherInfo.name + ", ユーザ側ID：" + user.uid);
              console.log(doc.data());
              console.log("以上を付加情報としてセットします");
              _this.$store.commit('setUserOtherInfo', doc.data());
            } else {
              console.log("ユーザ付加情報が未作成 or 既にユーザ付加情報をセット済み");
            }
          });
        }
      });
    },
    methods: {
      clickBtn: function(){
        this.accountDialog = true;
      },
      signOut: function() {
        console.log("sign out")
        const _this = this;
        this.user = null;
        this.accountDialog = false;
        firebase.auth().signOut()
        .then(()=>{
          console.log("サインアウトしたため、ユーザ情報を初期化");
          _this.$store.commit('resetUserOtherInfo');
        })
        .catch((error)=>{
          alert(error.message);
        })
      },
    },
    computed: {
      userOtherInfo(){
        return this.$store.state.userOtherInfo;
      }
    },
  }

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}


</style>
