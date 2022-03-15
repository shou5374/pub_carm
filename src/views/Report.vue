<template>
  <v-app>
    <v-card>
      <v-container fluid class="fill-width">
        <v-row dense class="align-center">
          <v-col v-for="(report, index) in reports" :key="index" cols="12" sm="6" md="4" lg="3">
            <v-card outlined elevation="3">
              <v-card-text class="blue lighten-1 py-1 d-flex justify-space-around">
                <v-btn @click.stop="onClickReportEditBtn(report)" icon><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn @click.stop="onClickReportExportBtn(report)" icon><v-icon>mdi-export-variant</v-icon></v-btn>
                <v-btn @click.stop="onClickReportCancelBtn(report)" icon><v-icon>mdi-delete</v-icon></v-btn>
              </v-card-text>

              <v-card-actions>
                <!-- <v-card-title v-text="report.title" class="text-body-1"></v-card-title> -->
                <v-row class="px-2">
                  <v-col class="px-1 py-0 pt-1">
                    <v-text-field value="予約" label="ステータス" readonly></v-text-field>
                  </v-col>
                  <v-col class="px-1 py-0 pt-1">
                    <v-text-field v-model="report.carId" label="車両ID" readonly></v-text-field>
                  </v-col>
                </v-row>
                
                <v-spacer></v-spacer>

                <!-- 編集と日誌出力ができるのは、レポートのみ. まだ未来もしくは現在の日時(予約状態)のものはこれらのボタンを非表示にする. -->
                <!-- <v-btn @click.stop="onClickReportEditBtn(report)" icon color="blue lighten-2"><v-icon>mdi-pencil-outline</v-icon></v-btn>
                <v-btn @click.stop="onClickReportExportBtn(report)" icon color="green lighten-2"><v-icon>mdi-export-variant</v-icon></v-btn>

                <v-btn @click.stop="onClickReportCancelBtn(report)" icon color="red lighten-2"><v-icon>mdi-close-circle-outline</v-icon></v-btn> -->

              </v-card-actions>
              <v-row class="px-4 py-0">
                  <v-col cols="8" class="px-1 py-0"><v-text-field v-model="report.dateRange" label="借用期間" readonly></v-text-field></v-col>
                <v-col cols="2" class="px-1 py-0"><v-text-field v-model="report.startTime" label="借用時刻" readonly></v-text-field></v-col>
                <v-col cols="2" class="px-1 py-0"><v-text-field v-model="report.endTime" label="返却時刻" readonly></v-text-field></v-col>
              </v-row>
              
            </v-card>
          </v-col>
        </v-row>
        
        <!--ダイアログ：日報出力-->
        <v-dialog v-if="currentReport" v-model="reportEditDialog" class="sm-auto" max-width="640">
            <v-card class="sm-auto" max-width="640">
                <v-card-title class="text-center pa-4"><h4 class="fill-width">レポートの更新・情報追加</h4></v-card-title>
                <v-divider></v-divider>

                <v-card-text class="pt-4 px-3 py-3">
                  <template>
                    <v-text-field v-model="currentReport.createdAt" label="作成日" class="px-2 py-0 pt-2" prepend-icon="mdi-calendar" readonly ></v-text-field>
                    <v-text-field v-model="currentReport.dateRange" label="借用期間" class="px-2 py-0" prepend-icon="mdi-calendar" readonly ></v-text-field>
                    <v-text-field v-model="currentReport.startTime" label="借用時刻" class="px-2 py-0" prepend-icon="mdi-clock" readonly ></v-text-field>
                    <v-text-field v-model="currentReport.endTime" label="返却時刻" class="px-2 py-0" prepend-icon="mdi-clock" readonly ></v-text-field>
                    <v-text-field v-model="currentReport.carId" label="車両ID" class="px-2 py-0" prepend-icon="mdi-car" readonly ></v-text-field>
                    <v-text-field v-model="currentReport.driverName" label="運転者名" class="px-2 py-0" prepend-icon="mdi-car" ></v-text-field>
                    
                    <v-divider></v-divider>
                    <v-list>
                      <v-list-item v-for="(item, index) in currentReport.passInfos" :key="index">
                        <v-row class="pt-2">
                          <v-col cols="3" class="px-1">
                            <v-text-field v-model="currentReport.passInfos[index].startLocation" label="出発地点" class="px-0 py-0"></v-text-field>
                          </v-col>
                          <v-col cols="3" class="px-1">
                            <v-text-field v-model="currentReport.passInfos[index].endLocation" label="到着地点" class="px-0 py-0"></v-text-field>
                          </v-col>
                          <v-col cols="6" class="px-1 pt-0">
                            <v-switch v-model="currentReport.passInfos[index].carry" :label="`積載: ${getOnOffString(currentReport.passInfos[index].carry, ['有', '無'])}`"></v-switch>
                          </v-col>
                        </v-row>
                        
                      </v-list-item>
                      
                    </v-list>
                    <v-container class="px-4 pt-0 pb-3">
                      <v-btn block @click="addPassInfo"><v-icon>mdi-plus</v-icon>経過情報追加</v-btn>
                    </v-container>
                    <v-divider></v-divider>

                    <v-list>
                      <v-list-item v-for="(item, index) in currentReport.restInfos" :key="index">
                        <v-row class="pt-2">
                          <v-col cols="2" class="px-1">
                            <v-text-field v-model="currentReport.restInfos[index].location" label="地点" class="px-0 py-0"></v-text-field>
                          </v-col>
                          <v-col cols="5" class="px-1">
                            <v-text-field v-model="currentReport.restInfos[index].startTime" label="開始時刻" class="px-0 py-0"></v-text-field>
                          </v-col>
                          <v-col cols="5" class="px-1">
                            <v-text-field v-model="currentReport.restInfos[index].endTime" label="終了時刻" class="px-0 py-0"></v-text-field>
                          </v-col>
                        </v-row>
                      </v-list-item>
                      
                    </v-list>
                    <v-container class="px-4 pt-0 pb-3">
                      <v-btn block @click="addRestInfo"><v-icon>mdi-plus</v-icon>休憩情報追加</v-btn>
                    </v-container>
                    <v-divider></v-divider>

                    
                    <v-text-field v-model="currentReport.milage" label="走行距離" class="px-2 py-0 pt-2" prepend-icon="mdi-car" ></v-text-field>
                    <v-text-field v-model="currentReport.supply" label="補給量" class="px-2 py-0" prepend-icon="mdi-car" ></v-text-field>
                    <v-text-field v-model="currentReport.toll" label="通行料金" class="px-2 py-0" prepend-icon="mdi-car" ></v-text-field>
                  </template>
                </v-card-text>

                <div class="px-3 pb-2">
                    <v-btn @click="saveReport" fill-width height="48px" color="success">編集内容の保存</v-btn>
                </div>
            </v-card>
        </v-dialog>
        
        <!--ダイアログ：日報出力-->
        <v-dialog v-if="currentReport" v-model="reportExportDialog" class="sm-auto" max-width="640">

            <v-card class="sm-auto" max-width="640">
                <v-card-title class="text-center pa-4"><h4 class="fill-width">日報</h4></v-card-title>
                <v-divider></v-divider>

                <v-card-text class="pt-4 px-3 py-3">
                  <template>
                    以下のレポートを出力しますか？
                    <v-container id="xxx" style="color: black;" class="text-caption">
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">借用期間：{{currentReport.dateRange}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">借用時刻：{{currentReport.startTime}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">返却時刻：{{currentReport.endTime}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">運転者名：{{currentReport.driverName}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">走行距離：{{currentReport.milage}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">補給量：{{currentReport.supply}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">通行料金：{{currentReport.toll}}</v-col>
                      </v-row>
                      <v-row class="px-4 py-0">
                        <v-col class="py-1">※ 経過・休憩情報は非表示</v-col>
                      </v-row>

                    </v-container>
                  </template>
                </v-card-text>

                <div class="px-3 pb-2">
                    <v-btn @click="onClickExportBtn" fill-width height="48px" color="success">確定</v-btn>
                </div>
            </v-card>
        </v-dialog>
        
        <!--ダイアログ：削除キャンセル-->
        <v-dialog v-if="currentReport" v-model="reportCancelDialog" class="sm-auto" max-width="640">
            <v-card class="sm-auto" max-width="640">
                <v-card-title class="text-center pa-4"><h4 class="fill-width">予約キャンセル・レポート削除</h4></v-card-title>
                <v-divider></v-divider>

                <v-card-text class="pt-4 px-3 py-3">
                  <template>
                    本当に予約・レポートを削除しますか？
                  </template>
                </v-card-text>

                <div class="px-3 pb-2">
                    <v-btn @click="onClickDeleteBtn" fill-width height="48px" color="success">確定</v-btn>
                </div>
            </v-card>
        </v-dialog>
                
      </v-container>
    </v-card>

    <!-- npm run serve し直さないと反映されないことがあるので注意 -->
    <v-container v-if="currentReport && activeGroup">
      <div id="canvas" style="color: black; width: 210mm; height: 297mm; " class="hiddenItem">

          <div class="manage_id">管理No：{{currentReport.id}}</div>
          <h2>運転日報</h2>
          <table class="normal__table">
              <tr><th class="colored__col mini__col">作成日</th><td>{{currentReport.createdAt}}</td><th class="colored__col mini__col">組織名</th><td>{{activeGroup.name}}</td></tr>
              <tr><th class="colored__col mini__col">車両番号</th><td>{{currentReport.carId}}</td><th class="colored__col mini__col">運転者名</th><td>{{currentReport.driverName}}</td></tr>
          </table><br>

          <table class="dirve__datetime__table">
              <tr><th rowspan="3" class="colored__col mini__col">運転日時</th><td>使用期間：{{currentReport.dateRange}}</td></tr>
              <tr><td>借用時刻：&nbsp;&nbsp;{{currentReport.startTime}}</td></tr>
              <tr><td>入庫時刻：&nbsp;&nbsp;{{currentReport.endTime}}</td></tr>
          </table><br>

          （主な経過地）
          <table class="normal__table">
              <tr><th class="colored__col">発地</th><th class="colored__col">着地</th><th class="colored__col">積載状況</th></tr>
              <tr v-for="(item, index) in currentReport.passInfos" :key="index">
                <td class="schedule_date">{{currentReport.passInfos[index].startLocation}}</td>
                <td class="schedule_date">{{currentReport.passInfos[index].endLocation}}</td>
                <td>{{getOnOffString(currentReport.passInfos[index].carry, ['有', '無'])}}</td>
              </tr>
          </table><br>

          （休憩地点・時間）
          <table class="normal__table">
              <tr><th class="colored__col">開始時刻</th><th class="colored__col">終了時刻</th><th class="colored__col">地点</th></tr>
              <tr v-for="(item, index) in currentReport.restInfos" :key="index">
                <td class="schedule_date">{{currentReport.restInfos[index].startTime}}</td>
                <td class="schedule_date">{{currentReport.restInfos[index].endTime}}</td>
                <td>{{currentReport.restInfos[index].location}}</td>
              </tr>
          </table><br>

          <table class="info_table">
              <tr><th class="colored__col mini__col">走行距離</th><td>{{currentReport.milage}}km</td></tr>
              <tr><th class="colored__col mini__col">補給量</th><td>{{currentReport.supply}}L</td></tr>
              <tr><th class="colored__col mini__col">通行料金</th><td>{{currentReport.toll}}円</td></tr>
          </table><br>
            
          <div style="text-align: left;">（総務使用欄）</div>
          <div class="footer__container">
              <div class="footer__text"></div><div class="footer__sub"></div><div class="footer__sub"></div>
          </div>

        
      </div>
    </v-container>

  </v-app>
</template>

<script>
  import firebase from 'firebase'
  import { jsPDF } from "jspdf";
  import html2canvas from 'html2canvas';

  export default {
    data: () => ({
      reports: [
      ],
      activeGroup: null,
      currentReport: null,
      reportEditDialog: false,
      reportExportDialog: false,
      reportCancelDialog: false,

    }),

    created: function () {
      this.db = firebase.firestore();
      var _this = this;
      var activeGroupName = this.$store.state.userOtherInfo.activeGroup;
      if (activeGroupName){
        console.log("アクティブグループを確認したため、車両一覧表示可能状態に移行します.");
        this.showReports(activeGroupName);
      } else {
        this.$store.watch(
          (state) => state.userOtherInfo,
          (newUserOtherInfo, )=>{
            _this.showReports(newUserOtherInfo.activeGroup);
          }
        );
      }
    },

    methods: {
      getOnOffString(flag, stringList){
        if (flag){
          return stringList[0];
        } else {
          return stringList[1];
        }
      },
      addPassInfo(){
        this.currentReport.passInfos.push({
          startLocation: "",
          endLocation: "",
          carry: false,
        })
      },
      addRestInfo(){
        this.currentReport.restInfos.push({
          location: "",
          startTime: null,
          endTime: null,
        })
      },
      saveReport(){
        if (this.currentReport && this.activeGroup){
          const groupRef = this.db.collection('group');
          const carRef = groupRef.doc(this.activeGroup.name).collection('car');
          const reportRef = carRef.doc(this.currentReport.carId).collection('report');
          reportRef.doc(this.currentReport.id).set(this.currentReport).then(function(){
            console.log("レポートの保存に成功");
          })
        }
        this.reportEditDialog = false;
      },
      showReports(activeGroupName){
        var _this = this;
        const groupRef = this.db.collection('group');
        var user = firebase.auth().currentUser;
        if (user) {
          groupRef.doc(activeGroupName).get().then(function(group){
            _this.activeGroup = group.data();
          }).then(function(){
            console.log(_this.activeGroup);
            if (_this.activeGroup){
              console.log("アクティブグループを確認したため、レポート一覧表示可能状態に移行します.");
              const carRef = groupRef.doc(_this.activeGroup.name).collection('car');
              carRef.get().then(function (carQuery) {
                _this.reports = [];
                carQuery.forEach(function (car) {
                  car.ref.collection('report').get().then(function(reportQuery){
                    reportQuery.forEach(function(report){
                      if (report.data().createdBy == user.uid){
                        let _report = report.data();
                        if (_report.dateRange.length==2){ // レポート初期時と保存時で形式が少し異なる.
                          _report.dateRange = _report.dateRange.join('~');
                          _report.createdAt = _this.getStringFromDate(_report.createdAt.toDate());
                          _report.id = report.id; // 削除等で使うため.
                        }
                        _this.reports.push(_report);
                      }
                    })
                  })
                })
              })
            } else {
              console.log("アクティブなグループがないため、車両一覧表示可能状態に移行できません");
            }
          })
        }

      },
      onClickReportEditBtn(report) {
        this.currentReport = report;
        this.reportEditDialog = true;
      },
      onClickReportExportBtn(report) {
        this.currentReport = report;
        this.reportExportDialog = true;
      },
      onClickReportCancelBtn(report) {
        this.currentReport = report;
        this.reportCancelDialog = true;
      },

      onClickDeleteBtn() {
        var _this = this;
        if (this.activeGroup){
          const groupRef = this.db.collection('group');
          const carRef = groupRef.doc(this.activeGroup.name).collection('car');
          const reportRef = carRef.doc(this.currentReport.carId).collection('report');
          reportRef.doc(this.currentReport.id).delete().then(function(){
            console.log("レポートの削除に成功");
            _this.showReports(_this.activeGroup.name);
          })
        } else {
          console.log("アクティブグループの確認中");
        }
        this.reportCancelDialog = false;
      },
      onClickExportBtn() {
        console.log("create pdf ...");

        window.scrollTo(0, 0); // スクロールを戻す処理を行うことで、ズレがなくなる
        const canvas = document.getElementById("canvas");
        canvas.classList.remove("hiddenItem");
        console.log(canvas);
        html2canvas(canvas).then(function(canvas){
          const img = canvas.toDataURL('image/png');
          const doc = new jsPDF('portrait', 'mm', 'a4');
          const width = doc.internal.pageSize.width;
          const height = doc.internal.pageSize.height;
          console.log(width + "__" + height);
          doc.addImage(img, 'PNG', 10, 10, width * 0.9, 0);
          doc.save("output.pdf")
        });
        canvas.classList.add("hiddenItem");
        
        this.reportExportDialog = false;
      },

      setRentTime: function (dialog, time) {
        dialog.save(time);
        this.menu1 = false;
        this.menu2 = false;
      },
      allowedStep: m => m % 15 === 0, // 15分単位で扱う

      getStringFromDate: function(date){
        var year_str = date.getFullYear();
        var month_str = 1 + date.getMonth();
        var day_str = date.getDate();
        var hour_str = date.getHours();
        var minute_str = date.getMinutes();
        var second_str = date.getSeconds();
        
        
        var format_str = 'YYYY-MM-DD hh:mm:ss';
        format_str = format_str.replace(/YYYY/g, year_str);
        format_str = format_str.replace(/MM/g, month_str);
        format_str = format_str.replace(/DD/g, day_str);
        format_str = format_str.replace(/hh/g, hour_str);
        format_str = format_str.replace(/mm/g, minute_str);
        format_str = format_str.replace(/ss/g, second_str);
        
        return format_str;
      },

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
    },
  }
</script>

<style scoped>
.hiddenItem {
  display: none;
}

.normal__table {
    width: 100%;
    border-collapse:separate;
    border-spacing: 0;
}

.normal__table th{
    text-align: center;
    border: 1px solid black;
    width: 25%;
    padding: 5px 0;
}
  
.normal__table td{
    text-align: center;
    border: 1px solid black;
    width: 25%;
    padding: 5px 0;
}


.info_table {
    width: 50%;
    border-collapse:separate;
    border-spacing: 0;
}


.info_table th {
    text-align: left;
    border: 1px solid black;
    padding: 5px 0 5px 10px;
}

.info_table td {
    text-align: left;
    border: 1px solid black;
    padding: 5px 0 5px 10px;
}

.dirve__datetime__table {
    width: 100%;
    border-collapse:separate;
    border-spacing: 0;
}

.dirve__datetime__table td {
    text-align: left;
    border: 1px solid black;
    padding: 5px 0 5px 10px;
}

.dirve__datetime__table th {
    text-align: center;
    border: 1px solid black;
    padding: 5px 0;
}

.colored__col {
    background-color: gainsboro;
}

.mini__col {
    width: 150px;
}

.manage_id {
    text-align: left;
    width: 200px;
    border-bottom: 2px dotted black;
}

.footer__container {
    height: 100px;
    width: 100%;
    display: flex;
    border:solid 1px black;
}

.footer__text {
    width: 60%;
}

.footer__sub {
    width: 19%;
    border-left: solid 1px black;
}

</style>