const BASE_EPIC_URL = 'https://www.epicgames.com/account/v2/payment/ajaxGetOrderHistory?sortDir=DESC&sortBy=DATE&locale=fr'
const BASE_GOG_URL = 'https://www.gog.com/en/account'

let scrapBtnEpic = document.getElementById('scrapBtnEpic');
let scrapBtnGOG = document.getElementById('scrapBtnGOG');

let copyBtn = document.getElementById('copyBtn');
let gamesBlock = document.getElementById('gamesBlock');
let gamesList = document.getElementById('gamesList');
let errorBlock = document.getElementById('error')

let copyText = () => {
    gamesList.select();
    gamesList.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(gamesList.value);
};

let allGames = [];

let scrapEpic = (url) => {
    scrapBtnEpic.disabled = true;
    scrapBtnGOG.disabled = true;
    gamesList.value = '';
    scrapBtnEpic.setAttribute('aria-busy', 'true');
    scrapBtnEpic.textContent = 'Scrapping...';

    fetch(url)
        .then(r => r.text())
        .then(text => {
            let data = JSON.parse(text);

            if (data.orders.map(a => a.items).lenght > 1) {
                console.log('Something is odd...');
                console.log(data.orders.map(a => a.items));
            }

            let games = data.orders.map(a => a.items).map(g => g[0]).map(g => g.description);
            allGames = allGames.concat(games);

            if (data.nextPageToken) {
                scrapEpic(BASE_EPIC_URL + '&nextPageToken=' + data.nextPageToken);
            } else {

                scrapBtnEpic.disabled = false;
                scrapBtnGOG.disabled = false;

                scrapBtnEpic.setAttribute('aria-busy', 'false')
                scrapBtnEpic.textContent = 'Get Epic Games';

                gamesBlock.style.display = 'block';
                allGames.forEach(g => {
                    gamesList.value += g + '\r\n';
                })
            }
        }).catch((error) => {
            errorBlock.style.display = 'block';
            errorBlock.innerText = error;
            scrapBtnEpic.disabled = false;
            scrapBtnEpic.setAttribute('aria-busy', 'false')
            scrapBtnEpic.textContent = 'Get Epic Games';
        });
};

let scrapGOG = (url) => {
    allGames = [];
    scrapBtnEpic.disabled = true;
    scrapBtnGOG.disabled = true;
    gamesList.value = '';

    scrapBtnGOG.setAttribute('aria-busy', 'true');
    scrapBtnGOG.textContent = 'Scrapping...';

    fetch(url)
        .then(r => r.text())
        .then(text => {

            // Parsing JS script from HTML text
            let textGames = text.substring(
                text.indexOf('"accountProducts":') + 18,
                text.lastIndexOf('"updatedProductsCount"') - 1
            )
            let games = JSON.parse(textGames);
            allGames = games.map(g => g.title);

            scrapBtnGOG.disabled = false;
            scrapBtnEpic.disabled = false;

            scrapBtnGOG.setAttribute('aria-busy', 'false')
            scrapBtnGOG.textContent = 'Get GOG Games';

            gamesBlock.style.display = 'block';
            allGames.forEach(g => {
                gamesList.value += g + '\r\n';
            })
        }).catch((error) => {
            errorBlock.style.display = 'block';
            errorBlock.innerText = error;
            scrapBtnGOG.disabled = false;
            scrapBtnGOG.setAttribute('aria-busy', 'false')
            scrapBtnGOG.textContent = 'Get GOG Games';
        });
};

document.getElementById('scrapBtnEpic').addEventListener('click', () => { scrapEpic(BASE_EPIC_URL) }, false);
document.getElementById('scrapBtnGOG').addEventListener('click', () => { scrapGOG(BASE_GOG_URL) }, false);
document.getElementById('copyBtn').addEventListener('click', copyText);
