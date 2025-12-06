import { remote } from 'webdriverio';
import { getEmailTempIOExist, getMessageTempIO, getTiktokCodeTempIO, getCodeTiktok, getEmailTempIO, updateAccountToServer } from "./helper.js"
async function init({ driver, email, cookie }) {
  let agree;
  let continueBtn = await findButton({ driver, text: 'Continue' });
  await driver.pause(7000);

  agree = await findButton({ driver, text: 'Agree and continue' });
  await driver.pause(5000);
  let [temp, domain] = email.split("@");
  let email_hint = temp[0] + "***" + temp[temp.length - 1] + "@" + domain;
  let is_code = await findButton({ driver, text: email_hint });


  if (is_code) {
    await driver.pause(5000);
    agree = await findButton({ driver, text: 'Next' });
    await driver.pause(5000);
    let code = await getCodeTiktok({ cookie });
    console.log("Mã tiktok nhận được: ", code);
    await driver.pause(3000);
    agree = await findButton({ driver, xpath: '//android.view.View[@resource-id="root"]/android.view.View[2]/android.view.View/android.view.View[1]' });
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


  }

  agree = await findButton({ driver, text: 'Allow' });
  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Skip' });

  await driver.pause(5000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(5000);

  // agree = await findButton({ driver, text: 'Profile' });
  // await driver.pause(3000);
  // await findButton({ driver, text: '', xpath: '//android.widget.ImageView[@content-desc="Lock"]' });
  // //tab giữa màn hình
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


  // await driver.pause(3000);

  // agree = await findButton({ driver, xpath: '//android.widget.Button[@resource-id="com.zhiliaoapp.musically:id/pfj"]' });

  // await driver.pause(5000);

  // agree = await findButton({ driver, text: 'Add account', index: 0 });
}
async function handleChangePassword({ driver, password, cookie, email }) {



  await driver.pause(5000);

  let agree = await findButton({ driver, text: 'Password' });
  await driver.pause(3000);

  agree = await findButton({ driver, text: 'Password', index: 1 });
  await driver.pause(7000);
  await driver.sendKeys(Array.from(password));

  await driver.pause(5000);

  let is_continue = await findButton({ driver, text: 'Continue' });

  await driver.pause(5000);
  let [temp, domain] = email.split("@");
  let email_hint = temp[0] + "***" + temp[temp.length - 1] + "@" + domain;
  let is_code = await findButton({ driver, text: email_hint });

  let code = ""
  if (is_code) {
    await driver.pause(5000);
    agree = await findButton({ driver, text: 'Next' });
    await driver.pause(5000);
    code = await getCodeTiktok({ cookie });
    console.log("Mã tiktok nhận được: ", code);
    await driver.pause(3000);
    agree = await findButton({ driver, xpath: '//android.view.View[@resource-id="root"]/android.view.View[2]/android.view.View/android.view.View[1]' });
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


  }
  if ((is_continue && !is_code) || (is_code && code)) {
    let account = {
      password: password,
      "meta.is_change_password_mobile": true
    }
    await updateAccountToServer({ email, account });
  }

}
async function handleChangeEmail({ driver, email, password, cookie, old_email }) {
  let rs = await getEmailTempIO()
  email = rs.email
  console.log("Đang đổi email thành: ", email);

  await driver.pause(5000);
  let agree
  agree = await findButton({ driver, text: 'Account information' });
  await driver.pause(3000);

  agree = await findButton({ driver, text: 'Email' });

  await driver.pause(5000);
  agree = await findButton({ driver, text: 'Change email' });
  await driver.pause(5000);
  let is_verify = await findButton({ driver, text: 'Verify it’s really you' });
  if (is_verify) {
    await driver.pause(5000);
    let is_password = await findButton({ driver, text: 'Password' });
    if (is_password) {
      await driver.pause(3000);
      agree = await findButton({ driver, text: 'Next' });
      await driver.pause(3000);
      await findButton({ driver, xpath: "//android.widget.EditText" });
      await driver.pause(3000);
      await driver.sendKeys(Array.from(password));
      await driver.pause(3000);
      agree = await findButton({ driver, text: 'Next' });
      await driver.pause(3000);

    } else {
      let [temp, domain] = old_email.split("@");
      let email_hint = temp[0] + "***" + temp[temp.length - 1] + "@" + domain;
      let is_code = await findButton({ driver, text: email_hint });


      if (is_code) {
        await driver.pause(5000);
        agree = await findButton({ driver, text: 'Next' });
        await driver.pause(5000);
        let code = await getCodeTiktok({ cookie });
        console.log("Mã tiktok nhận được: ", code);
        await driver.pause(3000);
        agree = await findButton({ driver, xpath: '//android.view.View[@resource-id="root"]/android.view.View[2]/android.view.View/android.view.View[1]' });
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


      }
    }
  }


  agree = await findButton({ driver, text: 'Enter email' });

  await driver.pause(5000);
  await driver.sendKeys(Array.from(email));
  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Continue' });
  let code = await getTiktokCodeTempIO({ email, token: rs.token });

  if (code) {
    console.log("Mã tiktok nhận được: ", code);
    await driver.pause(3000);
    agree = await findButton({ driver, xpath: '//android.view.View[@resource-id="root"]/android.view.View[2]/android.view.View/android.view.View[1]' });
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

  }
}
async function handleAuthGoogle({ driver, email, password, old_email, cookie }) {
  let agree;
  agree = await findButton({ driver, text: 'Continue with Google' });

  await driver.pause(15000);
  agree = await findButton({ driver, text: 'Add another account' });
  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Email or phone' });

  await driver.pause(3000);

  await driver.sendKeys(Array.from(email));
  await driver.pause(3000);
  agree = await findButton({ driver, text: 'NEXT' });
  await driver.pause(3000);
  agree = await findButton({ driver, text: 'Enter your password' });

  await driver.pause(3000);


  await driver.sendKeys(Array.from(password));
  await driver.pause(5000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(1000);
  agree = await findButton({ driver, text: 'NEXT' });
  await driver.pause(3000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(1000);
  agree = await findButton({ driver, text: 'ACCEPT' });
  await driver.pause(5000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(1000);
  agree = await findButton({ driver, text: 'NEXT' });
  await driver.pause(6000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(1000);
  agree = await findButton({ driver, text: 'I UNDERSTAND' });
  await driver.pause(5000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(1000);
  agree = await findButton({ driver, text: 'I agree' });
  await driver.pause(3000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(1000);
  agree = await findButton({ driver, text: 'ACCEPT' });
  await driver.pause(5000);
  let is_verify = await findButton({ driver, text: 'Verify it’s really you' });
  if (is_verify) {
    await driver.pause(5000);

    let [temp, domain] = email.split("@");
    let email_hint = temp[0] + "***" + temp[temp.length - 1] + "@" + domain;
    let is_code = await findButton({ driver, text: email_hint });


    if (is_code) {
      await driver.pause(5000);
      agree = await findButton({ driver, text: 'Next' });
      await driver.pause(5000);
      let code = await getCodeTiktok({ cookie });
      console.log("Mã tiktok nhận được: ", code);
      await driver.pause(3000);
      agree = await findButton({ driver, xpath: '//android.view.View[@resource-id="root"]/android.view.View[2]/android.view.View/android.view.View[1]' });
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


    }

  }

}
async function main({ cookie, email, password, newEmail }) {


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
    logLevel: 'info',
    capabilities: caps
  });

  console.log('✅ Đã mở TikTok thành công');
  console.log("✅ TikTok opened");

  // Chờ load giao diện chính
  await driver.pause(8000);
  await driver.pause(3000);


  let content = await findButton({ driver, text: 'Sign in with Google' });
  await driver.pause(5000);

  let agree
  if (content) {
    let { x, y } = await content.getLocation();
    console.log(`Nút Signin with Google tại tọa độ x=${x}, y=${y}`);
    await swipe(driver, x, y, x, y + 300);
    await driver.pause(5000);
  } else {
    // await init({ driver });

  }

  await driver.pause(3000);
  await handleAuthGoogle({ driver, email, password });
  await driver.pause(10000);
  await init({ driver, email, cookie });
  await driver.pause(5000);

  await driver.pause(3000);
  agree = await findButton({ driver, text: 'Profile' });
  await driver.pause(3000);
  await findButton({ driver, text: '', xpath: '//android.widget.ImageView[@content-desc="Lock"]' });
  //tab giữa màn hình
  await driver.performActions([{
    type: 'pointer',
    id: 'finger1',
    parameters: { pointerType: 'touch' },
    actions: [
      { type: 'pointerMove', duration: 0, x: 540, y: 1200 },
      { type: 'pointerDown', button: 0 },
      { type: 'pause', duration: 100 },
      { type: 'pointerUp', button: 0 }
    ]
  }]);
  await driver.pause(3000);
  agree = await findButton({ driver, text: '', xpath: '//android.widget.Button[@content-desc="Profile menu"]' });


  await driver.pause(7000);

  agree = await findButton({ driver, text: 'Settings and privacy' });

  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Account', index: 1 });
  await handleChangePassword({ driver, password: 'Thaibinha3@12345', cookie, email });
  await driver.pause(5000);
  console.log("✅ Password changed successfully");

  await handleChangeEmail({ driver, email: newEmail, old_email: email, password: 'Thaibinha3@12345', cookie });
  //   await driver.deleteSession();
}

// Capture screenshot, send to OCR server and tap the returned coordinates (if found)
async function findTextOnScreenAndTap(driver, text, serverUrl = 'http://localhost:5000/find_text') {
  try {
    // takeScreenshot returns base64 string
    const base64 = await driver.takeScreenshot();

    // send to OCR server
    const payload = { image: base64, text };

    // Use fetch if available (Node 18+), otherwise require('node-fetch') if installed
    let fetchFn = global.fetch;
    if (!fetchFn) {
      try {
        // dynamic require in case node-fetch is installed
        // eslint-disable-next-line global-require
        fetchFn = require('node-fetch');
      } catch (e) {
        throw new Error('fetch is not available. Install node 18+ or add node-fetch.');
      }
    }

    const res = await fetchFn(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json || !json.found) {
      console.log(`🔍 Text '${text}' not found on screen`);
      return null;
    }

    const x = Math.round(json.x);
    const y = Math.round(json.y);

    console.log(`📍 Found '${text}' at (${x}, ${y}), tapping...`);

    // perform tap using TouchAction
    try {
      await driver.touchAction({ action: 'tap', x, y });
    } catch (e) {
      // Some drivers expect an array of actions
      try {
        await driver.touchAction([{ action: 'tap', x, y }]);
      } catch (err) {
        console.warn('Failed to tap via touchAction:', err.message || err);
      }
    }

    return { x, y };
  } catch (err) {
    console.error('Error in findTextOnScreenAndTap:', err.message || err);
    return null;
  }
}

// Capture screenshot, send a template image to OCR server for template-matching, and tap the returned coordinates
async function findImageOnScreenAndTap(driver, template, serverUrl = 'http://localhost:5000/find_image', threshold = 0.7) {
  try {
    // takeScreenshot returns base64 string (no data: prefix)
    const base64 = await driver.takeScreenshot();

    // Determine template base64: if 'template' looks like a file path, read and convert
    let tplB64 = template;
    if (typeof template === 'string' && template.startsWith('/')) {
      const fs = require('fs');
      const buf = fs.readFileSync(template);
      tplB64 = buf.toString('base64');
    }

    const payload = { image: base64, template: tplB64, threshold };

    let fetchFn = global.fetch;
    if (!fetchFn) {
      try {
        fetchFn = require('node-fetch');
      } catch (e) {
        throw new Error('fetch is not available. Install node 18+ or add node-fetch.');
      }
    }

    const res = await fetchFn(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!json || !json.found) {
      console.log(`🔍 Template not found on screen (score=${json && json.score ? json.score : 'n/a'})`);
      return null;
    }

    const x = Math.round(json.x);
    const y = Math.round(json.y);
    console.log(`📍 Found template at (${x}, ${y}), score=${json.score}, tapping...`);

    try {
      await driver.touchAction({ action: 'tap', x, y });
    } catch (e) {
      try {
        await driver.touchAction([{ action: 'tap', x, y }]);
      } catch (err) {
        console.warn('Failed to tap via touchAction:', err.message || err);
      }
    }

    return { x, y, score: json.score };
  } catch (err) {
    console.error('Error in findImageOnScreenAndTap:', err.message || err);
    return null;
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
      if (elems.length === 0) continue;

      // Lọc ra những element hiển thị được
      for (const el of elems) {
        try {
          if (await el.isDisplayed()) matchedElements.push(el);
        } catch {
          // ignore stale element
        }
      }

      if (matchedElements.length > 0) break;
    } catch {
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



main({ email: 'lolawalterkhcaq@learncolumbus.us', password: 'Phat3479', cookie: 'COMPASS=gmail_ps=Cp4BAAlriVefyxyOH7lXXqj2armX4qvPaL0JZgLFxAbAWm24wZqStUAKGsYF0WBNT5FIVNPoqB65AHG6d694q41BFrHFR2G8UFWPnxmf_SGDqRlcnR3G6HfKdBCf2H4NTe1VaG21VRf-EQLBBtSPZbFNx0N4xpwcdcRK7-fwlFaYsVv1SedA2nIAiqKIditzRWcYHBurMX76alzrP7zAQAgQ1IzVyQYa1QEACWuJV85ccjuF7yWMwJH6nbhRJtOrf9OkGuSMjiqaMQzJR06EWjquCLbi5dLdX9j6r7BmQ5cZN6EAgR9kFYtM4vPwkKsp-0HekfQWRmrXcM30QxwuQBT9sp0QETelTsWYCgWQDOjmuhROzvtWic5-eylTbFbGUsDm-tLAqUZgaTJ3RUEdk_6_OkVGbE-irvKnSntV5gHTmVvmM4-Or3DZFyLcljX0hAgucZCHB8QP5-cD4CZj7J2J3qUlVSPJ7GKpu1SBBs6hzIrtGxPEgnh78gVWHfYwAQ:gmail=CsIBAAlriVca-8WzeIVBsOP04zn3PZOTYa1U9qYHRMIgQ_vV7miivAyj0cUPtQeaJlUN-eN6vQibS4UYyh4tMc177VmP-xmv03Q1uKE2Xjm4Apgps3HwccC4RUgjRJKHzy2iZmvJGviun8Y17wwFWtdWW6kYFzFXH7OjGieIbSQ8SGQBMCrPdQnEeAeOvxWv0m9xzwQZxX2PNDo9eHEIofvTcfBrSCNA-to9zEXblrVjy7jTXl1-zySjHDjSQ22u3z6DFeEQgoDVyQYa-QEACWuJV8T9aSit9B-1u_vNpB1UFRmgrP-gTIbMeOq9iWfXJQNLA94AyP9OXLO_dP-wcP8CrbH_bupHsw6l3xy21KS8eYS7VHTuAPhwH2q4XgxHOaBt2vqwZ0uaYiau2wvmiXajsE3m6eAxrZAA-EBARJ9JF9VfTdGkY1ZRP8-ip-pu5cmMoyfbs2V_iGnIi0pbkB2WOCqDYntLL4572Fz-fJ7c28QAEIV_JxbqZMRfgk9C8uVlVui5QnslqKKPravyGKVhPWTwq8ua8urJPWgoI0ONu6TiSKl0ob4-d_w3cmmuUIsdTw_tvVo2x23cMB_I70Vx4xA9Eo4wAQ; SID=g.a0004Qj-XlyhgJ2iZ3AJ5ancLgykSHMwMbhCuSADazeGRrtE-_TLDrI0wGvKJc5GzvLr9OPndQACgYKAcYSARQSFQHGX2MiOdDGzaXY4qJdWzBuqVL3oxoVAUF8yKq0Co13FYeznsSb6LnvdlxH0076; __Secure-1PSID=g.a0004Qj-XlyhgJ2iZ3AJ5ancLgykSHMwMbhCuSADazeGRrtE-_TLwvHBI4NKixE2FMl3S9R6GAACgYKAaISARQSFQHGX2MiOq8T0BeB6Vscnz71jF5B1RoVAUF8yKoSBuplO7gJ-SIuUP7jyFbf0076; __Secure-3PSID=g.a0004Qj-XlyhgJ2iZ3AJ5ancLgykSHMwMbhCuSADazeGRrtE-_TLgaiDvFIzL9zIhTM-3nQqCAACgYKAXYSARQSFQHGX2Mi6GhefhEV8goY_FZJi6neERoVAUF8yKqn4EK1wsI0WIWe7IMYJGRy0076; HSID=Ar2O9YDLweIAW7zCK; SSID=AT1byaryrPY2-RBKj; APISID=zrWUe4ipdBCzZPEh/A1mDSE0pEtWEO4b_E; SAPISID=ARcHDBsLPSvU0nwY/AG3UFSksabAMMoDfG; __Secure-1PAPISID=ARcHDBsLPSvU0nwY/AG3UFSksabAMMoDfG; __Secure-3PAPISID=ARcHDBsLPSvU0nwY/AG3UFSksabAMMoDfG; OSID=g.a0004Qj-Xoq9-fm-OsgRr2MhpR_NHmcCkPvvLVUC7yWuVXwuXdRaZgfcnxbbl8cBsPiRTCOO4QACgYKAQASARQSFQHGX2MirG9B9ViANXBvSANZzyodrRoVAUF8yKqI1MRFwt5tglNBjvBlBI-s0076; __Secure-OSID=g.a0004Qj-Xoq9-fm-OsgRr2MhpR_NHmcCkPvvLVUC7yWuVXwuXdRa3aORrFfgmIrccDt-bNhKBwACgYKAbkSARQSFQHGX2MixY7w8psCVIcYJxtmuXHJ7hoVAUF8yKqP-0Ed5MzqQ5kD8BwSpdM-0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=527=L-oTLX5joEnPdVYNnqjWu-7H-b7p0wVMq3CYmg4y3eZfQW20yAH6IzAL5WGOrQ-gie1CGNVtbHv_ro9bzodXHeKlpyHQctZVcDEztPdq_EvzVuSXhPkeyx6_D1lxh9nC1lPXp30LUmQID4tvTZeeFnFw9HI6MBCFzlZh4kZ0Co287TH5owcyKPaejylvumP1VAQmBsR09O7TE6tSzELbMzu5dXG2JDPMUAcrRc4wsWP06I4dyJvEh7kaL-giv_S0zLO5MCvFiMALBgID8wdUg9oO--nvCFm_AzwOZlZyQdzMzzKKeIMlpUx1p5vOPJBEVncO5o58DATeJmZptZz65SEsQTQr5AHcU8wn1IkjHqmJ__je-WOzUmKD1AUfzPbH9WD2fWs4kj0PpY1vq8V0_sSElcrieYP3nY9S2Oc1398SrvA2sP0Qw2-N9paYeEbmeXxo9fBpSDXyVCexjtPu5QfMBP_aLENvLmP4UAEFspsUzuuzmqkp9UYKCm7Z3XnH3NBr6LQ9D-0POBaUyTVrSJYxob1LaSIt1y7s2N9L4pqZg8q-G2KhPqSMoneFM3VPinlWq8-M8YjAyI2Q3OQpx8VEq89fl_gHJ1DtwXBTUvxDJdgP6EpOS905OFoMj1Ib7byNg-3u14UmE3iBiDisrvfcOQ; SIDCC=AKEyXzWNoWQii6mOw-iPb-GkjzevlawBnNvZTi9JbDgmShdJxJOEspJ_gBNgiYZHRwZIMfcFcQ; __Secure-1PSIDCC=AKEyXzXLAS2gYe1D0mJw64ER2GYzSEm-9QJErXxE1uPor6rSSoc1jcMH11TzQOfLtUN9ASdv; __Secure-3PSIDCC=AKEyXzWWai-BmWov1VXBiSIVCbHfufM-pu_2W_JaXa7PLNM1DOIQ35gVWRjf04JdKZ-BIkpiTQ' });