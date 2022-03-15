import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userOtherInfo: {
      name: null,
      displayName: "ゲスト(未サインイン)",
      avatarImage: null,
      belongGroups: [],
      activeGroup: null,
    },
  },
  mutations: {
    setUserOtherInfo (state, otherInfo){
      state.userOtherInfo = otherInfo;
    },
    resetUserOtherInfo(state){
      state.userOtherInfo = {
          name: null,
          displayName: "ゲスト(未サインイン)",
          avatarImage: null,
          belongGroups: [],
          activeGroup: null,
        };
    }
  },
  actions: {
  },
  modules: {
  }
})
