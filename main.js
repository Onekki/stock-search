const apiGet = (endpoint) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = 'http://stocksearchserver-env.eba-rkb3aabs.us-east-2.elasticbeanstalk.com/api/' + endpoint;
        xhr.open('GET', url, true);
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            console.log(endpoint, data);
            if (data.error) {
                reject(data.error);
            }
            resolve(data);
        };
        xhr.send();
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const searchSubmit = document.getElementById('searchSubmit');
    const search = document.getElementById('search');
    const clear = document.getElementById('clear');
    const error = document.getElementById('error');
    const tabs = document.getElementById('tabs');

    const logo = document.getElementById('logo');
    const company = document.getElementById('company');

    const stock = document.getElementById('stock');
    const strongSell = document.getElementById('strongSell');
    const sell = document.getElementById('sell');
    const hold = document.getElementById('hold');
    const buy = document.getElementById('buy');
    const strongBuy = document.getElementById('strongBuy');

    const news = document.getElementById('news');

    searchSubmit.addEventListener('click', () => {
        tabs.style.display = 'none';
        error.style.display = 'none';

        apiGet('company?symbol=' + search.value).then(data => {
            tabs.style.display = 'flex';
            logo.src = data.logo;
            company.rows[0].cells[1].innerText = data.name;
            company.rows[1].cells[1].innerText = data.ticker;
            company.rows[2].cells[1].innerText = data.exchange;
            company.rows[3].cells[1].innerText = data.ipo;
            company.rows[4].cells[1].innerText = data.category;
        }).catch(() => {
            error.style.display = 'flex';
        });

        apiGet('stock?symbol=' + search.value).then(data => {
            stock.rows[0].cells[1].innerText = data.ticker;
            stock.rows[1].cells[1].innerText = data.ts;
            stock.rows[2].cells[1].innerText = data.pc;
            stock.rows[3].cells[1].innerText = data.o;
            stock.rows[4].cells[1].innerText = data.h;
            stock.rows[5].cells[1].innerText = data.l;
            if (data.d > 0) {
                stock.rows[6].cells[1].innerHTML = `
                    ${data.d}<img src="./images/GreenArrowUp.png">
                `;
            } else {
                stock.rows[6].cells[1].innerHTML = `
                    ${data.d}<img src="./images/RedArrowDown.png">
                `;
            }
            if (data.dp > 0) {
                stock.rows[7].cells[1].innerHTML = `
                    ${data.dp}<img src="./images/GreenArrowUp.png">
                `;
            } else {
                stock.rows[7].cells[1].innerHTML = `
                    ${data.dp}<img src="./images/RedArrowDown.png">
                `;
            }
        });

        apiGet('recommendation?symbol=' + search.value).then(data => {
            strongSell.innerText = data.strongSell;
            sell.innerText = data.sell;
            hold.innerText = data.hold;
            buy.innerText = data.buy;
            strongBuy.innerText = data.strongBuy;
        });

        apiGet('charts?symbol=' + search.value).then(data => {
            Highcharts.stockChart('charts', {
                plotOptions: {
                    series: {
                        pointWidth: 5
                    }
                },
                rangeSelector: { 
                    buttons: [{
                        type: 'day',
                        count: 7,
                        text: '7d'
                    },{
                        type: 'day',
                        count: 15,
                        text: '15d'
                    },{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    },{
                        type: 'month',
                        count: 3,
                        text: '3m'
                    },{
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }],
                    selected: 2,
                    inputEnabled: false,
                },
                title: { 
                    text: `Stock Price ${data.ticker} ${data.date}` 
                },
                subtitle: {
                    useHtml: true,
                    text: `<a style="color: blue;text-decoration: underline;" href="https://polygon.io/" target="_blank">Source: Polygon.io</a>`
                },
                yAxis: [{
                    title: { text: 'Stock Price' },
                    opposite: false
                }, {
                    title: { text: 'Volume' },
                    opposite: true
                }],
                series: [{
                    name: 'Stock Price',
                    data: data.data.map(e => [e.t, e.c]),
                    type: 'area',
                    threshold: null,
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }, {
                    type: 'column',
                    name: 'Volume',
                    data: data.data.map(e => [e.t, e.v]),
                    yAxis: 1,
                    color: '#000000',
                }]
            });
        });

        apiGet('news?symbol=' + search.value).then(data => {
            for (const item of data.data) {
                const wrapper = document.createElement('div');
                wrapper.className = 'wrapper';
                const img = document.createElement('img');
                const right = document.createElement('div');
                right.className = 'right';
                const title = document.createElement('div'); 
                title.className = 'title';
                const datetime = document.createElement('div');
                datetime.className = 'datetime';
                const url = document.createElement('a');
                url.className = 'url';
                right.appendChild(title);
                right.appendChild(datetime);
                right.appendChild(url);
                wrapper.appendChild(img);
                wrapper.appendChild(right);
                news.appendChild(wrapper);

                img.src = item.image;
                title.innerText = item.headline;
                datetime.innerText = item.datetime;
                url.href = item.url;
                url.target = '_blank';
                url.innerText = 'See Origin Post';
            }
        });
    }, true);

    search.addEventListener('keydown', e => {
        if (e.key == "Enter") {
            searchSubmit.click();
            return true;
        } else if (e.keyCode == 13) {
            searchSubmit.click();
            return true;
        }
        return false;
    }, true);

    clear.addEventListener('click', () => {
        search.value = '';
        error.style.display = 'none';
        tabs.style.display = 'none';
    }, true);

    if (search.value) {
        searchSubmit.click();
    }
});