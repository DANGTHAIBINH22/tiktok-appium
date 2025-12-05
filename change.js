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

  agree = await findButton({ driver, text: 'Password' });
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
async function handleAuthGoogle({ driver, email, password }) {
  let agree;
  agree = await findButton({ driver, text: 'Continue with Google' });

  await driver.pause(10000);
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

  await driver.performActions([{
    type: 'pointer',
    id: 'finger1',
    parameters: { pointerType: 'touch' },
    actions: [
      { type: 'pointerMove', duration: 0, x: 5400, y: 1200 },
      { type: 'pointerDown', button: 0 },
      { type: 'pause', duration: 100 },
      { type: 'pointerUp', button: 0 }
    ]
  }]);

  await driver.performActions([{
    type: 'pointer',
    id: 'finger1',
    parameters: { pointerType: 'touch' },
    actions: [
      { type: 'pointerMove', duration: 0, x: 5400, y: 1200 },
      { type: 'pointerDown', button: 0 },
      { type: 'pause', duration: 100 },
      { type: 'pointerUp', button: 0 }
    ]
  }]);

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



main({ email: 'davetapina2dfte@gkhigh.us', password: 'Phat3479', newEmail: 'bmny5ypoc9@mkzaso.com', cookie: 'COMPASS=gmail_ps=Cp4BAAlriVeLPdgGYckS3in6uiDsfpjxtIFgX9FL6GwWHQ95Ik4iPYO8yfQbI3A15w6aLQo6kVeLsrMsyb8IAWjGrvvrsvUT3AmsZgnWNJbMEcpSqR84JU150vrU1KWgnaruGNDMHchGu2kI84z2s3t4UD3SrJfwRf7c17j9FOxV77sQTFoPaRmenolVTTy8u2pv1vNHYdA9_0SXNr75W-EQjY3KyQYa1QEACWuJV0Fhy5AGCT0mMXARMcL37SJ3v74OG23VyFmrUPRoppk8_C9wky_jcB3oTEIS2YfKSoULtjof56IPcOyX_Q7CwEG1vNDBYXdGXTeJYo2rV9_tjvWKZWJiWlfjZeg7DA3wBBQqckK0vXmgoJmzgn72emY6gf7R8s2IRH6XNghQgwvgFJY87Cu_m6OlEsmYHa5wTDQVz3DcOua9F78P5Ww0GJggjoCegjgULfhaH4lGOgUpEKC4rFLG2biLCxDIaXZTlJHSoThknVVJ0tqVz3PZ8zowAQ:gmail=CsIBAAlriVf-uP5A77HnCdLt4FN2WufQ2TyysoGca-cnZ_U9GdnRRYYUPqpNcH7PuvQ5ImO43YuYYbUcamrZ8bspme2Jqr04WbsZqLNTgN1m_mIbkAnEhFYeEBV7CpP_m20z_mvFIULA_UFcM7vihs2oKfMRkFyZ9WppEd2BdJwbM1Zw4uxZGWly3lFuClsh5J2nJ18_I2uyZtfkKfmQEE1UYpGaoEP34rBy0PqREoLhpeFaelbqf8ETBmr7aggxV7HV3Y8Q6JTKyQYa-QEACWuJV66xx5bO5dwFhxsTRVXao2e5PsvPJHLOKb2nmQTO3_1uEVWCWVjDVV3OHDKjX6NAdiG0b3a3zkO-AnjGmEd9Qkcr2UrX6c0es_ruKendYrDFAGvex6LwD2p6FA1auilGwHojhX8UZ60iAt58_JgILtc1SkvNoT2LvNRE9oc5sRBWTCijZun48XZoS66sFhTEi5_S5FPfQMe0-RRmXSAtM3w39MJG1bklf-SXZnbMLjoOin4TSb9Wwj6FbbcTMSvmXWyz5HGmCGvw_IrMQyRf2pDvfIfAeqQcqHXkRYYgpCfPCnij5v0daPAEek7m59UVvtWTadMwAQ; NID=526=fOUWF8Q_qAbzNBdCSbzNV7zyIPJVITUjnI3eReXstXqvIxUvITtuwQfxD-Smgdbucsujjqs1p0d2cGe4wA9djbsK7Sd4PRxoMTNv7_OsV6N25aACoRZmbHoHJ0uqYl2fCzSUcWhKRMgdqhPoUGAkVx-J-hEU4oQZYLjMeO5DdeooxF0P-JqeU_z8V8UO6QUUJLWtLBuS9Ne-TVzrac7sPTZBGXQqGsWJ1s1yWb6eQBPFT8s8yq4KKQO0G-VjrxebIywVhBngpq9jQseL7buDqdWNqpcNgE0UgP6U_1egPhO4ArMefaubbFiZCoxQ86ROH6nesrLmlKenZfE4knfxsWMumOFRf-kDn7mglrZf4YG1eC0KdemxGg54hORcmH4HmFimB8MaShKBmvQnw24_XgJMby_CZHUIWVPUhsarqI9toALYiQKx50uOa--k08qnPkPVtCGCsWGNEPY9VDYwy6ZqAY0--W5OZ2E4yHXqDcW36jbv2aVosM92Ex4gQlhLbVNpSsMb62mrQJYn6-ElXdjpnIfi3fnPUjyLAWngoQmeOVsFswuAW_OV9DNYZsQT_Z6Qk6CAOqUxdzEWSbM97rX4jLr4qVDmEI09oO0MviUfXFNVB9j09xIBFpkOm25Br8OaoHGv; SID=g.a0004AhsLoVbZVbXfs6lreOW22o3TYJ_dU6VZnfRw9UQHkYuCZXLhKcCr_Tzs58lRfYjtfqMQwACgYKAeYSARcSFQHGX2MiiEPFSpX2j9DROJA1msYoDhoVAUF8yKp_TuaPC2dR3k_Xw5wmubdi0076; __Secure-1PSID=g.a0004AhsLoVbZVbXfs6lreOW22o3TYJ_dU6VZnfRw9UQHkYuCZXL-JOPwRLHebUZinGjfA-uAQACgYKAZASARcSFQHGX2MiZfHWWMqbk7PVKVvvRj942BoVAUF8yKpma0kkv6ngmz9-Z5R_2myA0076; __Secure-3PSID=g.a0004AhsLoVbZVbXfs6lreOW22o3TYJ_dU6VZnfRw9UQHkYuCZXLHIhw3seezENQSweXyVljaQACgYKAZwSARcSFQHGX2Mi6naCUZobyCR17_Fd83RgNRoVAUF8yKookCu8M8ddVCT59Y_AMpnB0076; HSID=A9NmSKTDTUpmwPDTO; SSID=A1eYXL4gnMw5YIVKX; APISID=kVp7Pwq-iMLibjNH/A90dKRxqu_fZQwqXX; SAPISID=HpNiVNge0ppnHHhA/AefeLmSAz1rQlM6ao; __Secure-1PAPISID=HpNiVNge0ppnHHhA/AefeLmSAz1rQlM6ao; __Secure-3PAPISID=HpNiVNge0ppnHHhA/AefeLmSAz1rQlM6ao; OSID=g.a0004AhsLvPnvkNbNEn6PJLSiJvieJypFakg23ynJ7Hk9hF49vJhDpvR1SkuPBteFN5QvnH6SAACgYKARsSARcSFQHGX2Mi3DNd3-SFhOzy0TWP89INjxoVAUF8yKqMl1PcPlBKyIHwmmNQYkAf0076; __Secure-OSID=g.a0004AhsLvPnvkNbNEn6PJLSiJvieJypFakg23ynJ7Hk9hF49vJhQG-SRUThVhfv5QEyBtWO2AACgYKAf0SARcSFQHGX2Mi62ANSgK9zhfhSCmTW1_LWxoVAUF8yKpgt1QjOdBQ_1lsfu2o28zV0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; SIDCC=AKEyXzXYpvlblazV7SmRmmRhiV5amVJvwti-g-cq1cvaMuplLBzfa8qk7o3ejOmOJkdkPnhEmg; __Secure-1PSIDCC=AKEyXzVNRuDiR-IhxRFyw7Wdyta7fYv7SWDR-DZmphwPkULumvtFIm2DK4ORE_p1UP_qMoSj; __Secure-3PSIDCC=AKEyXzVpADwiKo0RWLcTRR3ur0WSmSyeEohpexS7V3s-ZKya-LJaH_ZpXUhMH_zfNuH5qBMp' });