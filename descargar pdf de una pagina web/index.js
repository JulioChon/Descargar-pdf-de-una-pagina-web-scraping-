const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const url = 'link de la pagina web';  
    await page.goto(url);
 // elemento a clickear
    // await page.waitForSelector('', { timeout: 5000 });
    // const decadeElements = await page.$$('');
    // for (const element of decadeElements) {
    //     await element.click();
    // }


    // const yearElements = await page.$$('');
    // for (const element of yearElements) {
    //     await element.click();
    // }


    // const monthElements = await page.$$('.');
    // for (const element of monthElements) {
    //     await element.click();
    // }

    await page.waitForTimeout(2000);


    await page.waitForSelector('a[href$=".pdf"], a[href$=".PDF"]');

    const pdfLinks = await page.$$eval('a[href]', links => 
        links
            .map(link => link.href)
            .filter(href => /\.pdf$/i.test(href))
    );



    for (let i = 0; i < pdfLinks.length; i++) {
        const pdfUrl = pdfLinks[i];
       

        try {
            const response = await axios.get(pdfUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',                 
                }
            });

            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/pdf')) {
                const regex = /3215\/(\d{4}-\d{2}-\d{2})/;
                const match = pdfUrl.match(regex);
                if (match) {
                    const date = match[1];
                    const pdfName = `${date}.pdf`;
                    const pdfPath = path.resolve(__dirname, pdfName);
                    fs.writeFileSync(pdfPath, response.data);
                }


                

            } else {
                console.log(`Error: No se pudo descargar el PDF desde ${pdfUrl}. Tipo de contenido: ${contentType}`);
            }
        } catch (error) {
            console.error(`Error al descargar el PDF desde ${pdfUrl}:`, error.message);
        }
    }

    await browser.close();
})();