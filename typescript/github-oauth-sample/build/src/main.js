"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// import { ApolloClient, InMemoryCache } from "@apollo/client";
const keypress = require("keypress");
const module_1 = require("./module");
console.log(module_1.msg);
keypress(process.stdin);
// const cache = new InMemoryCache();
// const client = new ApolloClient({
//   cache,
//   uri: "",
// });
const listenEnterKeyPress = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const promise = new Promise((resolve) => {
        process.stdin.on("keypress", function (_, key) {
            console.log('got "keypress"', key);
            if (key && key.ctrl && key.name == "c") {
                process.stdin.pause();
            }
            if (key && key.name == "return") {
                resolve("");
            }
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
    });
    yield promise;
});
const getUserVerifyCodeFromGithub = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const VERIFICATION_URL = "https://github.com/login/device/code";
    const method = "POST";
    const body = {
        client_id: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
        scope: "repo",
    };
    const headers = {
        // "Content-Type": "application/json",
        Accept: "application/json",
    };
    const response = yield fetch(VERIFICATION_URL, {
        method,
        headers,
        body: JSON.stringify(body),
    });
    console.log(response);
    return (yield response.json());
});
const outputVerificationMessage = ({ verificationUri, userCode, }) => {
    console.log(`Please access ${verificationUri}.`);
    console.log(`And input code "${userCode}".`);
    console.log("Last please press Enter key.");
};
const confirmHasBeenAuthorized = (_a) => tslib_1.__awaiter(void 0, [_a], void 0, function* ({ cliendId, deviceCode, grantType, }) {
    const body = {
        client_id: cliendId,
        device_code: deviceCode,
        grant_type: grantType,
    };
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    const method = "POST";
    console.log({
        method,
        headers,
        body: JSON.stringify(body),
    });
    const response = yield fetch("https://github.com/login/oauth/access_token", {
        method,
        headers,
        body: JSON.stringify(body),
    });
    console.log(response);
    return (yield response.json());
});
const main = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // GitHubへデバイス及びユーザ検証コードを要求
    const verifyInfo = yield getUserVerifyCodeFromGithub();
    // ユーザーへの認証・認可操作の指示メッセージ出力
    outputVerificationMessage({
        verificationUri: verifyInfo.verification_uri,
        userCode: verifyInfo.user_code,
    });
    // ユーザーの認証・認可操作 & Enterキー入力待ち
    yield listenEnterKeyPress();
    // 認可されたか確認
    const { access_token } = yield confirmHasBeenAuthorized({
        cliendId: (_a = process.env.CLIENT_ID) !== null && _a !== void 0 ? _a : "",
        deviceCode: verifyInfo.device_code,
        grantType: `urn:ietf:params:oauth:grant-type:device_code`,
    });
    console.log(access_token);
});
main();
//# sourceMappingURL=main.js.map