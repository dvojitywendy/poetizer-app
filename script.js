var poetizer = (function () {
    const BASE_URL = 'https://api.poetizer.com';
    const WEB_URL = 'https://poetizer.com';
    let deviceToken = window.localStorage.getItem('device_token');
    let userId = window.localStorage.getItem('user_id');
    let userName = window.localStorage.getItem('user_name');
    let profileImg = window.localStorage.getItem('picture_url');
    let expiration = window.localStorage.getItem('expiration');
    let limit, offset;
    let calledAlready = false;

    function showUserInfo() {

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
                profileImg = user.picture;
                userImg.src = profileImg;
                window.localStorage.setItem('picture_url', profileImg);


                const userNamePgf = document.createElement('p');
                userName = user.name;
                userNamePgf.innerText = `Jste přihlášen pod účtem: ${userName}`;
                window.localStorage.setItem('user_name', userName);

                const logoutBtn = document.createElement('button');
                logoutBtn.onclick = () => logout();
                logoutBtn.setAttribute('id', 'logout-button');
                logoutBtn.innerText = `Log out`;

                const loginAreaDiv = document.getElementById('login-area');
                loginAreaDiv.innerHTML = userImg.outerHTML;
                loginAreaDiv.innerHTML += userNamePgf.outerHTML;
                loginAreaDiv.appendChild(logoutBtn);
            });
    }

    function showUserInfoOffline() {

        document.getElementById('id01').style.display = 'none';

        const userImg = document.createElement('img');
        profileImg = window.localStorage.getItem('picture_url');
        userImg.src = profileImg;

        const userNamePgf = document.createElement('p');
        userName = window.localStorage.getItem('user_name');;
        userNamePgf.innerText = `Jste přihlášen pod účtem: ${userName}`;

        const logoutBtn = document.createElement('button');
        logoutBtn.onclick = () => logout();
        logoutBtn.setAttribute('id', 'logout-button');
        logoutBtn.innerText = `Log out`;

        const loginAreaDiv = document.getElementById('login-area');
        loginAreaDiv.innerHTML = userImg.outerHTML;
        loginAreaDiv.innerHTML += userNamePgf.outerHTML;
        loginAreaDiv.appendChild(logoutBtn);

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
            .then(response => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    const error = new Error('promise chain cancelled getToken');
                    error.name = 'CancelPromiseChainError';
                    throw error;
                }
            })
            .then(tokenInfo => {
                deviceToken = tokenInfo.device_token;
                window.localStorage.setItem('device_token', deviceToken);
                userId = tokenInfo.user_id;
                window.localStorage.setItem('user_id', userId);
                const jwtAccess = tokenInfo.jwt.access.split('.')[1];
                const expirationInfo = JSON.parse(atob(jwtAccess));
                expiration = expirationInfo.exp;
                window.localStorage.setItem('expiration', expiration);
                showUserInfo();
            })
            .catch(error => {
                if (error.name == 'CancelPromiseChainError') {
                    document.getElementById('login-info').innerText = `Přihlášení se nepodařilo`;
                }
            });

    }

    function logout() {
        window.localStorage.clear();
        location.reload();
    }

    function getFirstPoemsByTags() {
        const mainDiv = document.getElementById('main');
        mainDiv.innerHTML = '';
        getPoemsByTags(6, 0);
    }

    function getPoemsByTags(limit, offset) {
        if (getTagsAsParams().length != 0 && deviceToken != null && expiration > (Date.now() / 1000)) {
            showSearchedTags();
            fetch(`${BASE_URL}/poems/search?limit=${limit}&offset=${offset}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Device-token ${deviceToken}`
                },
                body: getTagsAsParams()
            })
                .then(response => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        const error = new Error('promise chain cancelled getPoems');
                        error.name = 'CancelPromiseChainError';
                        throw error;
                    }
                })
                .then(poems => {
                    const mainDiv = document.getElementById('main');

                    if (poems.poems.length == 0) {
                        const errorMessage = `Pro tento tag nebyly nalezeny žádné básně`;
                        if (!calledAlready) {
                            mainDiv.innerText = errorMessage;
                        }
                        hideNextButton(errorMessage);
                    }
                    else {
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
                            hideNextButton(`Žádné další básně`);
                        }
                    }
                })
                .catch(error => {
                    if (error.name == 'CancelPromiseChainError') {
                        document.getElementById('main').innerText = `Špatně zadaný tag, obsahuje nevyhledatelné znaky. Používejte pouze písmena a čárky.`;
                    }
                });
        } else {
            const mainDiv = document.getElementById('main');
            mainDiv.innerText = `Zadejte tag do vyhledávacího políčka. Před vyhledáváním se ujistěte, že jste přihlášení, případně tak učiňte kliknutím na tlačítko Login`;
        }
    }

    function getTagsAsParams() {
        let queryTags = document.getElementById('tags').value.trim();
        if (queryTags.length == 0 || queryTags == `Zadej tag`) {
            const mainDiv = document.getElementById('main');
            mainDiv.innerText = `Nezadali jste žádný tag do vyhledávacího okýnka :)`;
            return '';
        }
        return `{"tags":["${queryTags.replace(/\s+/g, '').replace(/,/g, `", "`)}"]}`;
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
        } else {
            const nextBtn = document.getElementById('next-poem-button');
            nextBtn.onclick = () => getPoemsByTags(limit, offset);
            nextBtn.innerText = `Další básně`;
        }
        calledAlready = true;
    }

    function hideNextButton(errorMessage) {
        const nextBtn = document.getElementById('next-poem-button');
        nextBtn.onclick = 'javascript:void(0)';
        nextBtn.innerText = errorMessage;
    }

    function showSearchedTags() {
        let queryTags = document.getElementById('tags').value.trim();
        document.getElementById('stats').innerText = `Hledané tagy: ${queryTags.replace(/\s+/g, '').replace(/,/g, `, `)}`;
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
        if (deviceToken != null && expiration > (Date.now() / 1000)) {
            if (userName != null) {
                showUserInfoOffline();
            } else {
                showUserInfo();
            }
        }
    }

    return {
        getFirstPoemsByTags: getFirstPoemsByTags,
        login: login
    };
})();
