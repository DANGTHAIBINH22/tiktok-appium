import { remote } from 'webdriverio';
import { getEmailTempIOExist, getMessageTempIO, getTiktokCodeTempIO, getCodeTiktok} from "./helper.js"
async function init({ driver }) {
  let agree;
  let continueBtn = await findButton({ driver, text: 'Continue' });
  await driver.pause(3000);

  agree = await findButton({ driver, text: 'Agree and continue' });
  await driver.pause(5000);

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

  await driver.pause(3000);
  let agree = await findButton({ driver, text: 'Profile' });
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

  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Password' });
  await driver.pause(3000);

  agree = await findButton({ driver, text: 'Password', index: 1 });
  await driver.pause(7000);
  await driver.sendKeys(Array.from(password));

  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Continue' });

  await driver.pause(5000);
  let [ temp, domain ] =  email.split("@");
  let email_hint = temp[0]+ "***"+temp[temp.length - 1] + "@" + domain;
  let  is_code = await findButton({ driver, text: email_hint});

  
  if (is_code) {
    await driver.pause(5000);
    agree = await findButton({ driver, text: 'Next' });
    await driver.pause(5000);
    let code = await getCodeTiktok({ cookie });
    console.log("Mã tiktok nhận được: ", code);
    await driver.pause(3000);
    await driver.sendKeys(Array.from(code));
  }

}
async function handleChangeEmail({ driver, email, password }) {



  await driver.pause(5000);
  let agree
  agree = await findButton({ driver, text: 'Account information' });
  await driver.pause(3000);

  agree = await findButton({ driver, text: 'Email' });

  await driver.pause(5000);
  agree = await findButton({ driver, text: 'Change email' });
  await driver.pause(5000);
  agree = await findButton({ driver, text: 'Password' });
  await driver.pause(5000);


  agree = await findButton({ driver, text: 'Next' });
  await driver.pause(7000);

  agree = await findButton({ driver, text: 'Enter password' });
  await driver.pause(5000);

  await driver.sendKeys(Array.from(password));
  await driver.pause(5000);
  agree = await findButton({ driver, text: 'Next' });
  await driver.pause(8000);

  agree = await findButton({ driver, text: 'Enter email' });

  await driver.pause(5000);
  await driver.sendKeys(Array.from(email));
  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Continue' });
  let { email: newEmail, token } = await getEmailTempIOExist(email);
  let code = await getTiktokCodeTempIO({ email: newEmail, token });
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
  await init({ driver });
  await driver.pause(5000);
  await handleChangePassword({ driver, password: 'Thaibinha3@12345', cookie, email });
  await driver.pause(5000);
  console.log("✅ Password changed successfully");

  await handleChangeEmail({ driver, email: newEmail, password: 'Thaibinha3@12345', cookie });
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



main({ email: 'laciemcleane8854@mygkhs.us', password: 'Phat3479', newEmail: 'bmny5ypoc9@mkzaso.com', cookie: 'COMPASS=gmail_ps=Cp4BAAlriVdYOAkWITYoBW7zeiVP7GtgI_TFPweq7HzMh0QWB1NoWgGEx_k9iHbHrs7rrX4sqr8ho-IjwGf0YRlM9eCIJ2CY45sGMcY8ZpfweL8CWLaU5BhZPYL_lHo-09p2zazg8xXxcirBM24gjt6-huZLiseKxQRshdPOmCBLwy7W69TbDlRSybIz7yeTK4M-TaCaTBRxSpXxv9-ClzMQ4NfEyQYa1QEACWuJVzkJ4LRnLVutoBl2ZZDIpXILtoQnmO3jOQ9rmLG5EqBLtEwP0xq9twrI0ektmmvRV9EXVoQphOXONqxQrE-Aiyicd5h4fshBqH-sM8tJo20gaTugnxIFgrsJOxrcDVmLl-H0iiBq_eUOxYlUKiYisETGt-NK-l8TFd_ldCqyA-3nE9zETXRjXMWH_yd6SK9l4lHm1TagW9zw2gsjyayPioaPorIzMFUkkomSHplBSNSTt3ar0VbVAWMtqt6H0sFK9udzAhGebsO8X543HLCi-gYwAQ:gmail=CsIBAAlriVd0cY-MRB4WJdCI778gHRMQsun-8gi3WybOFGpLQSeHhi9tG2VSset7RNYWAIm_jj-azPCPwIRPyTUtrP9r25zCtl73CyZj7eb4q_c0a3hSZbKoQ22MselfaqvADEdffQA3C54IZJBtYpkvNLZUdsGf_k5l51TF71mvsk7EXQEQfEDg6n8USQkNGfpuFK39TEmblfE3r_iFN19wZNqqSwFbEa15c5obpDt1t4h6gQhxU44Ka_yov2o2VQ4M-8MQst_EyQYa-QEACWuJV-6JATYPW4K-cwW3APMd6u8JUKYKgqmhBorKps4wURNMpADFfiTjPjW814xGcIBk-iR5BnxrA9N7H0IMf60J33-aoVX128a9v0U7f1Pp9Gj-1c9zOcBoYYqFvsxvPflZ8JPow_GAlXQwhDhEtkg-D2MfzKWUE_mP7Vxlh9QExZXhIf2zy9gz1jH-RiSzEIrV8PTrO3iYqKk4_69C2tPLm_Bunm4rZOSFjVzl36jERhROHNkqHnaPWBFA0tLO5KCiAYoBy13iyTOCnk09V6hxSqYPs4c086k3KO4nkKOSikdcejDOuZEUmWTjYvRvuuLujVlo1QEwAQ; SID=g.a0004AjGA5CyhYPtLcP2yVFdFlB1CThx01hIIqhlMEDKUvQFD4mfALLsr49UZ_08eu2FlvwAcAACgYKAdsSARESFQHGX2Mip1_-Tj_nktSIltC0sUZ82RoVAUF8yKp95rbxT-fqL0qicT0_O0eM0076; __Secure-1PSID=g.a0004AjGA5CyhYPtLcP2yVFdFlB1CThx01hIIqhlMEDKUvQFD4mfAA6FpcA07d-ZEwL5oxI7-wACgYKAZsSARESFQHGX2MiC-dL9UGlnTKZCgz4EVMjMxoVAUF8yKoLs2XAAhODE_cOsNirbBX60076; __Secure-3PSID=g.a0004AjGA5CyhYPtLcP2yVFdFlB1CThx01hIIqhlMEDKUvQFD4mfRB9oeUFkMFuSEF9sHqBhcQACgYKAcUSARESFQHGX2Mivv7ju_ZhqPdABH7_GomCuhoVAUF8yKr4nMH_SfSSYdOmwaV4MLes0076; HSID=A-E2pVFUSYEswE-Nf; SSID=A6FYdSQKtmbo0_CI1; APISID=PJDzo-oFhQ2Sgrmn/Awxc4_RaxymjeL1Ia; SAPISID=x1wpy2bopP3yvqJV/ApfweVOPVc8iTtKyD; __Secure-1PAPISID=x1wpy2bopP3yvqJV/ApfweVOPVc8iTtKyD; __Secure-3PAPISID=x1wpy2bopP3yvqJV/ApfweVOPVc8iTtKyD; OSID=g.a0004AjGAyJ0islxznNB7AdMdqDP1ym7oVhuYScUa_Slv3ss5FYVhYjV53QP1PQPItngL_ZVfAACgYKAR4SARESFQHGX2MiAG9kqHfXzosGoUQG2FmD8RoVAUF8yKr0q-7_r9SF_VuRXXRuEPm60076; __Secure-OSID=g.a0004AjGAyJ0islxznNB7AdMdqDP1ym7oVhuYScUa_Slv3ss5FYVPCYapOkTbRCt8WubChjQCQACgYKAU4SARESFQHGX2MiwDuMUS0GXZmGfICywsrYExoVAUF8yKoHONvBdeEsF55V0MccKKV30076; __Host-GMAIL_SCH_GMN=1; __Host-GMAIL_SCH_GMS=1; __Host-GMAIL_SCH_GML=1; NID=526=D8RZvDDC-8eFuGaDISATg02WgBoReqv5oAyuJE1b5zf0x7FScOxIKB8cHTYWEU78L9kpR3_MwQpEzZzkZBeAuVEPybLiHuX-IxdTSX--D6u42U5B_cz67CULsRTCjvKCXVf_z6CbmfuD_McO-r6CTfB28AUgI2un57N7xTarTAKz72p1NVSHz-WFXLgVZvckRpgeJczJy_30oFoWsgh35tquifsOxfYdt2p_QnSoznWNoUVZjJIMHd-NXSmkQP7fmAt7CH_MPMLYHq3WBC0VMbP3lZ6JJnfVzmc9eUM6aNEjuu47RbFrgh-fuMa3DNqkzH-F8MR7pSUk-0Pi6it5gMguf_LgYGj1f7LzGhgEvPuNN88nQs6_YHaIvOR5-Dp1T6DfFbkeGvfphNfAz2-iaSZoYnv78UemEqTD5K41Qdk7aGK8uAx_NNGiVVdViNj9mSbsWWooVunYIsbvf-SCGdFHFvcBfmY360Lnzgd0xgH98kIaER_OmE6Qb_QdRAjf8uXOLGYFjx_y4KQ8yRMCn4uh1BaCr3kPQjtX28Q6FbSmndI1wdfMIJog32TBGXa03vaKBh8Vzjm6dpbkzZ3N52ytB3jDSQalPn-wwhglJNS6tyULldr_h1SJYbKebeWsHgG0USH7JC3ktNLW_Es7kmWt4oU; SIDCC=AKEyXzXUUo3oktPE5AeaaR7c9fWSa3eDc4Hq7OByhgjjPTxx6z-MITtdPRwnK7CMwccAsolDjw; __Secure-1PSIDCC=AKEyXzUeRWd4DGodtnAy0BBWTfHrgo52imhbjvyhMQIt8hHrhTi3uu32cmAPQIpISlztC_tB; __Secure-3PSIDCC=AKEyXzWxFAPEjkmIQZ9iZgZZgSIzHT9cvz9S0zHlCci_CZmole0_eRPnDu_UTU2T1H7q9o05' });