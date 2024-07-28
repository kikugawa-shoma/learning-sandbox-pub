// import { ApolloClient, InMemoryCache } from "@apollo/client";
const keypress = require("keypress");
import { msg } from "./module";

console.log(msg);

keypress(process.stdin);

// const cache = new InMemoryCache();

// const client = new ApolloClient({
//   cache,
//   uri: "",
// });

const getUserVerifyCodeFromGithub = async () => {
  const VERIFICATION_URL = "https://github.com/login/device/code";

  const method = "POST";
  const body = {
    client_id: process.env.CLIENT_ID ?? "",
    scope: "repo",
  };
  const headers = {
    // "Content-Type": "application/json",
    Accept: "application/json",
  };

  type LoginResponse = {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
  };

  const response = await fetch(VERIFICATION_URL, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  console.log(response);
  return (await response.json()) as LoginResponse;
};

const outputVerificationMessage = ({
  verificationUri,
  userCode,
}: {
  verificationUri: string;
  userCode: string;
}) => {
  console.log(`Please access ${verificationUri}.`);
  console.log(`And input code "${userCode}".`);
  console.log("After finished above steps, please press Enter key.");
};

const listenEnterKeyPress = async () => {
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
  await promise;
};

const confirmHasBeenAuthorized = async ({
  cliendId,
  deviceCode,
  grantType,
}: {
  cliendId: string;
  deviceCode: string;
  grantType: string;
}) => {
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
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method,
    headers,
    body: JSON.stringify(body),
  });

  type AuthorizeInfo = {
    access_token: string;
    token_type: string;
    scope: string;
  };
  console.log(response);
  return (await response.json()) as AuthorizeInfo;
};

const main = async () => {
  // GitHubへデバイス及びユーザ検証コードを要求
  const verifyInfo = await getUserVerifyCodeFromGithub();

  // ユーザーへの認証・認可操作の指示メッセージ出力
  outputVerificationMessage({
    verificationUri: verifyInfo.verification_uri,
    userCode: verifyInfo.user_code,
  });

  // ユーザーの認証・認可操作 & Enterキー入力待ち
  await listenEnterKeyPress();

  // 認可されたか確認
  const { access_token } = await confirmHasBeenAuthorized({
    cliendId: process.env.CLIENT_ID ?? "",
    deviceCode: verifyInfo.device_code,
    grantType: `urn:ietf:params:oauth:grant-type:device_code`,
  });

  console.log(access_token);
};

main();
