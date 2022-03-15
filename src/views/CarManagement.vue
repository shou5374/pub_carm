<template>
  <v-app>
    <v-card>
      <v-container v-if="activeGroup && activeGroup.admin==userOtherInfo.name" fluid class=" mx-auto fill-width">
        <v-card class="pt-2 px-1 mx-auto" elevation="0" max-width="640px">
          <v-card-text class="px-3 py-3">
            <v-btn block color="success" @click="createCarDialog=true">車両追加</v-btn>
          </v-card-text>
        </v-card>
      </v-container>

      <v-container fluid>
        <v-row dense>
          <v-col v-for="car in cars" :key="car.uid" cols="6" sm="4" md="4" lg="3">
            <v-card>
              <v-img :src="car.imageUrl" class="white--text" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="150px"></v-img>

              <v-card-actions>
                <v-card-title v-text="car.name" class="text-body-1"></v-card-title>
                <v-spacer></v-spacer>

                <v-btn v-if="activeGroup && activeGroup.admin==userOtherInfo.name" @click="deleteCar(car.name)" icon color="red lighten-2"><v-icon>mdi-delete</v-icon></v-btn>

              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
        
    <v-dialog v-model="createCarDialog" max-width="640">
        <v-card max-width="640">
            <v-card-title class="text-center pa-4"><h4 class="fill-width">予約確認</h4></v-card-title>
            <v-divider></v-divider>

            <v-card-text class="pt-4 px-3 py-3">
              <template>
                <v-text-field v-model="carId" :rules="[carIdRules.required, carIdRules.regex]" label="車両ID" prepend-icon="mdi-car"></v-text-field>
              </template>
            </v-card-text>

            <div class="px-3 pb-2">
                <v-btn @click="addItem" fill-width height="48px" color="success">追加確定</v-btn>
            </div>
        </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
  import firebase from 'firebase'

  export default {
    data: () => ({
      db: null,
      cars: [],
      currentCar: null,

      createCarDialog: false,

      carId: null,
      carIdRules: {
        required: (value) =>
        !!value || '車両IDは必須です',
        regex: (value) =>
        /^(?=.*?[\d])[\d]{1,6}$/.test(value) ||
        '半角数字のみを用いて1文字以上6文字以下で入力してください'
      },
      activeGroup: null,

    }),

    created: function () {
      this.db = firebase.firestore();
      var _this = this;
      var activeGroupName = this.$store.state.userOtherInfo.activeGroup;
      if (activeGroupName){
        console.log("アクティブグループを確認したため、車両一覧表示可能状態に移行します.");
        this.showCars(activeGroupName);
      } else {
        this.$store.watch(
          (state) => state.userOtherInfo,
          (newUserOtherInfo, )=>{
            _this.showCars(newUserOtherInfo.activeGroup);
          }
        );
      }
    },

    methods: {
      showCars(activeGroupName){ // userOtherInfoが所持するactiveGroupは名前だけのため.
        var _this = this;
        const groupRef = this.db.collection('group');
        groupRef.doc(activeGroupName).get().then(function(group){
          _this.activeGroup = group.data();
        }).then(function(){
          console.log(_this.activeGroup);
          if (_this.activeGroup){
            console.log("アクティブグループを確認したため、車両一覧表示可能状態に移行します.");
            groupRef.doc(_this.activeGroup.name).collection('car').onSnapshot(function (querySnapshot) {
              _this.cars = [];
              querySnapshot.forEach(function (doc) {
                  var data = doc.data();
                  _this.cars.push(data)
              })
            })
          } else {
            console.log("アクティブなグループがないため、車両一覧表示可能状態に移行できません");
          }
        })
      },
      
      addItem() {
        var _this = this;
        if (this.carId && this.activeGroup){
          const carContent = {
            name: this.carId,
            imageUrl: "https://cdn.vuetifyjs.com/images/parallax/material2.jpg",
          }
          const carRef = this.db.collection('group').doc(this.activeGroup.name).collection('car');
          carRef.doc(this.carId).set(carContent).then(()=>{
            alert("車両「" + this.carId + "」を追加しました");
            _this.createCarDialog = false;
          }).catch((error)=>{
            alert(error.message);
          })
        } else {
          alert("車両IDを指定してください.")
        }
      },
      deleteCar(carName){
        const carRef = this.db.collection('group').doc(this.activeGroup.name).collection('car');
        carRef.doc(carName).delete().then(function(){
          console.log(`車両「${carName}」を削除しました`);
        })

      }
    },

    computed: {
      userOtherInfo(){
        return this.$store.state.userOtherInfo;
      }
    },
  }
</script>
