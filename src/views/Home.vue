<template>
  <v-app>
    <v-card>
      <v-container fluid class=" mx-auto fill-width">
        <v-card class="pt-2 px-1 mx-auto" outlined elevation="3" max-width="640px">

          <v-row dense>
            <v-col>
              <v-dialog ref="dateDialog" v-model="dateMenu" :return-value.sync="time1" persistent max-width="320">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="dateRangeText" label="借用期間" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
                </template>
                <v-date-picker v-if="dateMenu" v-model="dates" range no-title>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="dateMenu = false;">ok</v-btn>
                  <v-btn text color="primary" @click="dateMenu = false;">キャンセル</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>
          </v-row>

          <v-row dense>
            <v-col>
              <v-dialog ref="dialog1" v-model="menu1" :return-value.sync="time1" persistent max-width="320">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="time1" label="借用時刻" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on"></v-text-field>
                </template>
                <v-time-picker v-if="menu1" v-model="time1" :allowed-minutes="allowedStep" full-width @click:minute="setRentTime($refs.dialog1, time1); " format="24hr">
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu1 = false;">キャンセル</v-btn>
                </v-time-picker>
              </v-dialog>
            </v-col>

            <v-col>
              <v-dialog ref="dialog2" v-model="menu2" :return-value.sync="time2" persistent max-width="320">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="time2" label="返却時刻" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on"></v-text-field>
                </template>
                <v-time-picker v-if="menu2" v-model="time2" :allowed-minutes="allowedStep" full-width @click:minute="setRentTime($refs.dialog2, time2);" format="24hr">
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu2 = false;">キャンセル</v-btn>
                </v-time-picker>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card>
      </v-container>

      <v-container fluid>
        <v-row v-if="time1 && time2 && dates.length >= 1" dense>
          <v-col v-for="car in cars" :key="car.uid" cols="6" sm="4" md="4" lg="3">
            <v-card>
              <v-img :src="car.imageUrl" class="white--text" gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)" height="150px"></v-img>

              <v-card-actions>
                <v-card-title v-text="car.name" class="text-body-1"></v-card-title>
                <v-spacer></v-spacer>

                <v-btn @click.stop="onClickBookBtn(car)" icon color="blue lighten-2"><v-icon>mdi-calendar-month</v-icon></v-btn>

              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-row v-if="time1 == null || time2 == null || dates.length < 1" dense>
          <v-col>
            <v-card outlined elevation="3">
              <div class="pa-4">※ 借用期間等をご指定いただくことで、<br>ここに借用可能車両一覧が表示されます。</div>
              
            </v-card>
          </v-col>
        </v-row>
        
        <v-dialog v-if="currentCar" v-model="bookDialog" max-width="640">

            <v-card max-width="640">
                <v-card-title class="text-center pa-4"><h4 class="fill-width">予約確認</h4></v-card-title>
                <v-divider></v-divider>

                <v-card-text class="pt-4 px-3 py-3">
                  <template>
                    <v-text-field v-model="currentCar.name" label="車両ID" prepend-icon="mdi-car" readonly ></v-text-field>
                    <v-text-field v-model="dateRangeText" label="借用期間" prepend-icon="mdi-calendar" readonly ></v-text-field>
                    <v-text-field v-model="time1" label="借用時刻" prepend-icon="mdi-clock-time-four-outline" readonly ></v-text-field>
                    <v-text-field v-model="time2" label="返却時刻" prepend-icon="mdi-clock-time-four-outline" readonly ></v-text-field>
                  </template>
                </v-card-text>

                <div class="px-3 pb-2">
                    <v-btn @click="bookCar()" fill-width height="48px" color="success">予約確定</v-btn>
                </div>
            </v-card>
        </v-dialog>
                
      </v-container>
    </v-card>
  </v-app>
</template>

<script>
  import firebase from 'firebase'

  export default {
    data: () => ({
      db: null,
      cars: [],
      currentCar: null,
      bookDialog: false,

      dates: [],

      time1: null,
      time2: null,
      dateMenu: false,
      menu1: false,
      menu2: false,

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
        if (this.dates.length == 2){
          const startDateTime = new Date(this.dates[0].replace(/-/g,"/") + " " + this.time1); // .replace(/-/g,"/") を行わないとsafariでは、正常にDate形式に変換できない.
          const endDateTime = new Date(this.dates[1].replace(/-/g,"/") + " " + this.time2);
          console.log(startDateTime);
          console.log(endDateTime);
          if (startDateTime < endDateTime){
            const groupRef = this.db.collection('group');
            groupRef.doc(activeGroupName).get().then(function(group){
              _this.activeGroup = group.data();
            }).then(function(){
              console.log(_this.activeGroup);
              if (_this.activeGroup){
                console.log("アクティブグループを確認したため、車両一覧表示可能状態に移行します.");
                groupRef.doc(_this.activeGroup.name).collection('car').get().then(function (querySnapshot) {
                  _this.cars = [];
                  querySnapshot.forEach(function (car) {
                    var addedFlag = false;
                    car.ref.collection('report').get().then(function(reportQuery){
                      reportQuery.forEach(function(report){
                        var targetStartDateTime = report.data().startDateTime.toDate();
                        var targetEndDateTime = report.data().endDateTime.toDate();
                        if (_this.dates.length>0 && _this.time1 && _this.time2){
                          if (!_this.checkDateTime(startDateTime, endDateTime, targetStartDateTime, targetEndDateTime)){
                            throw new Error('期間重複');
                          }
                        }
                      })
                    }).then(function(){
                      if (!addedFlag){
                        addedFlag = true;
                        console.log("重複なし");
                        _this.cars.push(car.data());
                      }
                    }).catch(function(){
                      console.log("重複あり");
                    })
                  })
                })
              } else {
                console.log("アクティブなグループがないため、車両一覧表示可能状態に移行できません");
              }
            })
          } else {
            console.log("入力日時に矛盾があります");
          }
        }
      },

      bookCar(){
        var _this = this;
        console.log(`車両「${this.currentCar.name}」の予約準備`);
        const startDateTime = new Date(this.dates[0].replace(/-/g,"/") + " " + this.time1);
        const endDateTime = new Date(this.dates[1].replace(/-/g,"/") + " " + this.time2);
        if (startDateTime < endDateTime){ // 借用日時と返却日時に矛盾がないことを確認
          console.log("借用日時に矛盾がなかったので、予約処理を進めます");
          var user = firebase.auth().currentUser;
          if (user) {
            console.log("認証済ユーザを確認したため、車両予約を作成します");

            let reportContent = {
              // 予約時に設定
              startDateTime: firebase.firestore.Timestamp.fromDate(startDateTime), // 検索時の比較用にDate形式で保存.保存時にタイムスタンプ型に自動変換される.
              endDateTime: firebase.firestore.Timestamp.fromDate(endDateTime), // 検索時の比較用にDate形式で保存.
              dateRange: this.dates, // 借用期間
              startTime: this.time1, // 借用時刻
              endTime: this.time2, // 返却時刻
              createdAt: firebase.firestore.Timestamp.fromDate(new Date()), // 予約確定日時
              createdBy: user.uid, // 作成ユーザのUID
              carId: _this.currentCar.name, // レポートの一覧表示用
              driverName: this.$store.state.userOtherInfo.displayName, // 運転手は予約者と異なることがあるので、レポート画面でも編集可能

              // 予約後のレポート画面で編集
              passInfos: [{
                startLocation: "",
                endLocation: "",
                carry: false, // 積載状況
              },], // 主な経過地点と積載状況
              restInfos:[{
                location: "", // 休憩場所
                startTime: "", // 休憩開始時刻
                endTime: "", // 休憩終了時刻
              },],
              milage: "", // 走行距離
              supply: "", // 補給量
              toll: "", // 通行料金
            }

            // 書き込み後：期間重複チェック. 書き込み前に行うと、チェック中に他の予約が入るかもしれないため.
            const carRef = _this.db.collection('group').doc(_this.activeGroup.name).collection('car');
            const reportRef = carRef.doc(_this.currentCar.name).collection('report');
            reportRef.add(reportContent).then(function(addedReport){
              reportRef.get().then(function(reports) {
                let deletedFlag = false;
                reports.forEach(function (report) {
                  var targetStartDateTime = report.data().startDateTime.toDate();
                  var targetEndDateTime = report.data().endDateTime.toDate();
                  if (!deletedFlag && report.id!=addedReport.id && !_this.checkDateTime(startDateTime, endDateTime, targetStartDateTime, targetEndDateTime)){
                    // 予約確認時間が重複して複数の予約が削除される可能性があるが、低確率なので障害としない.
                    deletedFlag = true;
                    reportRef.doc(addedReport.id).delete().then(function(){
                      alert("期間が重複する予約が既に行われていたため、予約をキャンセルします.");
                    })
                  }
                });
              })
            })
            this.bookDialog = false;
          } else {
            alert("認証済ユーザが確認できないため、予約処理をキャンセルします.");
          }
        } else {
          alert("借用日時に矛盾があります");
        }
      },

      checkDateTime(startDt1, endDt1, startDt2, endDt2){
        return (endDt1 < startDt2 || endDt2 < startDt1);
      },

      onClickBookBtn(car) {
        this.currentCar = car
        this.bookDialog = true
      },

      setRentTime: function (dialog, time) {
        dialog.save(time);
        this.menu1 = false;
        this.menu2 = false;
      },
      allowedStep: m => m % 15 === 0, // 15分単位で扱う
      
    },

    computed: {
      typeClass () {
        const type = ['text', this.model]
        const [, breakpoint] = this.current

        if (breakpoint !== 'all') {
          type.splice(1, 0, breakpoint)
        }

        return `.${type.join('-')}`
      },
      current () {
        return this.sizes.find(size => size[2] === this.model)
      },
      dateRangeText () {
        return this.dates.join(' ~ ')
      },
    },
    watch: {
      dates: function(){
        if (this.dates.length>0 && this.time1 && this.time2){
          var activeGroupName = this.$store.state.userOtherInfo.activeGroup;
          this.showCars(activeGroupName);
        }
      },
      time1: function(){
        if (this.dates.length>0 && this.time1 && this.time2){
          var activeGroupName = this.$store.state.userOtherInfo.activeGroup;
          this.showCars(activeGroupName);
        }
      },
      time2: function(){
        if (this.dates.length>0 && this.time1 && this.time2){
          var activeGroupName = this.$store.state.userOtherInfo.activeGroup;
          this.showCars(activeGroupName);
        }
      },
    }
  }
</script>
