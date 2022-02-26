var poetizer = (function () {
    const BASE_URL = 'https://api.poetizer.com';
    const WEB_URL = 'https://poetizer.com';
    let deviceToken = window.localStorage.getItem('device_token');
    let limit, offset;
    let calledAlready = false;

    function showUserInfo(userId) {

        fetch(`${BASE_URL}/users/${userId}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Device-token ${deviceToken}`
            }
        })
            .then(response => response.json())
            .then(user => {
                document.getElementById('id01').style.display = 'none';

                const userImg = document.createElement('img');
                userImg.src = user.picture;

                const userNamePgf = document.createElement('p');
                userNamePgf.innerText = `Jste přihlášen pod účtem: ${user.name}`;

                document.getElementById('login-area').innerHTML = userImg.outerHTML;
                document.getElementById('login-area').innerHTML += userNamePgf.outerHTML;
            });
    }

    function login() {
        const email = document.getElementById('uname').value;
        const password = document.getElementById('psw').value;
        const params = { 'email': email, 'password': password, 'platform': 'android', 'device_name': 'Randomdroid 9' };

        getToken(params);
    }

    function getToken(params) {
        fetch(`${BASE_URL}/devices/email`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })
            .then(response => response.json())
            .then(tokenInfo => {
                deviceToken = tokenInfo.device_token;
                window.localStorage.setItem('device_token', deviceToken);
                showUserInfo(tokenInfo.user_id);
            });

    }

    function getFirstPoemsByTags() {
        getPoemsByTags(6, 0);
    }

    function getPoemsByTags(limit, offset) {
        const queryTags = document.getElementById('tags').value;
        const params = { 'tags': [queryTags] };

        fetch(`${BASE_URL}/poems/search?limit=${limit}&offset=${offset}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Device-token ${deviceToken}`
            },
            body: JSON.stringify(params)
        })
            .then(response => response.json())
            .then(poems => {
                const mainDiv = document.getElementById('main');
                if (!calledAlready) {
                    mainDiv.innerHTML = '';
                }

                poems.poems.forEach(element => {
                    const article = document.createElement('article');

                    const poemTitleLnk = document.createElement('a');
                    poemTitleLnk.href = `${WEB_URL}/poem/${element.id}`;
                    poemTitleLnk.target = '_blank';
                    const poemTitleHdr = document.createElement('h2');
                    poemTitleHdr.innerText = element.title;
                    poemTitleLnk.appendChild(poemTitleHdr);

                    const poemBodyPgf = document.createElement('p');
                    poemBodyPgf.insertAdjacentHTML('afterBegin', element.text);

                    const authorLnk = document.createElement('a');
                    authorLnk.href = `${WEB_URL}/author/${element.author.id}`;
                    authorLnk.target = '_blank';
                    authorLnk.innerText = element.author.name;

                    const hashtagsPgf = document.createElement('p');
                    hashtagsPgf.innerText = `Tags: ${element.tags}`;

                    article.appendChild(poemTitleLnk);
                    article.appendChild(poemBodyPgf);
                    article.insertAdjacentHTML('beforeend', `Autor: ${authorLnk.outerHTML}`);
                    article.appendChild(hashtagsPgf);

                    mainDiv.appendChild(article);
                });

                if (poems.poems.length == limit) {
                    setLimitAndOffset(poems.next);
                    createNextButton();
                }
                if (poems.poems.length < limit) {
                    hideNextButton();
                }
            })
    }

    function setLimitAndOffset(nextPageLink) {
        const offsetArray = nextPageLink.split('=');
        const limitArray = offsetArray[1].split('&');
        limit = limitArray[0];
        offset = offsetArray[2];
    }

    function createNextButton() {
        if (!calledAlready) {
            const nextBtn = document.createElement('button');
            nextBtn.onclick = () => getPoemsByTags(limit, offset);
            nextBtn.setAttribute('id', 'next-poem-button');
            nextBtn.innerText = `Další básně`;
            document.getElementById('next-area').appendChild(nextBtn);
        }
        calledAlready = true;
    }

    function hideNextButton() {
        const mainDiv = document.getElementById('main');
        if (calledAlready) {
            document.getElementById('next-poem-button').hidden = true;
        }
        const endOfListPgf = document.createElement('p');
        endOfListPgf.innerText = `Žádné další básně`;
        mainDiv.appendChild(endOfListPgf);
    }

    window.onload = function () {
        document.querySelector('#tags').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                getFirstPoemsByTags();
            }
        });
        document.querySelector('#psw').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }

    return {
        getFirstPoemsByTags: getFirstPoemsByTags,
        login: login
    };
})();