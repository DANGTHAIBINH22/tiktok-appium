import { remote } from 'webdriverio';
import { getEmailTempIOExist, getMessageTempIO, getTiktokCodeTempIO, getCodeTiktok, getEmailTempIO, updateAccountToServer, delay } from "./helper.js"

import xml2js from 'xml2js';

async function getAllTexts(driver) {
  const source = await driver.getPageSource();
  const parser = new xml2js.Parser({ explicitArray: false });

  const xml = await parser.parseStringPromise(source);

  const results = [];

  function scan(node) {
    if (!node || typeof node !== "object") return;

    if (node.$) {
      const attr = node.$;

      // TEXT
      if (attr.text && attr.text.trim()) {
        results.push({
          type: "text",
          value: attr.text.trim(),
          class: attr.class || null,
          xpath: `//*[@text="${attr.text.trim()}"]`
        });
      }

      // HINT
      if (attr.hint && attr.hint.trim()) {
        results.push({
          type: "hint",
          value: attr.hint.trim(),
          class: attr.class || null,
          xpath: `//${attr.class}[@hint="${attr.hint.trim()}"]`
        });
      }

      // CONTENT-DESC
      if (attr["content-desc"] && attr["content-desc"].trim()) {
        results.push({
          type: "content-desc",
          value: attr["content-desc"].trim(),
          class: attr.class || null,
          xpath: `//*[@content-desc="${attr["content-desc"].trim()}"]`
        });
      }

      // RESOURCE-ID
      if (attr["resource-id"] && attr["resource-id"].trim()) {
        results.push({
          type: "resource-id",
          value: attr["resource-id"].trim(),
          class: attr.class || null,
          xpath: `//*[@resource-id="${attr["resource-id"].trim()}"]`
        });
      }
    }

    // Scan child nodes
    for (const key of Object.keys(node)) {
      scan(node[key]);
    }
  }

  scan(xml);
  return results;
}

async function handleChangeEmail({ driver, email, password, cookie, old_email, options }) {
  let rs = await getEmailTempIO()
  email = rs.email
  agree = await findButton({ driver, text: 'Enter email' });

  await driver.pause(2000);
  await driver.sendKeys(Array.from(email));
  await driver.pause(2000);

  let is_continue = await findButton({ driver, text: 'Continue' });
  if (!is_continue) {
    options.newEmail = email
    options.token = rs.token

    console.log("Đã nhập email mới: ", email);
    console.log("Đang chờ mã xác nhận gửi về email...");

  }
  return true;

}
async function vefifyCodeEmail({ driver, cookie, options }) {
  let code = options.token && options.newEmail ? await getTiktokCodeTempIO({ email: options.newEmail, token: options.token }) : await getCodeTiktok({ cookie });
  if (!code) {
    console.log("Không lấy được mã tiktok");
    return false
  }
  console.log("Mã tiktok nhận được: ", code);
  await driver.pause(3000);
  let isagree = await findButton({ driver, xpath: '//android.view.View[@resource-id="root"]/android.view.View[2]/android.view.View/android.view.View[1]' });
  const mapping = {
    '0': 7,
    '1': 8,
    '2': 9,
    '3': 10,
    '4': 11,
    '5': 12,
    '6': 13,
    '7': 14,
    '8': 15,
    '9': 16
  };

  for (let i = 0; i < code.length; i++) {
    await driver.pressKeyCode(mapping[code[i]]); // 6
    console.log("Đã nhập số: ", mapping[code[i]]);
    await driver.pause(1000);
  }

  return code && isagree
}

async function main(options) {
  let { email, password, cookie, newEmail, is_launched, new_password, driver } = options;
  options.is_change_password = true;
  try {
    if (!is_launched) {
      const caps = {
        platformName: 'Android',
        'appium:deviceName': 'emulator-5556', // đổi theo tên adb devices
        'appium:platformVersion': '16',        // Android version
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.zhiliaoapp.musically',
        'appium:appActivity': 'com.ss.android.ugc.aweme.splash.SplashActivity',
        'appium:noReset': false,                // không reset app
        'appium:newCommandTimeout': 3000
      };

      const driver = await remote({
        hostname: 'localhost',
        port: 4723,
        path: '/wd/hub',
        logLevel: 'error',

        capabilities: caps
      });

      console.log('✅ Đã mở TikTok thành công');
      console.log("✅ TikTok opened");

      // Chờ load giao diện chính
      await driver.pause(5000);
      options.is_launched = true;
      console.log('🚀 Bắt đầu phiên làm việc với Appium...');

      return await main({ ...options, driver });
    }

  } catch (err) {
    console.error('Lỗi khởi tạo phiên làm việc với Appium:', err);
    options.is_launched = false;
    await delay(3000);
    return await main({ ...options, driver });

  }

  try {



    let agree
    await driver.pause(4000);
    let texts = await getAllTexts(driver);
    if (texts.find(t => t.value.includes('Swipe up for more'))) {
      let content = await findButton({ driver, text: 'Swipe up for more' });
      if (content) {
        let { x, y } = await content.getLocation();
        console.log(`Swipe up for more tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 300);
        await driver.pause(3000);
      }

      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Profile'))) {
      await findButton({ driver, text: 'Profile' });

    }
    if (texts.find(t => t.value.includes('Couldn’t sign you in'))) {
      console.log("Không thể đăng nhập bằng tài khoản này, chuyển sang tài khoản khác");
      return false
    }
    await driver.pause(3000);
    if (texts.find(t => t.value.includes('Sign in with Google'))) {
      let content = await findButton({ driver, text: 'Sign in with Google' });
      await driver.pause(5000);

      if (content) {
        let { x, y } = await content.getLocation();
        console.log(`Nút Signin with Google tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y + 300);
        await driver.pause(5000);
      }
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes("Choose an account"))) {
      let is_choose = await findButton({ driver, text: 'Choose an account' });
      if (is_choose) {
        let { x, y } = await is_choose.getLocation();
        console.log(`Nút Signin with Google tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 300);
      }
      await driver.pause(3000);
      agree = await findButton({ driver, text: 'Add another account' });
      return await main({ ...options });

    }
    if (texts.find(t => t.value.includes('Continue with Google') || t.value.includes("Choose an account"))) {
      agree = await findButton({ driver, text: 'Continue with Google' });

      return await main({ ...options });

    }


    if (texts.find(t => t.value.toLowerCase().includes('email or phone')) || texts.find(t => t.value.toLowerCase().includes("forgot email"))) {

      agree = await findButton({ driver, text: 'Email or phone' });
      agree = await findButton({ driver, xpath: '//android.widget.EditText[@resource-id="identifierId"]' });

      await driver.pause(3000);

      await driver.sendKeys(Array.from(email));
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'NEXT' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Enter your password')) && texts.find(t => t.value.includes("Show password"))) {
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'Enter your password' });
      await driver.pause(3000);
      await driver.sendKeys(Array.from(password));
      await driver.pause(5000);

      agree = await findButton({ driver, text: 'NEXT' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Save password to Google Password Manager?'))) {
      agree = await findButton({ driver, text: 'Not now' });
      await driver.pause(3000);
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes('I agree'))) {
      agree = await findButton({ driver, text: 'I agree' });
      await driver.pause(3000);
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes('Back up device data'))) {



      await driver.pause(3000);
      let content = await findButton({ driver, text: 'Back up device data' });
      await driver.pause(5000);

      if (content) {
        let { x, y } = await content.getLocation();
        console.log(`Nút Back up device data tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 300);
        await driver.pause(5000);
      }

      agree = await findButton({ driver, text: 'ACCEPT' });
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes('ACCEPT'))) {

      await driver.pause(1000);
      agree = await findButton({ driver, text: 'ACCEPT' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('I UNDERSTAND'))) {

      await driver.pause(1000);
      agree = await findButton({ driver, text: 'I UNDERSTAND' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('NEXT'))) {

      await driver.pause(1000);
      agree = await findButton({ driver, text: 'NEXT' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Verify it’s really you'))) {
      await driver.pause(1000);
      let [temp, domain] = email.split("@");
      let email_hint = temp[0] + "***" + temp[temp.length - 1] + "@" + domain;
      let is_code = await findButton({ driver, text: email_hint });
      if (is_code) {
        await driver.pause(5000);
        agree = await findButton({ driver, text: 'Next' });
      }
      return await main({ ...options });


    }
    if (texts.find(t => t.value.includes('6-digit code'))) {
      let code = await vefifyCodeEmail({ driver, cookie, options });
      if (options.is_change_password_pending && code) {
        let account = {
          password: options.new_password,
          "meta.is_change_password_mobile": true
        }
        console.log("Updating password to server...", account);

        await updateAccountToServer({ email, account });
        options.is_change_password_pending = false;
      }
      return await main({ ...options });

    }
    if (texts.find(t => t.value.includes('ALLOW'))) {
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'ALLOW' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Allow'))) {
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'Allow' });
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes('Skip'))) {
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'Skip' });
      return await main({ ...options });
    }



    if (texts.find(t => t.value.includes('Lock')) && texts.find(t => t.value.includes("Profile menu"))) {
      await driver.pause(3000);
      await findButton({ driver, text: '', xpath: '//android.widget.ImageView[@content-desc="Lock"]' });
      await driver.pause(5000);
      await findButton({ driver, text: 'Add to Favorites' });
      // await driver.performActions([{
      //   type: 'pointer',
      //   id: 'finger1',
      //   parameters: { pointerType: 'touch' },
      //   actions: [
      //     { type: 'pointerMove', duration: 0, x: 540, y: 1200 },
      //     { type: 'pointerDown', button: 0 },
      //     { type: 'pause', duration: 100 },
      //     { type: 'pointerUp', button: 0 }
      //   ]
      // }]);
      await driver.pause(3000);
      agree = await findButton({ driver, text: '', xpath: '//android.widget.Button[@content-desc="Profile menu"]' });
      await driver.pause(3000);

      agree = await findButton({ driver, text: 'Settings and privacy' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Settings and privacy'))) {
      await driver.pause(1000);

      agree = await findButton({ driver, text: 'Account', index: 1 });
      return await main({ ...options });
    }
    if (!options.is_change_password) {
      if (texts.find(t => t.value.includes('Account information')) && texts.find(t => t.value.includes('Switch to Business Account'))) {
        let agree = await findButton({ driver, text: 'Password' });
        await driver.pause(3000);
        return await main({ ...options });
      }
      if (texts.find(t => t.value.includes('Enter password')) && texts.find(t => t.value.includes('Create password'))) {

        agree = await findButton({ driver, text: 'Password', index: 1 });
        await driver.pause(3000);
        await driver.sendKeys(Array.from(new_password));

        await driver.pause(2000);

        let is_continue = await findButton({ driver, text: 'Continue' });
        options.is_change_password = true;
        options.is_change_password_pending = true;
        return await main({ ...options });
      }
    }
    // ĐỔI MAIL
    if (texts.find(t => t.value.includes('Account information')) && texts.find(t => t.value.includes('Switch to Business Account'))) {

      await driver.pause(5000);
      let agree
      agree = await findButton({ driver, text: 'Account information' });

      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Account information')) && texts.find(t => t.value.includes('Phone number'))) {
      await driver.pause(3000);

      agree = await findButton({ driver, text: 'Email' });
      await driver.pause(3000);
      agree = await findButton({ driver, text: 'Change email' });
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Enter email'))) {
      await handleChangeEmail({ driver, email: "", old_email: email, password, cookie });

    }
    await driver.pause(3000);
    return main({ ...options });
  } catch (err) {

    console.error('Lỗi trong quá trình tự động hóa:', err);
    await delay(5000);

    return main({ ...options });

  }
}

async function swipe(driver, x1, y1, x2, y2, duration = 300) {
  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: x1, y: y1 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 50 },
        { type: 'pointerMove', duration: duration, x: x2, y: y2 },
        { type: 'pointerUp', button: 0 }
      ]
    }
  ]);
  await driver.releaseActions();
}
async function findButton({ driver, text, index = 0, xpath, isClick = true }) {
  const selectors = xpath
    ? [xpath]
    : [
      `//*[@text="${text}"]`,
      `//*[@content-desc="${text}"]`,
      `//android.widget.Button[@text="${text}"]`,
      `//android.widget.TextView[@text="${text}"]`,
      `//android.widget.EditText[@text="${text}"]`,
      `//android.widget.EditText[@hint="${text}"]`,
      `//android.widget.EditText[@content-desc="${text}"]`,
      `//*[@resource-id="${text}"]`,
    ];

  let found = null;
  let matchedElements = [];

  for (const selector of selectors) {
    try {
      const elems = await driver.$$(selector);
      if (elems.length === 0 ) continue;
       async function getPro(e){
        try {
          return await e.isDisplayed()? e: false
        } catch (e) {
          console.log("Lỗi get property: ", e.message);
          return false
        }
      }
            let promises = []

      for(const e of elems){
        promises.push( getPro(e))
      }
      const results = await Promise.allSettled( promises);


      results.forEach((r) => {
        if (r.value) {
          matchedElements.push(r.value);   // element
        }
      });

      if (matchedElements.length > 0) break;
    } catch (e) {
      console.warn(`⚠️ Lỗi khi tìm selector "${selector}":`, e.message);
      // bỏ qua lỗi selector
    }
  }

  // Nếu có ít hơn index+1 phần tử thì báo lỗi
  if (matchedElements.length === 0) {
    console.warn(`⚠️ Không tìm thấy nút có text="${text || xpath}"`);
    return null;
  }
  if (index >= matchedElements.length) {
    console.warn(
      `⚠️ Chỉ có ${matchedElements.length} nút "${text}", không có nút thứ ${index}`
    );
    return null;
  }

  // Chọn phần tử theo index
  found = matchedElements[index];
  console.log(
    `✅ Found button "${text}" (index ${index}/${matchedElements.length - 1})`
  );

  try {
    if (isClick) {
      await found.click();
      console.log(`✅ Clicked button "${text}" at index ${index}`);
    }
  } catch (err) {
    console.error(`❌ Lỗi khi click button "${text}":`, err.message);
  }

  return found;
}



main({ email: 'staciahoffmandkq6g@ghatkhalischool.us', password: 'Phat3479', new_password: "Thaibinha3@123456", cookie: 'COMPASS=gmail_ps=CrMBAAlriVexwbkqVgHkK8xGaSm0Cjk7fc5-_vB1ZHxfH83W2Zz1XAOyusHEPW8l_a-ZXUVwsmORGVvY3sqPh3ZRObsZ1FFGD3Op40gJFvKfFv8Wy1v0uFt5l1v6ZziLkAZS2JZKI1Aha_K0BY8JfUweCc6NjOH5-fpavfdgjHL1BW7qpsoWS1FA2DKESrPl8oLr5kgJxEfS2dzsNb3-6531iifMsyujxwZlXRPVU6AYzNxyxlwQs7jlyQYa7AEACWuJVyPpb8RNaQXEzdFFjlZPajojVAji7Aj3MaZQZBVyT_uIS8MZxrs3RoHVPXrMdhbAXutkeqkm6q3bhojIntkEXOUIBwKowuQpomeuboLgd5tUyUK66CCRJCETo6KjAu7dA81qGq6P1qdts_WwW_9_Fszfw2pNFmHaMyVKRxPbzTGarNk9DN8G9bp_8L8rRsKH1S2SMez_RbqcZDBa6HPSgg7RjkeEsBPGgou3_P5-WIQX1aLgLpPNzewrII2a0LAmM73Er20qSbPKeI4VIhi19Ile986vXBwLw14-QFmZTGTXtqZ3oOS3PzAB:gmail=CsIBAAlriVeP-BDgSMoZg9w4qhy6kXV0qY1SUZH4SQ_sD1Acr9kf0dzi-tN67CaOGKXstztnvnH9me9sPe6LqCpZFJ2qMCwOMs0eFkYJJlr7woAnozS4l5FSbPXKlCN8xxoX55AjgKApaFk0Zw3rpy7Y1y1k2ucbn13Caa3_jTwy-VkFjpWv683rdthXFqDaLGI8EGDfHxKKbwEK2DfyHnrToeohGUBLW8yqY9gfJjYQVW-YXAA7z6-c3EuYXucgH6l-m04Qhb3lyQYa-wEACWuJV9um1nYPsO8jktr17zV_Jk69whgDcbMOTXcRS5oGHs4hOT6lTerHmS1AmMwKsJOGhDK_1hZJxCAMmlN4rAdSwFsJqFaYNeT7dW4_1Q31OWd1eyI0Ima7lhxF7Z9cx8FWEuVfCBsnPEnG9cedAVMx9nBjmL4z-MeMtfVc7s-tb0tPwVmuMrWt09grUcn-LKDjhEr07_thYszPlD1zAYiDDv3GyzCJIKySg4251Geh-VrlKbmyoQHGoJi7xtD03w5qzN-6DkTmVP1U0q51F5k4MlKGRL0O-KTt0rVvM7yHAW4nya_CKpOza_OoPiwVALPi-7bgDpo5UTAB; SID=g.a0004Qiw--iACjwJ3_2Xu38p97GHZJ1wHR6t4rp-ooD5ONpnNzQqZl2dcQQlcqRgz23cbMhAQAACgYKARcSARYSFQHGX2MikzT2DiDezHKoXJNE0kA5cxoVAUF8yKqKKv-lyYa4-uTGSxrGx6rP0076; __Secure-1PSID=g.a0004Qiw--iACjwJ3_2Xu38p97GHZJ1wHR6t4rp-ooD5ONpnNzQqhCK8GRqJ7KBhsQU6kmObWAACgYKAc0SARYSFQHGX2Mi3tYswIcOrWq8aowmKbG5FxoVAUF8yKpdtwrJx_IpNr-AxxA3cUpq0076; __Secure-3PSID=g.a0004Qiw--iACjwJ3_2Xu38p97GHZJ1wHR6t4rp-ooD5ONpnNzQqS46KrXztv6N-jCjdiqbXfAACgYKAQYSARYSFQHGX2MiUvoIfdJ8D2KOFWdyy-ew9xoVAUF8yKoJKzJv1NdNcPsX-l6oKkfJ0076; HSID=AdfJSCtylc60jb9c5; SSID=AkTZxx10A2sFtZyoA; APISID=QJYMDX3Q-Z43Qf-c/Agh8UM68ney5MIXY1; SAPISID=fjxHOWyX6mwISf79/AdPJQXmfpJZ20S0tD; __Secure-1PAPISID=fjxHOWyX6mwISf79/AdPJQXmfpJZ20S0tD; __Secure-3PAPISID=fjxHOWyX6mwISf79/AdPJQXmfpJZ20S0tD; OSID=g.a0004Qiw-_aEnS4vfgS1N15qTHsx0feWlaMRYkCnHVfydVUTdi3G_L2S2XcdMn834-OqB6wuAgACgYKASYSARYSFQHGX2MibjbpqBClrZqbF_T4QM9eVxoVAUF8yKpV5m3GSGFyDhk3QogNhz4I0076; __Secure-OSID=g.a0004Qiw-_aEnS4vfgS1N15qTHsx0feWlaMRYkCnHVfydVUTdi3GTsYNUxTUfvHcBsdXVm_mLAACgYKAWISARYSFQHGX2MiVJDk4yzEav4fhZFP6uFEfhoVAUF8yKr9vprPEQkLwWOURmZPYCTc0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=527=LFWgL9jZLv4Q2uhxL5NpDzUbvFM4x8XVmxL68-u6fsXmh2udzmbhoBXwXlE-6csGGm96UvD31sdlAAI8WZKEfDG5hiyH1PInGfOakLHaGinczqhUcVDtvcpZKkYl5nAtUHTcaG0CI2KefySGWlM5O3INpmI0DPiJSlyUBY3Tcfs41X9iw9AFW_qlrxNDxrz8QnXBcjUQTmgD1aeDsN2rYiiXQFAoal3za_7upbgGMQxb9nktE1l1dxMU0BRBoBYhjNNp8K4hLPQs0dLZgg; SIDCC=AKEyXzWRnhMMPuqRL2W357lxki1A7gh5JovyV02IFozOXdIeBUXyrauUjZ6dGZdbCu__BvZ4; __Secure-1PSIDCC=AKEyXzUmQIjBWuPPYP1d6IcY8Txtw7J6J0qbW8I-1dH5-0czV8yGPGedRe1TzrkKs_UBYV7N; __Secure-3PSIDCC=AKEyXzVpd7OLutfnk3f_RPaopBRwyKbEw7L0CvgutODc3RbjRwlra1ERDwJxy9Vez4wbJ6aR' });