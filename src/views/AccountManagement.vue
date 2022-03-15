<template>
  <v-app>
    <v-container class="mx-auto fill-width">
    <v-card class="mx-auto" flat max-width="640">
      <v-container>
        <v-card class="pt-2 px-1" outlined elevation="3">
          <v-card-text class="px-3 py-3">
            <v-btn block color="success" @click="createGroupDialog=true">グループ作成</v-btn>
          </v-card-text>
          <v-card-text class="px-1 py-3">
            <v-card outlined color="grey lighten-1">
              <v-card-text class="px-3 py-0 pt-3">
                <v-text-field label="グループ名" :rules="[groupNameRules.required]" v-model="applyGroupName"></v-text-field>
              </v-card-text>
              <v-card-text class="px-3 pb-3">
                <v-btn block color="info" @click="applyGroup">グループ申請</v-btn>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-text class="px-1 py-2">
            <v-card outlined color="grey lighten-1">
              <v-card-text class="px-3 py-0 pt-3">
                ※Googleアカウントの場合はパスワード不要
                <v-text-field label="パスワード" v-model="currentPassword" :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'" :type="passwordShow ? 'text' : 'password'" @click:append="passwordShow = !passwordShow" name="input-password"></v-text-field>
              </v-card-text>
              <v-card-text class="px-3 pb-3">
                <v-btn block color="error" @click="deleteAccountDialog=true">現在のアカウントを削除</v-btn>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-container>


      <v-container fluid class="fill-width">
        <!-- カード: 参加中グループ一覧 -->
        <v-card class="mx-auto">
          <v-toolbar color="teal" dark>
            <v-spacer></v-spacer>
            <v-toolbar-title>グループ</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-list>
            <template v-for="(group, index) in groups">
              <v-list-item :key="`group-${index}`">
                <v-list-item-avatar>
                  <v-icon large v-if="userOtherInfo.activeGroup == null || group.name != userOtherInfo.activeGroup" @click="onClickChangeActiveGroup(group)">mdi-home-circle</v-icon>
                  <v-icon large v-if="userOtherInfo.activeGroup != null && group.name == userOtherInfo.activeGroup" color="red">mdi-home-circle</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="group.name"></v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon @click="onClickMember(group, index)"><v-icon large>mdi-account-group</v-icon></v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon @click="onClickConfig(group, index)"><v-icon large>mdi-cog</v-icon></v-btn>
                </v-list-item-action>

              </v-list-item>
              <v-divider v-if="index < groups.length - 1" :key="index"></v-divider>

            </template>
          </v-list>

        </v-card>
        
        <!-- カード: 申請中グループ一覧 -->
        <v-card class="mx-auto">
          <v-toolbar color="teal" dark>
            <v-spacer></v-spacer>
            <v-toolbar-title>参加申請中グループ</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-list>
            <template v-for="(group, index) in temporaryGroups">
              <v-list-item :key="`group-${index}`">
                <v-list-item-avatar>
                  <v-icon large>mdi-home-circle</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="group.name"></v-list-item-title>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon @click="onClickConfig(group, index, temporary=true)"><v-icon large>mdi-cog</v-icon></v-btn>
                </v-list-item-action>

              </v-list-item>
              <v-divider v-if="index < groups.length - 1" :key="index"></v-divider>

            </template>
          </v-list>

        </v-card>
      </v-container>
    </v-card>
    </v-container>

    <!-- ダイアログ: アカウント削除 -->
    <v-dialog v-model="deleteAccountDialog" class="mx-auto fill-width" max-width="640px">
      <v-card>
        <v-toolbar color="cyan" dark>
            <v-card-title class="text-center pa-4"><h4 class="fill-width">アカウント削除</h4></v-card-title>
            <v-spacer></v-spacer>
            <v-btn @click="deleteAccountDialog = false" icon><v-icon>mdi-close-circle</v-icon></v-btn>
        </v-toolbar>
          <v-card-text class="px-3 py-3" style="text-align: left;">
            ※ データが完全に削除され、復旧不可能になります。ご注意ください。
          </v-card-text>
          <v-card-text class="px-3 py-3">
            <v-btn block color="error" @click="deleteAccount">アカウントを削除する</v-btn>
          </v-card-text>
          <v-card-text class="px-3 py-3">
            <v-btn block @click="deleteAccountDialog = false">削除しない</v-btn>
          </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ダイアログ: グループ作成 -->
    <v-dialog v-model="createGroupDialog" class="mx-auto fill-width" max-width="640px">
      <v-card>
        <v-toolbar color="cyan" dark>
            <v-card-title class="text-center pa-4"><h4 class="fill-width">グループ作成</h4></v-card-title>
            <v-spacer></v-spacer>
            <v-btn @click="createGroupDialog = false" icon><v-icon>mdi-close-circle</v-icon></v-btn>
        </v-toolbar>
          <v-card-text class="px-3 py-3" style="text-align: left;">
            <v-card outlined>
              <v-card-text class="px-3 py-0 pt-3">
                <v-text-field label="グループ名" :rules="[groupNameRules.required, groupNameRules.regex]" v-model="groupName"></v-text-field>
              </v-card-text>
            </v-card>
          </v-card-text>
          <v-card-text class="px-3 py-3">
            <v-btn block color="error" @click="createGroup">グループを作成する</v-btn>
          </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ダイアログ：メンバー 一覧 -->
    <v-dialog v-if="memberDialog && currentGroup != null" v-model="memberDialog" class="mx-auto fill-width" max-width="640px">
        <v-card>
          <v-toolbar color="cyan" dark>
              <v-card-title class="text-center pa-4"><h4 class="fill-width">メンバー</h4></v-card-title>
              <v-spacer></v-spacer>
              <v-btn @click="memberDialog = false" icon><v-icon>mdi-close-circle</v-icon></v-btn>
          </v-toolbar>
            <v-card-text class="pt-4 px-3 py-3">
              <template>
                <v-list>
                  <!-- 未承認メンバー -->
                  <template v-for="(member, index) in currentGroupTemporaryMembers">
                    <v-list-item :key="`temporaryMember-${index}`">
                      <v-list-item-avatar>
                        <v-img v-if="member.avatar!=null" :src="member.avatar"></v-img>
                        <v-avatar v-if="member.avatar==null" color="indigo"><span class="white--text headline">{{member.displayName.slice(0, 1)}}</span></v-avatar>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <v-list-item-title v-text="member.displayName"></v-list-item-title>
                        <v-list-item-subtitle>{{member.name.slice(0, 10) + "***"}}</v-list-item-subtitle>
                      </v-list-item-content>
                      
                      <v-list-item-icon>
                        <v-icon @click="onClickApproveMember(member)">mdi-account-plus</v-icon>
                      </v-list-item-icon>
                      <v-list-item-icon>
                        <v-icon @click="onClickCancelAppring(member)">mdi-account-remove</v-icon>
                      </v-list-item-icon>

                    </v-list-item>
                    <v-divider v-if="index < currentGroupTemporaryMembers.length - 1" :key="index"></v-divider>
                  </template>

                  <!-- 承認済みメンバー -->
                  <template v-for="(member, index) in currentGroupMembers">
                    <v-list-item :key="`member-${index}`">
                      <v-list-item-avatar>
                        <v-img v-if="member.avatar!=null" :src="member.avatar"></v-img>
                        <v-avatar v-if="member.avatar==null" color="indigo"><span class="white--text headline">{{member.displayName.slice(0, 1)}}</span></v-avatar>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <v-list-item-title v-text="member.displayName"></v-list-item-title>
                        <v-list-item-subtitle v-if="!member.admin">{{member.name.slice(0, 10) + "***"}}</v-list-item-subtitle>
                        <v-list-item-subtitle v-if="member.admin">(管理者)</v-list-item-subtitle>
                      </v-list-item-content>
                      
                      <v-list-item-icon>
                        <v-icon v-if="!member.admin" @click="onCLickDeleteMember(member)">mdi-account-remove</v-icon>
                      </v-list-item-icon>

                    </v-list-item>
                    <v-divider v-if="index < currentGroup.members.length - 1" :key="index"></v-divider>
                  </template>
                </v-list>
              </template>
            </v-card-text>
        </v-card>
    </v-dialog>
    
    <!-- ダイアログ：メンバー グループ設定 -->
    <v-dialog v-if="configDialog && currentGroupIndex != null" v-model="configDialog" class="mx-auto fill-width" max-width="640px">
      <v-card>
        <v-toolbar color="cyan" dark>
            <v-card-title class="text-center pa-4"><h4 class="fill-width">設定</h4></v-card-title>
            <v-spacer></v-spacer>
            <v-btn @click="configDialog = false" icon><v-icon>mdi-close-circle</v-icon></v-btn>
        </v-toolbar>
          <v-card-text class="pt-4 px-3 py-3">
            <v-btn block @click="onClickDeleteGroupBtn()">グループを削除</v-btn>
          </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- ダイアログ：仮メンバー グループ設定 -->
    <v-dialog v-if="currentGroupIndex != null" v-model="temporaryConfigDialog" class="mx-auto fill-width" max-width="640px">
      <v-card>
        <v-toolbar color="cyan" dark>
            <v-card-title class="text-center pa-4"><h4 class="fill-width">設定</h4></v-card-title>
            <v-spacer></v-spacer>
            <v-btn @click="temporaryConfigDialog = false" icon><v-icon>mdi-close-circle</v-icon></v-btn>
        </v-toolbar>
          <v-card-text class="pt-4 px-3 py-3">
            <v-btn block @click="onClickCancelAppring()">グループ申請をキャンセル</v-btn>
          </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script>
  import firebase from 'firebase'

  export default {
    data: () => ({
      currentGroup: null,
      currentGroupMembers: [],
      currentGroupTemporaryMembers: [],
      currentGroupIndex: null,
      createGroupDialog: false,
      deleteAccountDialog: false,
      memberDialog: false,
      configDialog: false,
      temporaryConfigDialog: false,
      currentPassword: null,

      groupName: "",
      groupNameRules: {
        required: (value) =>
        !!value || 'グループ名は必須です',
        regex: (value) =>
        /^(?=.*?[a-zA-Z\d])[a-zA-Z\d]{1,16}$/.test(value) ||
        '半角英小文字大文字数字のみを用いて1文字以上16文字以下で入力してください'
      },
      passwordShow: false,

      applyGroupName: "",
      
      groups: [],
      temporaryGroups: [],
    }),

    created: function () {
      const _this = this;
      this.db = firebase.firestore();
      var user = firebase.auth().currentUser;
      if (user) {
        console.log("認証済ユーザを確認できたため、所属グループ確認を実行します : " + user.uid);
        _this.db.collection('user').doc(user.uid).onSnapshot(function(doc){ // １回の変化に複数回反応することあり.
          if(doc.exists){
            console.log("ユーザ付加情報が存在し、かつ変化があったため、情報を更新");
            _this.groups = [];
            _this.temporaryGroups = [];
            var belongGroups = doc.data().belongGroups;
            var belongTemporaryGroups = doc.data().belongTemporaryGroups;
            console.log(belongGroups);
            console.log(belongTemporaryGroups);
            if(belongGroups.length > 0){
              console.log("所属グループが1以上あるため、情報更新");
              _this.db.collection('group').where('name', 'in', belongGroups).get().then(function(items){
                items.forEach(function(item){
                  var data = item.data();
                  _this.groups.push(data);
                })
              })
            }
            if(belongTemporaryGroups.length > 0){
              console.log("仮所属グループが1以上あるため、情報更新");
              _this.db.collection('group').where('name', 'in', belongTemporaryGroups).get().then(function(items){
                items.forEach(function(item){
                  var data = item.data();
                  _this.temporaryGroups.push(data);
                })
              })
            }
          }
        });
      }
    },

    methods: {
      updateUserAndGroupInfo(group, groupRef, userInfo){
        if(group.data().admin == userInfo.name){ // 管理者が削除される場合は、グループも削除
          console.log("管理者と削除ユーザが一致 : グループIDは " + group.data().name + " : ユーザIDは " + group.data().admin);
          // groupRef.doc(group.data().name).delete();
          this.deleteAtPath("group/" + group.data().name);
        } else { // 管理者でない場合はグループ削除を行わず、メンバーからのみ削除.
          groupRef.doc(group.data().name).update({
            members: firebase.firestore.FieldValue.arrayRemove(userInfo.name), // グループのメンバーからユーザを削除
            temporaryMembers: firebase.firestore.FieldValue.arrayRemove(userInfo.name), // グループの仮メンバーからユーザを削除
          });
        }
      },
      deleteUserWithGroup(_this, user){
        console.log("ユーザとそれに付随するグループを削除");
        const userRef = _this.db.collection('user');
        const groupRef = _this.db.collection('group');
        const userInfoRef = userRef.doc(user.uid);
        userInfoRef.get().then(function(userInfoDoc){
          let userInfo = userInfoDoc.data();
          console.log(userInfo.belongGroups);
          var matchGroups = groupRef.where('name', 'in', userInfo.belongGroups.concat(userInfo.belongTemporaryGroups)).get(); // 下のgroupsと同等
          matchGroups.then(async function(groups){ // async - for await(- of -){ await 非同期処理(); }にしないと多分ズレる. (forEachは非同期処理を同期化しない)
            for await(let group of groups.docs){
              await _this.updateUserAndGroupInfo(group, groupRef, userInfo);
            }
            console.log("グループ走査完了");
          }).then(function(){ // ここでthenを使うことで処理が逐次的に実行されるようになった.
            console.log("ユーザ付属情報を削除");
            userInfoRef.delete().then(function(){ // 先にユーザの付属情報を削除した上で本体を削除
              console.log("ユーザ本体を削除");
              user.delete().then(function(){
                // _this.$router.go({path: '/', force: true}) // 無理矢理リダイレクトすると、グループ削除実行が中止される.
              });
            });
          });
        })
      },
      onClickChangeActiveGroup(group){
        console.log("アクティブグループを「" + group.name + "」に変更します");
        const userRef = this.db.collection('user');
        var user = firebase.auth().currentUser;
        if (user){
          userRef.doc(user.uid).update({
            activeGroup: group.name,
          })
        }
      },
      onClickMember(group, groupIndex, temporary=false){
        var _this = this;
        this.currentGroupMembers = [];
        this.currentGroupTemporaryMembers = [];
        const userRef = this.db.collection('user');
        const groupRef = this.db.collection('group');
        groupRef.doc(group.name).get().then(function(groupInfos){
          const members = groupInfos.data().members;
          const temporaryMembers = groupInfos.data().temporaryMembers;
          userRef.where('name', 'in', members).get().then(function(_members){
            for (let _member of _members.docs){
              _this.currentGroupMembers.push({
                displayName: _member.data().displayName,
                admin: _this.currentGroup.admin == _member.data().name,
                name: _member.data().name,
              });
            }
          })
          if (temporaryMembers.length>0){
            userRef.where('name', 'in', temporaryMembers).get().then(function(_members){
              for (let _member of _members.docs){
                _this.currentGroupTemporaryMembers.push({
                  displayName: _member.data().displayName,
                  admin: _this.currentGroup.admin == _member.data().name,
                  name: _member.data().name,
                });
              }
            })
          }
        }).then(function(){
          console.log("メンバーダイアログをON");
          _this.currentGroup = group;
          _this.currentGroupIndex = groupIndex;
          if(temporary){
            // 未承認会員が対象グループ内のメンバー情報を閲覧するのはよくないとする.
          } else {
            _this.memberDialog = true;
          }
        });
      },
      onClickConfig(group, groupIndex, temporary=false){
        this.currentGroup = group;
        this.currentGroupIndex = groupIndex;
        if(temporary){
          this.temporaryConfigDialog = true;
        } else {
          this.configDialog = true;
        }
      },
      onClickDeleteGroupBtn() {
        const _this = this;
        const userRef = this.db.collection('user'); // ユーザ付加情報の所属グループを編集
        // const groupRef = this.db.collection('group'); // 対象グループを削除
        console.log(this.currentGroup);
        var matchUserInfos = userRef.where('belongGroups', 'array-contains', this.currentGroup.name).get();
        matchUserInfos.then(function(userInfos){ // 各ユーザ付加情報の書き込みは同時平行でもよいので、async-awaitしない.
          for (let userInfo of userInfos.docs){
            console.log("ユーザの所属グループから選択されたグループを削除");
            userRef.doc(userInfo.data().name).update({
              belongGroups: firebase.firestore.FieldValue.arrayRemove(_this.currentGroup.name),
            })
          }
        }).then(function(){
          console.log("選択されたグループを削除");
          // groupRef.doc(_this.currentGroup.name).delete();
          _this.deleteAtPath('group/'+_this.currentGroup.name);
        })


        this.configDialog = false;
      },
      onClickApproveMember(member){
        console.log("メンバーを承認 : " + member.name);
        var _this = this;
        const userRef = this.db.collection('user');
        const groupRef = this.db.collection('group');
        var user = firebase.auth().currentUser;
        if (user){
          if (member){ // 管理者として承認申請メンバーの却下
            if (this.currentGroup.admin == user.uid){
              console.log("管理者権限の確認が完了したため、申請メンバー承認処理を実行します");
              groupRef.doc(_this.currentGroup.name).update({
                members: firebase.firestore.FieldValue.arrayUnion(member.name),
                temporaryMembers: firebase.firestore.FieldValue.arrayRemove(member.name),
              }).then(function(){
                _this.currentGroupMembers = []; // membersの監視は行っていないのでここで処理
                _this.currentGroupTemporaryMembers = []; // temporaryMembersの監視は行っていないのでここで処理
                groupRef.doc(_this.currentGroup.name).get().then(function(groupInfos){
                  const members = groupInfos.data().members;
                  const temporaryMembers = groupInfos.data().temporaryMembers;
                  userRef.where('name', 'in', members).get().then(function(_members){
                    for (let _member of _members.docs){
                      _this.currentGroupMembers.push({
                        displayName: _member.data().displayName,
                        admin: _this.currentGroup.admin == _member.data().name,
                        name: _member.data().name,
                      });
                    }
                  })
                  if (temporaryMembers.length>0){
                    userRef.where('name', 'in', temporaryMembers).get().then(function(_members){
                      for (let _member of _members.docs){
                        _this.currentGroupTemporaryMembers.push({
                          displayName: _member.data().displayName,
                          admin: _this.currentGroup.admin == _member.data().name,
                          name: _member.data().name,
                        });
                      }
                    })
                  }
                }).then(function(){
                  userRef.doc(member.name).update({
                    belongGroups: firebase.firestore.FieldValue.arrayUnion(_this.currentGroup.name),
                    belongTemporaryGroups: firebase.firestore.FieldValue.arrayRemove(_this.currentGroup.name),
                  })
                })
              })
            } else {
              alert("対象グループの管理者権限がないため、申請メンバー承認処理をキャンセルします.");
            }
          }
        }
      },
      onClickCancelAppring(member=null){
        console.log("グループ申請を削除");
        var _this = this;
        const userRef = this.db.collection('user');
        const groupRef = this.db.collection('group');
        var user = firebase.auth().currentUser;
        if (user){
          if (member){ // 管理者として承認申請メンバーの却下
            if (this.currentGroup.admin == user.uid){
              console.log("管理者権限の確認が完了したため、申請メンバー削除処理を実行します");
              groupRef.doc(_this.currentGroup.name).update({
                temporaryMembers: firebase.firestore.FieldValue.arrayRemove(member.name),
              }).then(function(){
                _this.currentGroupTemporaryMembers = []; // temporaryMembersの監視は行っていないのでここで処理
                groupRef.doc(_this.currentGroup.name).get().then(function(groupInfos){
                  const _temporaryMembers = groupInfos.data().temporaryMembers;
                  if (_temporaryMembers.length>0){
                    userRef.where('name', 'in', _temporaryMembers).get().then(function(_members){
                      for (let _member of _members.docs){
                        _this.currentGroupTemporaryMembers.push({
                          displayName: _member.data().displayName,
                          admin: _this.currentGroup.admin == _member.data().name,
                          name: _member.data().name,
                        });
                      }
                    })
                  }
                }).then(function(){
                  userRef.doc(member.name).update({
                    belongTemporaryGroups: firebase.firestore.FieldValue.arrayRemove(_this.currentGroup.name),
                  })
                })
              })
            } else {
              alert("対象グループの管理者権限がないため、申請メンバー削除処理をキャンセルします.");
            }
          } else {
            console.log("申請者本人がグループ申請をキャンセル");
            userRef.doc(user.uid).update({
              belongTemporaryGroups: firebase.firestore.FieldValue.arrayRemove(_this.currentGroup.name),
            });
            groupRef.doc(_this.currentGroup.name).update({
              temporaryMembers: firebase.firestore.FieldValue.arrayRemove(user.uid),
            });
            _this.temporaryConfigDialog = false;
          }
        } else {
          console.log("ユーザが存在しません.")
        }
      },
      onCLickDeleteMember(member){
        console.log("対象メンバーをグループから削除します.");
        var _this = this;
        const userRef = this.db.collection('user');
        const groupRef = this.db.collection('group');
        var user = firebase.auth().currentUser;
        if (user){
          if (this.currentGroup.admin == user.uid){
            console.log("管理者権限の確認が完了したため、メンバー削除処理を実行します");
            groupRef.doc(_this.currentGroup.name).update({
              members: firebase.firestore.FieldValue.arrayRemove(member.name),
            }).then(function(){
              _this.currentGroupMembers = []; // membersの監視は行っていないのでここで処理
              groupRef.doc(_this.currentGroup.name).get().then(function(groupInfos){
                const members = groupInfos.data().members;
                  userRef.where('name', 'in', members).get().then(function(_members){
                  for (let _member of _members.docs){
                    _this.currentGroupMembers.push({
                      displayName: _member.data().displayName,
                      admin: _this.currentGroup.admin == _member.data().name,
                      name: _member.data().name,
                    });
                  }
                })
              }).then(function(){
                userRef.doc(member.name).update({
                  belongGroups: firebase.firestore.FieldValue.arrayRemove(_this.currentGroup.name),
                })
              })
            })
          } else {
            alert("対象グループの管理者権限がないため、メンバー削除処理をキャンセルします.");
          }
        } else {
          console.log("ユーザが存在しません.")
        }
      },
      deleteAccount() {
        console.log("アカウント削除準備 ...");
        var _this = this;
        var user = firebase.auth().currentUser;
        if (user) {
          console.log("認証済ユーザを確認できたため、アカウント削除を実行します : " + user.uid);
          let providerId = user.providerData["0"].providerId; // password, google.com, ...
          if (providerId == "password") {
            if (!_this.currentPassword){
              alert("パスワードを入力してください");
            } else {
              var credential = firebase.auth.EmailAuthProvider.credential(user.email, _this.currentPassword); // 認証情報取得
              user.reauthenticateWithCredential(credential).then(function(){ // 再認証
                _this.deleteUserWithGroup(_this, user);
              });
            }
          } else if (providerId == "google.com") {
            var provider = new firebase.auth.OAuthProvider('google.com');
            provider.setCustomParameters({
              login_hint: user.email
            });
            user.reauthenticateWithPopup(provider).then(function(){ // 認証情報取得および再認証に成功した場合
              _this.deleteUserWithGroup(_this, user);
            });
          }
        }
        this.deleteAccountDialog = false;
      },
      createGroup () { // 作成者がグループ管理者.
        console.log("グループ作成準備");
        const _this = this;
        if (this.groupNameRules.regex(this.groupName)){
          var user = firebase.auth().currentUser;
          if (user) {
            console.log("認証済ユーザを確認できたため、グループ作成を実行します。");
            const newGroup = {
              name: _this.groupName,
              members: [user.uid, ], // uidで管理.
              temporaryMembers: [], // 仮メンバー. 管理者が承認し場合のみ、membersに移行.
              admin: user.uid,
            };
            _this.db.collection('group').doc(_this.groupName).set(newGroup).then(function(){
              console.log("update user other info");
              _this.db.collection('user').doc(user.uid).update({
                belongGroups: firebase.firestore.FieldValue.arrayUnion(_this.groupName),
              })
              _this.groupName = "";
            });
          }
        }else{
          alert("半角英小文字大文字数字のみを用いて1文字以上16文字以下で入力してください")
        }
        this.createGroupDialog = false;
      },
      applyGroup() {
        var _this = this;
        console.log("グループ「" + this.applyGroupName + "」への申請");
        const userRef = this.db.collection('user');
        const groupRef = this.db.collection('group');
        var user = firebase.auth().currentUser;
        if (user) {
          console.log("ユーザ確認が完了したため、グループ申請処理を開始します.");
          groupRef.doc(_this.applyGroupName).get().then(function(groupDoc){
            if (groupDoc.exists){
              console.log("グループ「 " + _this.applyGroupName + " 」が存在したため、所属確認を行います.");
              if (!(groupDoc.data().members.includes(user.uid)) && !(groupDoc.data().temporaryMembers.includes(user.uid))){
                console.log("メンバー及び仮メンバーにユーザを確認できなかったため、仮メンバーに登録します.");
                groupRef.doc(_this.applyGroupName).update({
                  temporaryMembers: firebase.firestore.FieldValue.arrayUnion(user.uid),
                }).then(function(){
                  console.log("仮メンバーに登録完了したため、ユーザ付加情報の仮所属グループを更新します.");
                  userRef.doc(user.uid).update({
                    belongTemporaryGroups: firebase.firestore.FieldValue.arrayUnion(_this.applyGroupName),
                  })
                })
              } else {
                alert("メンバーもしくは仮メンバーに参加済です.");
              }
            } else {
              alert("グループ「 " + _this.applyGroupName + " 」は存在しません.");
            }
          })
        }
        
      },
      deleteAtPath(path) { // コレクションの再帰的削除(サブコレクションも削除される)
        var deleteFn = firebase.functions().httpsCallable('recursiveDelete');
        deleteFn({ path: path })
          .then(function(result) {
              console.log('Delete success: ' + JSON.stringify(result));
          })
          .catch(function(err) {
              console.log('Delete failed, see console,');
              console.warn(err);
          });
      },

    },
    computed: {
      userOtherInfo(){
        return this.$store.state.userOtherInfo;
      }
    },
    

  }
</script>