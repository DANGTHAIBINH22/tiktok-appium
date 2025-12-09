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
        logLevel: 'info',
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
    if (texts.find(t => t.value.includes('Profile'))) {
      await findButton({ driver, text: 'Profile' });

    }
    // if(texts.indexOf(t => t.value.includes('Couldn’t sign you in'))){
    //   console.log("Không thể đăng nhập bằng tài khoản này, chuyển sang tài khoản khác");
    //   return false
    // }
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


    if (texts.find(t => t.value.toLowerCase().includes('email or phone')) ||  texts.find(t => t.value.toLowerCase().includes("forgot email"))) {

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
        await swipe(driver, x, y, x, y - 200);
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

    if (texts.find(t => t.value.includes('Swipe up for more'))) {
      let content = await findButton({ driver, text: 'Swipe up for more' });
      if (content) {
        let { x, y } = await content.getLocation();
        console.log(`Swipe up for more tại tọa độ x=${x}, y=${y}`);
        await swipe(driver, x, y, x, y - 200);
        await driver.pause(3000);
      }

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



main({ email: 'leilahballz7c45@ghatkhalihs.us', password: 'Phat3479', new_password: "Thaibinha3@123456", cookie: 'COMPASS=gmail_ps=Cp4BAAlriVeDOvs7TaiJLRLCHJmxlfHvGe6ExLJ_aa9t65sJfAqajmq6BcodDut3x3IgzF0ADseAZQprZ4KVXEYvz9klo1g3QspM6QEtAtcgKYP6YtgNhd_IUQYGowlMiG2Rm-xdO84REEJr5juM-bSoy4OywMLLM1PvzgMTYsFCqnl_r7j0FGnFPPwFH6bZR2p9ihKs3BMIcu_Vyh-DY_IQs9jfyQYa1wEACWuJVwf6BB74BcPfrW-w3g0c0rOXY1-gX6CctkQt3sntH80ls3QcDCCiOjESA6HA9320HKTw9eArovQIk_HKWOrywwPrqIlzMv9X6BZPINLXGwmzK8bBOt-5fVze1iVSngj9ImP7hKTsDWWBH-JeTb3COlM1obnGdvKy6lps6MsVpiW6PvY2sUAAAUj-Dhe2fAKl6WqGZd5bCEio-AmtBkMxdXQtjXOtNrC4VXmuve6MROfrTA7ZBE429rG3DRZARgjVbdTqPtDht2yISLfPZey-bMGgIjAB:gmail=CsIBAAlriVfWb6i9KxyUWDwKZqN6KaS_vFjw5M_41Fwyr8Y6ptpGCSE408OO5kyrDiczP4iOiib9tMvMP12YdWbHi7eiZTSZlxM4Xr5qZo3cS6bYov8wAf87fq3_7ePma76PVI-ebrT_AoPKN5sbbdi-6q-abPGUhH45hinYyMRQRes84WVv1poe48eyZNWYRPilMiQ21n8xWcTDCEehpSRXzYIOCI4L0HAnFQ2ntmCYtsNAtfE-suIVlxjqsJcnIvYabksQq-PfyQYa-wEACWuJV5B7fOLJLnrOXaFsw6qczRIn3jjr0QHgXq7nAwA0ON45pR-dVLSpItvWSiVPyAf3kCW6ZmJgnT1y0FwPbhnPZYpB-UgXxr_QChJYaG2rLT0MdZAu7fYSU6HSVk5JepQY34iaycFa_svSs_8h8qDJD759TJ21uWLA9P0VbNYbQFRdnsI4r3v6SaqUlRYOFRq9nEZnFhsIcJUBiprCrQPLql-0QA878kXzKGK4LIMzG2t3tcKPumt9VeGPKy367Mz487eQM9Q0xKQl8JCd0yMPINQQCl-_0c5EQihRDv0oWSYhYSWIgCTeJXeQNnvqITbPOAC80RKi3TAB; SID=g.a0004QjgwTYTXM-bFyg3UuETax1gPmA5feCP_x482fTeYfSMBrZe_FiNaI-Twpep2hMtcnqYNAACgYKAUsSARISFQHGX2MiaxrGP3M0TkhVAockmDMLehoVAUF8yKrc6cpIPJbgtRSmQKRw5K-z0076; __Secure-1PSID=g.a0004QjgwTYTXM-bFyg3UuETax1gPmA5feCP_x482fTeYfSMBrZe6kJ0IEotXcnS8H1xrXVHLQACgYKATcSARISFQHGX2Mit33Be7CQS25k4YdBgPmX6RoVAUF8yKoUWwfUd1har1qfy5Ryoi_f0076; __Secure-3PSID=g.a0004QjgwTYTXM-bFyg3UuETax1gPmA5feCP_x482fTeYfSMBrZe3ShSbfGkkK_KkC5FM9pgfgACgYKAeQSARISFQHGX2Mi7YBxaQ0ZgloSCOR7ZYBuJRoVAUF8yKp6-ZjUEUohd2jWsBmPsFip0076; HSID=ACfKVJw2xvSkmDQY0; SSID=AUbPS_xqsSYMNT5md; APISID=rEsFFTXsmBXb16Vb/AKBrfeMNiDvrZynai; SAPISID=jV6lP6B-kBg3Ly3l/AvOGIjQg-cFFMNqxI; __Secure-1PAPISID=jV6lP6B-kBg3Ly3l/AvOGIjQg-cFFMNqxI; __Secure-3PAPISID=jV6lP6B-kBg3Ly3l/AvOGIjQg-cFFMNqxI; OSID=g.a0004QjgwTP5uqxsEfVVPY7IcvLVPr39jxWhl3sQEOhoWYoWMrGvnzg_-dwjNtQKip1t59nAdwACgYKAaYSARISFQHGX2Mibc76uO15ueUWOkC54zQCHxoVAUF8yKo-wawbXdZgUB_k8kZudL5n0076; __Secure-OSID=g.a0004QjgwTP5uqxsEfVVPY7IcvLVPr39jxWhl3sQEOhoWYoWMrGvX83Lx9KMPJpu8evUfQirCAACgYKAWMSARISFQHGX2Miq9zWR0W0aRzDIq6IXwY07RoVAUF8yKrWcG9oV0bUIAWWiC_Jd_Zz0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=527=cS93riXuft3aQWH975osiFgRiY3sqVWmqlthWm-NhEqknbY4n8rtFICxR-490AwDQlrFH1cJaqzVnKJ7EmnJaYpzr4yenJdmC1tCnKOOa8W0dqCbVfeHqqt0b--QB2hOu9aQ1hrUqoAjx1qT-c6oATaURKU-P-_Sv_HSAG0j4vX2Ozx5vF5KaIVpaiDGz5uCMXJg-W4iYNemXwLoPMIBr6CEIpjv1lVbbb6v98ob3BxBW1UZp8y5vdUmkLrK5sBRZNo36a0xhoc8qMtSTBu27LbUn60CgFMU7nrK-jq8uOe4XyxcpZYX_X0atTjqATrMFy8CfvHHOKGxyV337t-iAj_3X_Ris1jQIX5ZtwMhznUGS22acy-6Re8rarJt5YtDeSCwy5n7xRj5F_GuLQBiANmRrGl5yOwjaTjSWv2ZrHQrkXCgHvnudsaL4NxBBlWtbcIjvxGxi602q0mwzRIK8PkCm8vceYWxWJEkZipWWYqR7g69snq92CUSNsF4rgJSBTJl9stsUfhrT3502njPTXw607yCtlORgdAhCvA-zzh8UehalFT7AeGEJssxByWP--gBnkrehHmgI6bptneZsNVDmJm7vJ7Hi_hZS1YIZ0uWvJ8ip14luQGjwzm8sLbfAoY1BFUEaOHwd5yEXAwWxmEgyw; __Secure-1PSIDTS=sidts-CjIBflaCdaTqLy31lzkg19YdMFAGLPUgC9PNgxewnPO5Eo100HU9d5xZmn1y3eLS39_k_xAA; __Secure-3PSIDTS=sidts-CjIBflaCdaTqLy31lzkg19YdMFAGLPUgC9PNgxewnPO5Eo100HU9d5xZmn1y3eLS39_k_xAA; SIDCC=AKEyXzU8j0uv_JhgSfLLfAVnAz8flkVFHFCbrO-tsu3X1Oi9wlCSHH6unebS2GpbkT4EuQZGQQ; __Secure-1PSIDCC=AKEyXzUD_4gM1tMXertezBJTqaVWuaSzsG_b757hGz6HGjIcdKVM4L_kvDQjaZxgJg0hx0J2; __Secure-3PSIDCC=AKEyXzU4devxaRvlZwJpP_vS7BQPXntjyGSksk-51CkX7vwJI_RBaRtnKGFykJhmRa_pe8tyaQ' });