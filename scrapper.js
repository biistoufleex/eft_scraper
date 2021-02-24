const puppeteer = require('puppeteer');

(async () => {
    const marketUrl = "https://tarkov-market.com/";
    const searchValue = process.argv[2];
 
    const browser = await puppeteer.launch({
        headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1600,
        height: 900,
        deviceScaleFactor: 1,
      });

    await page.goto(marketUrl, {waitUntil: 'networkidle2'});

    const searchInput = await page.$('input[placeholder="Search"]');
    const bidouille = await page.evaluate(() => document.querySelector('img.img').getAttribute('src').length);

    await searchInput.type(searchValue);
  
    try {
        await page.waitForFunction(function(arg){
            return document.querySelector('img.img').getAttribute('src').length !== arg
        }, { timeout : 2000 }, bidouille);
    } catch (error) {
        console.log(error);
    }

    const searchResult = Array();
    const objectName = await page.$$('.name');
    const objectPrice = await page.$$('.price-main');

    const traderPrice = await page.$$('.cell .alt');

    const titles = Array();
    const FleaPrices = Array();

    const traderPrices = Array();
    const traderNames = Array();

    for (const property in objectName) {
        titles.push(await page.evaluate(el => el.textContent, objectName[property]))
    }
    for (const property in objectPrice) {
        FleaPrices.push(await page.evaluate(el => el.textContent, objectPrice[property]))
    }
    for (const property in traderPrice) {
        itemPrice = await page.evaluate(el => el.textContent, traderPrice[property])
        priceWithoutBreak = itemPrice.replace(/(\r\n|\n|\r)/gm, "");
        priceWithoutSpace = priceWithoutBreak.replace(/\s/g, '');
        traderPrices.push(priceWithoutSpace);
    }
    for (const property in traderPrice) {
        traderNames.push(await page.evaluate(el => el.nextElementSibling.innerHTML, traderPrice[property]))
    }
    for (let i = 0; i < titles.length; i++) {
        searchResult.push({title: titles[i] , price: FleaPrices[i], trader: traderNames[i], traderPrice: traderPrices[i]})
    }
    console.log('result of research for: ' + searchValue);
    console.table(searchResult);

    // await page.waitForTimeout(5000);
    await browser.close();
})();