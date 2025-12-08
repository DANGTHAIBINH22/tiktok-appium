import { remote } from 'webdriverio';

async function main() {
  const caps = {
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554', // đổi theo tên adb devices
    'appium:platformVersion': '16',        // Android version
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.zhiliaoapp.musically',
    'appium:appActivity': 'com.ss.android.ugc.aweme.splash.SplashActivity',
    'appium:noReset': false,                // không reset app
    'appium:newCommandTimeout': 300
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
  let continueBtn = await findButton({ driver, text: 'Continue' });
  await driver.pause(3000);

  let agree = await findButton({ driver, text: 'Agree and continue' });
  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Allow' });
  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Skip' });

  await driver.pause(5000);
  await swipe(driver, 600, 1700, 600, 400); // Vuốt lên
  await driver.pause(5000);

  // await swipe(driver, 600, 400, 600, 1700); // Vuốt xuống
  agree = await findButton({ driver, text: 'Profile' });
  await driver.pause(3000);
  await findButton({ driver, text: '', xpath:'//android.widget.ImageView[@content-desc="Lock"]'});
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
  await driver.sendKeys(Array.from('Thaibinha3@123456'));

  await driver.pause(5000);

  agree = await findButton({ driver, text: 'Continue' });
  let source = await driver.getPageSource();
  console.log(source);
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
async function swipe(driver, x1, y1, x2, y2, duration = 800) {
  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: x1, y: y1 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', duration: duration, x: x2, y: y2 },
        { type: 'pointerUp', button: 0 }
      ]
    }
  ]);
  await driver.releaseActions();
}
async function findButton({ driver, text, index = 0, xpath, isClick = true }) {
  // Các selector có thể chứa nút theo text
  let selectors = [
    `//*[@text="${text}"]`,
    `//android.widget.Button[@text="${text}"]`,
    `//android.widget.TextView[@text="${text}"]`,
    `//android.widget.FrameLayout[@content-desc="${text}"]`,
  ];
  if (xpath) {
    selectors = [xpath];
  }

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
    console.warn(`⚠️ Không tìm thấy nút có text="${text}"`);
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


// async function findButton({driver, text}) {

//      // Danh sách các khả năng tên của nút "Hồ sơ"
//   // Broaden selectors so we can catch system dialogs (e.g., Android permission "Allow" button)
//   const selectors = [
//     `//*[@text="${text}"]`,
//     `//android.widget.Button[@text="${text}"]`,
//     `//android.widget.TextView[@text="${text}"]`,
//     `//android.widget.FrameLayout[@content-desc="${text}"]`,
//     // // Common resource-ids for Android permission allow buttons (try both older and newer installers)
//     // '//*[@resource-id="com.android.packageinstaller:id/permission_allow_button"]',
//     // '//*[@resource-id="com.android.permissioncontroller:id/permission_allow_button"]'
//   ];

//   let found = null;

//   for (const selector of selectors) {
//     try {
//       // Use $$ to get all matching elements (if any) and test each one
//       const elems = await driver.$$(selector);
//       if (elems.length === 0) continue;

//       for (const el of elems) {
//         try {
//           // isDisplayed may throw if element is stale; guard with try/catch
//           if (await el.isDisplayed()) {
//             console.log(`✅ Found button using selector: ${selector}`);
//             await el.click();
//             console.log(`✅ Clicked button with text="${text}"`);
//             found = el;
//             break;
//           }
//         } catch (innerErr) {
//           // ignore this element and try the next
//         }
//       }

//       if (found) break;
//     } catch (err) {
//       // ignore selector errors and continue to next selector
//     }
//   }

//   return found;
// }
// Debug helper: inspect elements matching a selector or a text value
async function debugInspect(driver, selectorOrText, options = {}) {
  // options: { byText: true|false, savePageSource: true|false, filename: 'page_source.xml' }
  const byText = options.byText !== false; // default true
  const selector = byText ? `//*[@text="${selectorOrText}"]` : selectorOrText;

  console.log(`🔎 Inspecting selector: ${selector}`);
  let elems = [];
  try {
    elems = await driver.$$(selector);
  } catch (err) {
    console.error('Error while querying selector:', err && err.message ? err.message : err);
    return [];
  }

  console.log(`🔢 Found ${elems.length} matches`);

  for (let i = 0; i < elems.length; i++) {
    const el = elems[i];
    const info = {};
    try { info.resourceId = await el.getAttribute('resourceId'); } catch (e) { }
    try { info.contentDesc = await el.getAttribute('contentDescription'); } catch (e) { }
    try { info.text = await el.getText(); } catch (e) { }
    try { info.class = await el.getAttribute('className'); } catch (e) { }
    try { info.enabled = await el.getAttribute('enabled'); } catch (e) { }
    try { info.displayed = await el.isDisplayed(); } catch (e) { }
    try { info.rect = await el.getRect(); } catch (e) { }

    console.log(`--- element[${i}] ---`);
    console.log(info);
  }

  if (options.savePageSource) {
    try {
      const src = await driver.getPageSource();
      const fs = await import('fs');
      const filename = options.filename || 'page_source.xml';
      await fs.promises.writeFile(filename, src, 'utf8');
      console.log(`💾 Page source saved to ${filename}`);
    } catch (e) {
      console.error('Failed to save page source:', e && e.message ? e.message : e);
    }
  }

  return elems;
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
main();