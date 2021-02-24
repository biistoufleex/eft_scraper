const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

client.on("ready", function () {
    console.log("Mon BOT est Connecté");
})

client.on('message', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(' ');
    const searchValue = args.shift().toLowerCase();

    const marketUrl = "https://tarkov-market.com/";
 
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
    const bidouille = await page.evaluate( () => document.querySelector('.name').textContent.length).catch((e) => console.log(e));

    await searchInput.type(searchValue);

    try {
        await page.waitForFunction(function(arg){
            return document.querySelector('img.img').getAttribute('src').length !== arg
        }, { timeout : 1000 }, bidouille);
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
    // console.log('result of research for: ' + searchValue);
    // console.table(searchResult);
    let sender = '';

    for (let i = 0; i < 10; i++) {
        sender += "***"+ searchResult[i].title+"*** \n" + 
            " ***flea : ***" + searchResult[i].price + " \n" +
            "***"+searchResult[i].trader+"***" + " :" + searchResult[i].traderPrice + " \n" +
            "__                                                 __ \n";            
    }

    if (sender.length >= 1) {
        message.channel.send(sender);
    } else {
        message.channel.send("j'ai rien trouver whalla");
    }
    await browser.close();
});

client.login(token);

// droit du bot https://discord.com/api/oauth2/authorize?client_id=807584503186063381&permissions=271969360&scope=bot