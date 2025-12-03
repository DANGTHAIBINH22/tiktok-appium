import { remote } from 'webdriverio';

const caps = {
  platformName: "Android",
  "appium:deviceName": "emulator-5554",
  "appium:appPackage": "com.zhiliaoapp.musically",
  "appium:appActivity": "com.ss.android.ugc.aweme.main.MainActivity",
  "appium:automationName": "UiAutomator2",
  "appium:noReset": true,
};

async function run() {
  const driver = await remote({
    path: "/wd/hub",
    port: 4723,
    capabilities: caps,
  });

  console.log("✅ Đã mở TikTok thành công");

  await driver.pause(5000);

  // Ví dụ: tap vào Profile (tạm thời click theo vị trí)
  await driver.touchPerform([{ action: 'tap', options: { x: 950, y: 2100 } }]);

  await driver.pause(3000);
  await driver.deleteSession();
}

run().catch(console.error);
