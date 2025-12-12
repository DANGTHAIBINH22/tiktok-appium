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
  let agree = await findButton({ driver, text: 'Enter email' });

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

  return code
}

async function main(options) {
  let { email, password, cookie, newEmail, is_launched, new_password, driver } = options;
  try {
    if (!is_launched) {
      const caps = {
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554', // đổi theo tên adb devices
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
      await driver.execute('mobile: deepLink', {
        url: "musically://login",
        package: "com.zhiliaoapp.musically"
      });
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
    await driver.pause(1000);
    let texts = await getAllTexts(driver);
    texts.forEach((t, i) => {[["hint", "text", "content-desc", "resource-id"].includes(t.type)]? console.log("Text found: ", t.value):null});
    if (texts.find(t => t.value.includes('Swipe up for more'))) {
      let content = await findButton({ driver, text: 'Swipe up for more' });
      if (content) {
        let { x, y } = await content.getLocation();
        console.log(`Swipe up for more tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 400);
        await driver.pause(3000);
      }

      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Profile'))) {
      await findButton({ driver, text: 'Profile' });
      await delay(1000);
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
        await swipe(driver, x, y, x, y + 400);
        await driver.pause(5000);
      }
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes("Choose an account"))) {
      let is_choose = await findButton({ driver, text: 'Choose an account' });
      if (is_choose) {
        let { x, y } = await is_choose.getLocation();
        console.log(`Nút Signin with Google tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 400);
      }
      await driver.pause(3000);
      agree = await findButton({ driver, text: 'Add another account' });
      return await main({ ...options });

    }
    if (texts.find(t => t.value.includes('Continue with Google') || t.value.includes("Choose an account"))) {
      agree = await findButton({ driver, text: 'Continue with Google' });

      return await main({ ...options });

    }
    if(texts.find(t => t.value.includes('Sign up for TikTok')) && texts.find(t => t.value.includes('Already have an account? Log in'))){ 

      agree = await findButton({ driver, text: 'Already have an account? Log in' });
      return await main({ ...options });
    }

  
    if (texts.find(t => t.value.toLowerCase().includes('email or phone')) || texts.find(t => t.value.toLowerCase().includes("forgot email"))) {

      agree = await findButton({ driver, text: 'Email or phone' });
      agree = await findButton({ driver, xpath: '//android.widget.EditText[@resource-id="identifierId"]' });

      await driver.pause(3000);

      await driver.sendKeys(Array.from(email));
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'NEXT' });
      agree = await findButton({ driver, text: 'Next' });

      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Enter your password')) && texts.find(t => t.value.includes("Show password"))) {
      await driver.pause(1000);
      agree = await findButton({ driver, text: 'Enter your password' });
      await driver.pause(3000);
      await driver.sendKeys(Array.from(password));
      await driver.pause(5000);

      agree = await findButton({ driver, text: 'NEXT' });
            agree = await findButton({ driver, text: 'Next' });

      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('Save password to Google Password Manager?'))) {
      agree = await findButton({ driver, text: 'Not now' });
      await driver.pause(3000);
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes('Agree and continue'))) {
      agree = await findButton({ driver, text: 'Agree and continue' });
      await driver.pause(3000);
      return await main({ ...options });
    }
    if (texts.find(t => t.value.includes('I agree'))) {
      agree = await findButton({ driver, text: 'I agree' });
      await driver.pause(3000);
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes('Back up device data') || t.value.includes('Use basic device backup'))) {



      await driver.pause(3000);
      let content = await findButton({ driver, text: 'Back up device data' });
      if (!content) {
        content = await findButton({ driver, text: 'Use basic device backup' });
      }
      await driver.pause(1000);

      if (content) {
        let { x, y } = await content.getLocation();
        console.log(`Nút Back up device data tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 400);
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
        if (texts.find(t => t.value.includes('Next'))) {

      await driver.pause(1000);
      agree = await findButton({ driver, text: 'Next' });
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
    if (texts.find(t => t.value.includes('6-digit code')) || texts.find(t => t.value.includes('enter the code'))) {
      let code = await vefifyCodeEmail({ driver, cookie, options });
      if (optiois_change_password_pending && code) {
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
    if (texts.find(t => t.value.includes("Start watching"))) {

      await findButton({ driver, text: '', text: 'Start watching' });
      await driver.pause(1000);
      return await main({ ...options });
    }

    if (texts.find(t => t.value.includes("Profile")) && texts.find(t => t.value.includes('Sign up'))) {
      console.log("Có sign up, nghĩa là chưa đăng nhập được");
      await driver.pause(1000);
      await findButton({ driver, text: '', text: 'Sign up' });
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
    console.log("Chưa xử lý được, thử lại...", texts.map(t => t.value).slice(0, 20));
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
      if (elems.length === 0) continue;
      async function getPro(e) {
        try {
          return await e.isDisplayed() ? e : false
        } catch (e) {
          console.log("Lỗi get property: ", e.message);
          return false
        }
      }
      let promises = []

      for (const e of elems) {
        promises.push(getPro(e))
      }
      const results = await Promise.allSettled(promises);


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



main({ email: 'tallulahbryant21ega@cecsusa.us', password: 'Phat3479', new_password: "Thaibinha3@123456", cookie: 'COMPASS=gmail_ps=Cp4BAAlriVe8FvCyIYGBr-IVuFzxMvM1jri1hHmElReGHBap2VbRgczxL1IbXrfTmEYhvFLx15337Ns-q5u1jz9G7jeNF75l3FApqyonlvFjj6n_3Zg_Xtf-jc5NIe4wZBrkibwI1khadqq8KJ4zvoL9XZrqPpcGDOsEWh-OIug6_3eFjKUnC0F9kTBcyhhR-i5vn-8R4lXJiYpYV-3p5wIQ877lyQYa1wEACWuJV2h7_OzUuMu5Kqy6P8IBEiCWReOCPHAzDVamDINdZXyc4zE8cZzOgZhNwyK_ynwB5tcGYlRIiCJRSEfI14UTbXJpQsFdl-8YvEA-us13gPWUFJb3Q729laewIxOwgXImKPpMvXe_9WCYiqc5WUJW2AlCz45SE6SfqPGnWx7WTcMvEPuDACJsxHIRO0fICrv7NeJ4TAwau9MIHOa2Nv-yRirsKHv2c8vr0l2zee-s8kAI5k9-98HcIq6gOQdBLo30KSZYsNxNkR-QiLbhHSDwkxzKzjAB:gmail=CsIBAAlriVfxp59iLnwvWlgjyboFU-_Emv27sgCVbdIl1jVNgNAVBMb1REG-wHJxvOrKetE-Uu-lx0MucLHd0PWO1Y6-OIdbT0L2MmRVbyIqMuFJApA02p4-ZhdumLkfGY7ABkEPwAQE-bUJAvVXW5abpuloM6Ru5aUqYmmc5ia59pvOfDBB2PixXQtP1w5UiBrhX_LtsF_Ma6Z-8NLbndUq1cNUmGcXg8xulRssSXcB8FpYHZ214W95DbZxlstknA8BHmYQi8HlyQYa-wEACWuJV795_9I385hxq2gNwG_hIHBHSXgXsDzd3jKDEuwBXKkipqOkjE3b0BSze1ESgL6RsfyU5h2PDMPwk79gzNL9i30LNSlvliQnGb3YxRpf-7VPkn77_V05LN1UPCA4Onuh0nLu2_YrcUTl0qkS82H4VztGFtp5ejj5U9sDgbmRB4TpqSXn7wXMGNFFfC-rzJsThz__9eJH88A6efJZ1TopqleNOEx51-y1n0w--LMbUKvUfXk55Bg8YLvYOk9X4a_s7b5menfZKzi9rH_dAUfY-QceptrBuLOWX671CYlKuvht9yFbXAnaTsvxhgcabqpMF8OaxWoMijAB; SID=g.a0004Qh6jIuNATNY-qvD2Repse1_vbQsPbHIQKgwpFxQR9Jyz7gHoG30ff7zbCwF8X26xwZ-YQACgYKARISARMSFQHGX2MiSrTGWUylthsKAxrQMGKFlRoVAUF8yKoao88S9ib-SGjp94U4sSJN0076; __Secure-1PSID=g.a0004Qh6jIuNATNY-qvD2Repse1_vbQsPbHIQKgwpFxQR9Jyz7gHJR7t5V3Et5agX8j1B1Gt3gACgYKAVYSARMSFQHGX2Mi6fld8Fk2kocYwA4dcRFgrxoVAUF8yKrDpqQTiYv2L5Xb2S9RfTsE0076; __Secure-3PSID=g.a0004Qh6jIuNATNY-qvD2Repse1_vbQsPbHIQKgwpFxQR9Jyz7gH3oqKdjbTfAWnkpzczsSPngACgYKAZESARMSFQHGX2MiOfv2CKwkT7dm0VEY4mt-sBoVAUF8yKojS05T9ZRRl8lr3CZKD_cS0076; HSID=AqL3DrTWvaVzJqtAJ; SSID=AOG9Ja-AsQ95ILVsT; APISID=WnZijsBiWKhSQR_c/AY-zD_pVaZnWDJsxZ; SAPISID=pexnzqQbbUZt5uWL/AYqZDeID_C8qMr-ex; __Secure-1PAPISID=pexnzqQbbUZt5uWL/AYqZDeID_C8qMr-ex; __Secure-3PAPISID=pexnzqQbbUZt5uWL/AYqZDeID_C8qMr-ex; OSID=g.a0004Qh6jLhYeB5cZb726ix9oA80CQjDLrmq29DrGKlDRllXlaM8878JqwpKgApHM4HzVYvxOgACgYKAW8SARMSFQHGX2MiZO9Tg3hWkOZWcW_bZtjA4hoVAUF8yKqgOSLhmpschGN2lxkUURP30076; __Secure-OSID=g.a0004Qh6jLhYeB5cZb726ix9oA80CQjDLrmq29DrGKlDRllXlaM8ImkobJmRvFhkvhYoZY6uxAACgYKAZESARMSFQHGX2Mi6NEqKGw7J0ssKQIaepihvhoVAUF8yKq2SwFLq2EXLhsjWpamN3Gv0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=527=jfIe_dvOjOX8oMT_gOTz_baWedjUBE0aVIB84wVjt3VDFAR2vRL6PYvhMLCC_VtzOSFl-buM_RJ5Swkt9nknVZ8EaTg6IbImuc7PeXaBhfZXWbp36gJXHqVp18ZfR_smf9rdV10NPtp2pJ-oOYhln0vNEcSQSVeRSehCvlM0MtFps2geEQVUDjaJFif1qYfD6u1OgNNf-arXgNNW9iCD1bHDZ2NaInwcYwYBSofjVTMnAojCsahDEDkGc2V1DfJQziaJy-A8lal-xqQ8nmTscKgAExr3ssPMxz79lCLrI3V0T_FFCuaDx4wrz8RTSBU58QXMTiaNSx0ERVADXhXuf1uYSa_NduUygbzNVpD_G-sjTTKV5z-OpOywlf3599ovLXzVlQyQ4XBvUts5GHCNQVYCSNyQxneMU8sWakmstU-giKoqg3veHelW4bWVLDzZQzhxCeKAVyiZbPmPDFxRPsqKllvgPjvd-T-_xl39_WK2jb57rYQLvoSSRwmOILd8Qq-T3LaInZoIHRrysHlBeBq8-MhKLd_mOj4BNUJPVvklc8zRUkS3emtGZP0WoB2m2LHThWx5O8yzg3wFmUlbZMnIg3L1p9bR5CgUNz1mr2xGXW9ldiVxZnnkiR-qe5oblflvwSHIYXQFQWOejPuv5Ykt4h4; SIDCC=AKEyXzVFMHztCechZzHDF_kmXHsn0h4G8sxHqqOMcw1GUc7OHqc3DQK6HXBZ_CPgQ56tdehl; __Secure-1PSIDCC=AKEyXzXTe-ckLZLuWlkxkhM-dx9iGrxFQpFgLbN-6E782hopDbwVueeW87-hw0Osa2XGLEs_-Q; __Secure-3PSIDCC=AKEyXzW-Fy58MsBPcyWdbr-NAJeZOQUO2izVWjJnuGs6IP1rH-kKFZOuVSXttqD5ZWCF3-i9' });