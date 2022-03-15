<template>
    <div>
        <v-card :tile="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs" class="mx-auto fill-width" flat max-width="640">
        <v-card-title class="text-center pa-8">
            <h4 class="fill-width">ログイン</h4>
        </v-card-title>
        <v-divider> </v-divider>
        <div class="px-6 py-8">
            <div style="max-width:344px" class="mx-auto">
            <div>
                <v-btn @click="signInWithGoogle" class="fill-width text-capitalize" height="48px" outlined style="border-color:#979797;" tile>
                    <img class="button-logo-img mr-4" src="https://madeby.google.com/static/images/google_g_logo.svg" style="height:24px;"/>
                    Googleでログイン
                </v-btn>
                <!-- <v-btn class="fill-width mt-5 text-capitalize" color="#385184" dark depressed height="48px" tile>
                    <v-icon left color="#fff">mdi-facebook</v-icon>
                    Facebookで登録
                </v-btn> -->
            </div>
            <div class="separator separator_login_page">
                <div class="middle_separator">または</div>
            </div>
            <div class="pt-6">
                <div>
                    <v-text-field 
                        v-model="email" 
                        :rules="[emailRules.required, emailRules.regex]"
                        placeholder="メールアドレス"
                        autofocus dense height="48px" outlined
                    ></v-text-field>

                    <v-text-field
                        v-model="password"
                        :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[passwordRules.required, passwordRules.regex]"
                        :type="passwordShow ? 'text' : 'password'"
                        placeholder="パスワード"
                        dense height="48px" name="input-password" outlined
                        @click:append="passwordShow = !passwordShow"
                    ></v-text-field>
                </div>
                <div class="login-btn pb-8" max-width="640">
                    <v-btn @click="signIn" class="fill-width text-capitalize" height="48px" color="info">ログイン</v-btn>
                </div>
                <v-divider></v-divider>

                <v-dialog v-model="dialog" max-width="360">
                    <template v-slot:activator="{ on, attrs }">
                        <div class="pt-8 pb-4">
                            <v-btn v-bind="attrs" v-on="on" class="fill-width text-capitalize" height="48px" outlined color="success">新しいアカウント作成</v-btn>
                        </div>
                    </template>

                    <v-card class="mx-auto">
                        <v-card-title class="text-center pa-4"><h4 class="fill-width">アカウント作成</h4></v-card-title>
                        <v-divider></v-divider>


                        <v-card-text class="pt-8 px-6 py-3" max-width="340">
                            <div>
                                <v-btn @click="signInWithGoogle" class="fill-width text-capitalize" height="48px" outlined style="border-color:#979797;" tile>
                                    <img class="button-logo-img mr-4" src="https://madeby.google.com/static/images/google_g_logo.svg" style="height:24px;"/>
                                    Googleで登録
                                </v-btn>
                            </div>
                            <div class="separator separator_login_page">
                                <div class="middle_separator">または</div>
                            </div>

                            <v-text-field 
                                v-model="email" 
                                :rules="[emailRules.required, emailRules.regex]"
                                placeholder="メールアドレス"
                                autofocus dense height="48px" outlined
                            ></v-text-field>

                            <v-text-field
                                v-model="password"
                                :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                                :rules="[passwordRules.required, passwordRules.regex]"
                                :type="passwordShow ? 'text' : 'password'"
                                placeholder="パスワード"
                                dense height="48px" name="input-password" outlined
                                @click:append="passwordShow = !passwordShow"
                            ></v-text-field>
                        </v-card-text>

                        <div class="px-6 pb-4">
                            <v-btn @click="signUp" class="fill-width text-capitalize" height="48px" color="success">新しいアカウント作成</v-btn>
                        </div>
                    </v-card>
                </v-dialog>

            </div>
            </div>
        </div>
        </v-card>
    </div>
</template>

<script>
import firebase from 'firebase'
import "firebase/auth"

export default {
    name: 'Register',
    data() {
        return {
            dialog: false, // ダイアログの表示、非表示

            email: null,
            emailRules: {
                required: (value) =>
                !!value || 'メールアドレスは必須です',
                regex: (value) =>
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                    value
                ) || 'メールアドレスの形式が違います'
            },
            password: null,
            passwordShow: false,
            passwordRules: {
                required: (value) =>
                !!value || 'パスワードは必須です',
                regex: (value) =>
                /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,128}$/.test(value) ||
                '半角英小文字大文字数字をそれぞれ1種類以上含む7文字以上128文字以下で入力してください'
            }
        }
    },
    created: function () {
        this.db = firebase.firestore();
    },
    methods: {
        setOtherInfo: function(userUid) { // signUp時に低セキュアなデータを別DBに登録
            console.log("set other info");
            const _this = this;
            this.db.collection('user').doc(userUid).get().then((doc)=>{
                let newOtherInfo = {
                    name: userUid,
                    displayName: "no name",
                    avatarImage: null,
                    belongGroups: [],
                    belongTemporaryGroups: [], // 仮所属グループ
                    activeGroup: null, // アクティブ中のグループ. 次のサインイン時にも引き継ぐ用.
                };
                if (doc.exists){ // ユーザの付加情報が未登録の場合
                    console.log("ユーザ付加情報が登録済のため、既存の付加情報をセットします : " + userUid);
                    newOtherInfo = doc.data();
                } else {
                    console.log("ユーザ付加情報が未登録のため、新しい付加情報を登録します : " + userUid);
                    _this.db.collection('user').doc(userUid).set(newOtherInfo);
                }
                _this.$store.commit('setUserOtherInfo', newOtherInfo);
            })
        },
        signUp: function() {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .then((item)=>{
                this.dialog = false;
                this.setOtherInfo(item.user.uid);
            })
            .catch((error)=>{
                alert(error.message);
            })
        },
        signIn: function() {
            console.log("メールアドレスでサインイン");
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
            .then((item)=>{
                console.log(item.user);
                this.setOtherInfo(item.user.uid);
            })
            .catch((error)=>{
                alert(error.message);
            })
        },
        signInWithGoogle: function() {
            console.log("Googleアカウントでサインイン");
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
            .then((item) => {
                console.log(item.user.uid);
                this.dialog = false;
                this.setOtherInfo(item.user.uid);
            }).catch((error) => {
                alert(error.message);
            })
        }
    },
}
</script>

<style lang="scss">
.fill-width {
  width: 100%;
}

.separator {
  margin-top: 30px;
  margin-bottom: 30px;
  height: 0;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #fff;
  position: relative;
}
.middle_separator {
  position: absolute;
  padding: 0 16px;
  color: #ccc;
  background: #fff;
  font-size: 11px;
  text-shadow: 0 1px 0 #fff;
  text-transform: uppercase;
  top: -7px;
  left: 30%;
}
.middle_separator {
  color: #777;
  font-size: 13px;
  top: -9px;
  left: 41%;
}
</style>