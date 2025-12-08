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
        'appium:noReset': true,                // không reset app
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


    if (texts.find(t => t.value.includes('Email or phone')) && texts.find(t => t.value.includes("Email or phone"))) {

      agree = await findButton({ driver, text: 'Email or phone' });

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

    if (texts.find(t => t.value.includes('Welcome')) && texts.find(t => t.value.includes('I agree'))) {
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



main({ email: 'retafernandezpmqw9@ghatkhalihs.us', password: 'Phat3479', new_password: "Thaibinha3@123456", cookie: 'COMPASS=gmail_ps=CrMBAAlriVdt9D6Hi3BoVTiN1gnPJsKyrAYC7e2Dn3HcDCu0B1P_FFQbdXkMVTOmBDCZde8G5KR66ei6wMTKcH-42n8pF9t-EPhKhwuEKrudmLRyOOtDhWklVwGvYQL5OaNiEB9DRhd3FXlgwD1c7mD2Tlg10Pfmj-J_OezvOF0qKXkjXyfn_1ho1FkxE6-9AZO6t0SGQtFBuT2jS9Sd3IMNAdqBmYtjHZi0PngIkjhwe73-W4sQ3OnfyQYa6gEACWuJVyroi0lJ_8_gvk-ZCKWjFnFjNscBkCaUfZ6FOvR4__crkjfPzdz9BOOhdTRlj4DEqQFhNNbyh3-7s_1ZkkTxENe26dNaRS1FpN3OfWexeZsWmVkfYZn7QNk383BqWyb_If_M7UGDO0n3DkBDcUt1liLr9ra6rfndfmK2IWkMU535YnuKPuWnevJno33Y6VnQswEbbB8zgmZh1Y-96AegWE26wFH7t_0Kp8L5AfDmTAaRQLWWkxM4_HiN-FonlhtxjTV3w4hyx7T6h8kvh6kidsw9RnDnpyg-U5q99fyTTj9SjlkppjMwAQ:gmail=CsIBAAlriVeBt4CxsmM0p7pA2-0454Sj82XIvHyew4v4pMzg7uoovKxghuqCkojfatxJT32vsBkX4w7HGzH5TxXF5hSJFBdgLsq0AlxZtZZikJFU61zKn_zsQsoND6JU-zLoYpKnRtpAPmLfOOcGQiyPpgde5ml6WYXhZVn8IRlVNShM1v3O0xwc-mPBKo3IQ9ZsS1opsfjRyXimgqusbGeK5fEIj1eQIxCpt49g_ZukBdDyJJwruhE2mhsKT8iSVRfnKBUQp-ffyQYa-QEACWuJV2g-evkvr402JaIHD4j16uBCkl07l73j_lZb_sfX6SD6taJ24aci0VRsiWvPJmPhpDHj62b2HZrU1r6n8slCNRwq7bTxV2_licw-h9EzCl-Kcy29jpkfSdOsaW_L3gJlbvkCTVnCTPhPyDk7D4s3dzgAmmDtZYlR2j0uuW7lkglbl_DNWZGX6-1ZI0SZjDb_tqUnJ-lCM4Coyl_pxC2NuPK4vIhrogDfEPW7iM6Og6TNOdj55aM_WvvuE10Kfdv1DE78FdY0mv1Z9iEEHfSuDDCX0xpJajRwIrGDJtj2hs9WYBVLikXouGzOyrLBIvMU0glUIOwwAQ; SID=g.a0004QhAh-TdHam5kECejgfZaGdmNpsM1Zb7aNj5VmNW0B7-HefUPxMqwMXP75O4xNnh3xvKcgACgYKAVUSARUSFQHGX2MiDZ4VsS3iMwBwbAulwjiJRBoVAUF8yKpkvV6cz0H1XpbeyvDwQjbu0076; __Secure-1PSID=g.a0004QhAh-TdHam5kECejgfZaGdmNpsM1Zb7aNj5VmNW0B7-HefUv2S3ZpToZ1kbkGPnpJqFSAACgYKAYoSARUSFQHGX2MixefQgARhOyiWClP7JORyURoVAUF8yKrFOtZEaoXrQY9TW63xKVik0076; __Secure-3PSID=g.a0004QhAh-TdHam5kECejgfZaGdmNpsM1Zb7aNj5VmNW0B7-HefUKa_yuYUN7NJQ8icUT1YCVAACgYKATUSARUSFQHGX2MiTLEz1jMFLetHBmkprFcZSRoVAUF8yKrg4wkGJq6b3mq1j30Ci6NF0076; HSID=AKNoehP43aWpyty62; SSID=A8VD29TpfodxjFc0t; APISID=0rUlrpxV1wjbzAxn/ABAL4af6bo-wlOKrb; SAPISID=wyegJGxyKZbPAYQe/AO6njaFmicx2c7IOi; __Secure-1PAPISID=wyegJGxyKZbPAYQe/AO6njaFmicx2c7IOi; __Secure-3PAPISID=wyegJGxyKZbPAYQe/AO6njaFmicx2c7IOi; OSID=g.a0004QhAh1bQ_ZcPiSAX5mz-wcMJhsFB9fjj-wwhjDmw04gdfuVNlLop0tz1yoaZNZhH4wi58AACgYKAXoSARUSFQHGX2Miqy97qctq5tENqVWmSvHY1xoVAUF8yKomPG4rXDPR5Syhdvys5FDx0076; __Secure-OSID=g.a0004QhAh1bQ_ZcPiSAX5mz-wcMJhsFB9fjj-wwhjDmw04gdfuVNG2ltFlyicXaZJXQXzBT5CwACgYKAQgSARUSFQHGX2MiXJq-Oj1ltXt3265qjW78DRoVAUF8yKrFkWdgsgXsFbOufgRFovsP0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=527=Utshr6s7FTppz85NPG3J9QMoYvVl8-Mvx07rNKiU9r49L4328LzlYz7Z5y_TaONW4N3JEB7P2ysneSNWfbW-jKr10ggd7uuArSJzGkx0V3beh4nJGW5Dl2v7K941NZWXDvQNNEL9SE3wgeoRs94LvHC5wS3wNHnTvjKG0S-SSbsmhKvtqDbSHTu5UCjTG_zWuIgWXYycO8V4YRjEwigZZ0Dlq34U5ByYVKBQNE18K0HYb79qVaF3VSiU7Ejfy1GLVGv41NeXz8-cYj8mCLY; SIDCC=AKEyXzVyw_gWdqb60vLMWlTP66hBu2gQk9H5QWwSiMf6CQ8jLgeZJSBmcdtDGUb-GYUfnkh8; __Secure-1PSIDCC=AKEyXzX3-olpMbXvQ_SWTBA1yI0G_SfMZYUkp1-3BSCLYgKxHuD5aCtu0GFa_iqdY-khlqwJUQ; __Secure-3PSIDCC=AKEyXzV1B4nLXkhPQrsNfLL9XZZEfKzVNaXHvfQzhIhjX2eLP7-Uurm8AWVBSs2Uh5n7QMSE5w' });