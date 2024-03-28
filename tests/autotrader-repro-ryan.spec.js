const { test, expect } = require("@playwright/test");

//////////////////////
////// HELPERS ///////
//////////////////////
async function openListingIPhone(page, vehicleNum) {
  // Open VDP Page
  console.log("Note: Opening VDP 🔄");
  await page.locator(`.list-item >> nth=${vehicleNum} >> .list-title`).click();

  // Allow page time to load
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(5000);

  // If ad pop-up, close it
  if (
    await page
      .locator(`[id="closeModal"], .modal-body .close-button`)
      .isVisible()
  ) {
    console.log("Note: Ad Detected ❌");
    await page.locator(`[id="closeModal"], .modal-body .close-button`).click();
    console.log(`Note: Ad closed ❎`);
  }

  // Expect VDP Gallery to be visible
  try {
    await expect(page.locator(`vdp-gallery`)).toBeVisible();
    console.log("Note: Successfully opened VDP 🟢");
  } catch {
    throw new Error("Note: Failed to open VDP 🔴");
  }
}
async function returnToSRPIPhone(page) {
  // Head back to SRP
  console.log("Note: Navigating to SRP 🔄");
  await page.locator(`#headerBackBtn`).click({ force: true });

  // Allow page time to load
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(5000);

  // If ad pop-up, close it
  if (
    await page
      .locator(`[id="closeModal"], .modal-body .close-button`)
      .isVisible()
  ) {
    console.log("Note: Ad Detected ❌");
    await page.locator(`[id="closeModal"], .modal-body .close-button`).click();
    console.log(`Note: Ad closed ❎`);
  }

  // Expect first listing to be visible
  try {
    await expect(page.locator(`.list-container`).first()).toBeVisible();
    console.log("Note: Successfully navigated back to SRP 🟢");
  } catch {
    throw new Error("Note: Failed to navigate back to SRP 🔴");
  }
}
function stringToNumber(device, lang, string) {
  if (device === "iphone") {
    if (lang === "fr") {
      if (string.length > 3) {
        string = string.split("");
        index = string.length - 4;
        string.splice(index, 1);
        string = string.join("");
        return parseInt(string);
      } else {
        return parseInt(string);
      }
    }
    if (lang === "en") {
      if (string.length > 3) {
        return (string = parseInt(string.split(",").join("")));
      } else {
        return parseInt(string);
      }
    }
  }

  if (device === "windows") {
    if (lang === "fr") {
      if (string.length > 3) {
        string = string.split("");
        index = string.length - 4;
        string.splice(index, 1);
        string = string.join("");
        return parseInt(string);
      } else {
        return parseInt(string);
      }
    }
    if (lang === "en") {
      if (string.length > 3) {
        return (string = parseInt(string.split(",").join("")));
      } else {
        return parseInt(string);
      }
    }
  }
}

test(`[English][IPhone-Safari] Filter vehicles by "Doors": 3`, async ({
  page,
  context,
  browser,
}) => {
  await page.goto("https://beta.autotrader.ca/");

  // Close Cookies
  try {
    await page.locator(`.close-button`).click();
  } catch {}

  // Select Make = Volkswagen
  await page.locator(`#rfMakes`).selectOption(`Volkswagen`);

  // Enter city/postal code for your desired search area = “T1X 0L3”
  const postalCode = "T2P 1J9";
  await page.locator(`[placeholder="Postal code*"]:visible`).fill(postalCode);

  // Click “Show me cars”
  await page.locator(`#SearchButton:visible`).click();

  // wait for vehicles to load
  await page.locator(".list-item .list-title").first().waitFor();

  // Store number of Vehicles
  let numVehicles = await page.locator("#sbCount").innerText();
  numVehicles = stringToNumber("iphone", "en", numVehicles);
  console.log(numVehicles);

  //--------------------------------
  // Act:
  //--------------------------------
  // Open Filters
  await page.locator(`#aFilterBtn`).click();

  // Select 'Doors'
  await page.locator(`#faceted-parent-NumberOfDoors`).scrollIntoViewIfNeeded();
  await page
    .locator(`#faceted-parent-NumberOfDoors [class*="fa-chevron-down"]`)
    .click();

  // Select '3'
  await page.locator(`[for*="do"]:has-text("3 Door")`).check();

  // Close 'Doors'
  await page
    .locator(`#faceted-parent-NumberOfDoors [class*="fa-chevron-down"]`)
    .click();

  // Click "View Results"
  await page.locator(`#aFilterBtn`).click();

  // wait for vehicles to load
  await page.waitForTimeout(10 * 1000);
  await page.locator(".list-item .list-title").first().waitFor();

  //--------------------------------
  // Assert:
  //--------------------------------
  // Assert that number of filtered for vehicles found is less than 'numVehicles'
  let num3Door = await page.locator("#sbCount").innerText();
  num3Door = stringToNumber("iphone", "en", num3Door);
  expect(num3Door).toBeLessThan(numVehicles);

  // Assert that the listings are all "3 Door"
  let vehicles = await page.locator(".list-item .list-title").count();
  console.log({ vehicles });
  if (vehicles === 0) {
    throw new Error("🔴 There are no filtered vehicles to assert");
  }

  let checked = 0;
  while (checked < vehicles && checked < 15) {
    // Open listing
    await openListingIPhone(page, checked);

    // Open Specifications Dropdown
    try {
      await page.locator(`#btn-vdp-specs-toggle`).click({ timeout: 5000 });
    } catch {}

    // Assert Doors
    await expect(
      page.locator(`.list-item:has-text("Doors") strong:has-text("3")`)
    ).toBeVisible();

    // Navigate back to SRP
    await returnToSRPIPhone(page);

    checked++;
  }
});

// test(`[English][IPhone-Safari] Filter vehicles by "Doors": 3 (((WITH ABORT DOUBLE CLICK ADS)))`, async ({ page, context, browser }) => {
//   // Abort double click ads
//   await context.route("**/*", async (route) => {
//     const url = route.request().url();
//     if (
//       url.startsWith("https://pubads.g.doubleclick.net") ||
//       url.startsWith("https://in.treasuredata.com") ||
//       url.startsWith("https://dynamic.criteo.net")
//     ) {
//       await route.abort();
//     } else {
//       await route.continue();
//     }
//   });

//   await page.goto("https://beta.autotrader.ca/");

//   // Close Cookies
//   try {
//     await page.locator(`.close-button`).click();
//   } catch {}

//   // Select Make = Volkswagen
//   await page.locator(`#rfMakes`).selectOption(`Volkswagen`);

//   // Enter city/postal code for your desired search area = “T1X 0L3”
//   const postalCode = "T2P 1J9"
//   await page.locator(`[placeholder="Postal code*"]:visible`).fill(postalCode);

//   // Click “Show me cars”
//   await page.locator(`#SearchButton:visible`).click();

//   // wait for vehicles to load
//   await page.locator(".list-item .list-title").first().waitFor();

//   // Store number of Vehicles
//   let numVehicles = await page.locator('.result-count:visible').innerText()
//   numVehicles = stringToNumber('iphone', 'en', numVehicles)
//   console.log(numVehicles)

//   //--------------------------------
//   // Act:
//   //--------------------------------
//   // Open Filters
//   await page.locator(`#aFilterBtn`).click();

//   // Select 'Doors'
//   await page.locator(`#faceted-parent-NumberOfDoors`).scrollIntoViewIfNeeded();
//   await page.locator(`#faceted-parent-NumberOfDoors [class*="fa-chevron-down"]`).click();

//   // Select '3'
//   await page.locator(`[for*="do"]:has-text("3 Door")`).check();

//   // Close 'Doors'
//   await page.locator(`#faceted-parent-NumberOfDoors [class*="fa-chevron-down"]`).click();

//   // Click "View Results"
//   await page.locator(`#aFilterBtn`).click();

//   // wait for vehicles to load
//   await page.waitForTimeout(10 * 1000)
//   await page.locator(".list-item .list-title").first().waitFor();

//   //--------------------------------
//   // Assert:
//   //--------------------------------
//   // Assert that number of filtered for vehicles found is less than 'numVehicles'
//   let num3Door = await page.locator('#sbCount').innerText()
//   num3Door = stringToNumber('iphone', 'en', num3Door)
//   expect(num3Door).toBeLessThan(numVehicles);

//   // Assert that the listings are all "3 Door"
//   let vehicles = await page.locator(".list-item .list-title").count();
//   console.log({vehicles})
//   if (vehicles === 0) {
//     throw new Error("🔴 There are no filtered vehicles to assert")
//   }

//   let checked = 0;
//   while (checked < vehicles && checked < 15) {
//     // Open listing
//     await openListingIPhone(page, checked)

//     // Open Specifications Dropdown
//     try {
//       await page.locator(`#btn-vdp-specs-toggle`).click({timeout: 5000});
//     } catch {}

//     // Assert Doors
//     await expect(page.locator(`.list-item:has-text("Doors") strong:has-text("3")`)).toBeVisible();

//     // Navigate back to SRP
//     await returnToSRPIPhone(page);

//     checked++;
//   }

// });
