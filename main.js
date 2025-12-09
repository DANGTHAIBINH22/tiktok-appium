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
    if(texts.indexOf(t => t.value.includes('Couldn’t sign you in'))){
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



main({ email: 'melanieerickson2qemi@ghatkhalihs.us', password: 'Phat3479', new_password: "Thaibinha3@123456", cookie: 'COMPASS=gmail_ps=CrMBAAlriVc6iQD0xiZwFfsNtLk0pU7o1_YkZauuf4fjEmHYE1_sa3Z5z_xfTpCbPoIe0xXCywLbeis5ny_ORzidrsKP1Vk9gFEiFIS_XQpVdDR9LbYMHT-_BUAtNKzO3x91783G1SjwUmg36Dxxo-eWIbLhT5JoSDxo9Ei4GPCm4712UJVVmIvh0kysGNEsttcOaH0EPH5GiIDxoBCiazYt4Ca4dAxgksHtkVqn87g9azgUpdkQuOnfyQYa6gEACWuJV0GKZqVasCwooLeWXq66JHD8HcBQ_BuMQ_u17utTtRXDILpLDS2QsFk0SLboqzgXOasAYD6uzBPNzcvpzDM0KZiynIzHyngmcRraI9DkYYbw9dGMTvWSvCv1FDxldvV-Wy_WvhqTGPWclRKpU3zKEDV5eqk5yKHSbjtOIYjiJ6YzMPPjHK4_Ye9QcOg_yz1-aQ21IWk0DTCkYPLnrXSVlc1lWtMDqgEvqsHg3lNqZxnOuEUkPILbj9QqAY2mIVf8i-W-knFspjeuaSdKqqpfJRJUzbn0TpGIqpEN0yw4dn6wZgZfqpwwAQ:gmail=CsIBAAlriVeBAVvf4zz06K3E7Hr1xi9aYO-89yuTSuP8-FmsxGpC8K9DiQxhgqiFOTvgdLP1MFf6z0fyBTHzc61awvTpufZK-7D2peAS3fllrVOR61MpYAsNieCjXcSa0pWKHevQtcTYAd_ekujEAaarB9i68DkLaTaJM7QRgCua2AEmkVmUY6DwAbhZRMXJtrv8E-arBm97Uu1va7TU5kgcfSk9R8T8ygBjgz3uptiELjY8Kfq3HWtoUd11Fo5ldhLSq7IQyN_fyQYa-QEACWuJV2XxdVE4PZ-sUsCN0P_svqL68HssmUsTLEB8vAMNlwDIa3Ij609KWpa8xFDWTWA28ST-L9nazAkvdXoo7Gf-HZn_cI2zOjKPPmEsx6XysP0zg7EnOpvlqkmc4m_jnoe4w944ZZvvRQAsRMP3x1jtHKstTCxRzjVPbv9XowcAh0APAACetcJWTxy6h9mCb8yP-0PiA8giHP7vlBnXzs2GrcNmsECpqBUkV0tGrpSEQWXa-d4yTinekxw9UX3Kd1kyxr2uMYoFIOqcbePFIaLrdqOGRxiYp4PLg3ghpx-nO-Mk13LnOOODtypEYIZ6SuVF_UnzcZcwAQ; SID=g.a0004QjUHd4oFgU5pXUm8KiPPOc6jnK-v2wJRjZdUd0aiAW_5KWogv0-qUrbL8ZELGAlpw1xnwACgYKAcYSARcSFQHGX2MifgMbwG5HXr9FZwMwavad7BoVAUF8yKplxGqKbIgWaYTH2uWX8w3G0076; __Secure-1PSID=g.a0004QjUHd4oFgU5pXUm8KiPPOc6jnK-v2wJRjZdUd0aiAW_5KWo8frWf7ma4HPeX9dy33hvHwACgYKAU8SARcSFQHGX2Mil2G_EDYwRWarkKHTuxJKdRoVAUF8yKpLFg3WOSQDiY0zGU2fFaXl0076; __Secure-3PSID=g.a0004QjUHd4oFgU5pXUm8KiPPOc6jnK-v2wJRjZdUd0aiAW_5KWoeEcaO_nVocUHFYLQehIgwgACgYKAWkSARcSFQHGX2MiVkbb1NNoePrdo0DH1yjfxxoVAUF8yKr1Vd7gFgvCpNCtvOx23Mx10076; HSID=ATlD1tqzYNy9t9tsw; SSID=AfspSDy8hYQZHh9O1; APISID=QqJNiqXmbJcKq4pl/ALHAjBi3lsBkhCy2n; SAPISID=t323Ie-1FCFK2Vzr/APon7AAR16L9HFMTd; __Secure-1PAPISID=t323Ie-1FCFK2Vzr/APon7AAR16L9HFMTd; __Secure-3PAPISID=t323Ie-1FCFK2Vzr/APon7AAR16L9HFMTd; OSID=g.a0004QjUHVejkT3TdKzuopxsk-B3uFZwwhjxPEO_EYXNyYytDqEPqUAdipzxiw5x3vljR3_vhAACgYKAVASARcSFQHGX2Mi_BcmvyzVEVhQnWGgfrqHshoVAUF8yKqb1fuIhs1vyZFHPzzze5g10076; __Secure-OSID=g.a0004QjUHVejkT3TdKzuopxsk-B3uFZwwhjxPEO_EYXNyYytDqEPfoeQVrDXJougMN5baiin0QACgYKAfYSARcSFQHGX2MiqYA-vCkbAGqOJhU9D3-fkxoVAUF8yKppOzLbatiWEfJ8mmYsRoqb0076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=527=pjOxH-sqltycueZsit6PEypZSnJxvwUOF3gk63qSmenEfj_3UM2pq5a6FEzUGFNb_t2ZLKhdNs5anMoVE3gCgYOObVL1G6ODZbCDd8gKm20_MI8wHvTEf6tKqQW-DTS_qED-KtHylowq7cesG_xEj_81WqEN4TDzG9afCS6H9jsPFtAMWtYUUnz5X_U5D0sNB_c5OAQVLt_4Ek_bwonxhdrQyfjKPW4Bb7erUaKWdZd3zSFwDuU_AMZ08E3zyHgzr4dcnTcC_ntmgKm-Ji0; SIDCC=AKEyXzVsDZnqdDUsQZKmTf293aRrWR9kVe_1-sx7yMKdmKpDYjyK8Guv7X6S4g6Y6mrL5cGH; __Secure-1PSIDCC=AKEyXzUikuxg5PGo6sVjbu_vj-6mJzsikAr5D9qvXoVcpg9LVg0lrAtnLojd572x2X1pgwlm; __Secure-3PSIDCC=AKEyXzVD_DDmpJRQd6o0PMPWcd1eb5mb2t2gnuyqacYGqjrdqICaRHdecO1QMMujQUwNO0N2Hw' });