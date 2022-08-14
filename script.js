var poetizer = (function () {
    var BASE_URL = 'https://api.poetizer.com';
    var WEB_URL = 'https://poetizer.com';
    var deviceToken = window.localStorage.getItem('device_token');
    var userId = window.localStorage.getItem('user_id');
    var userName = window.localStorage.getItem('user_name');
    var profileImg = window.localStorage.getItem('picture_url');
    var expiration = window.localStorage.getItem('expiration');
    var limit, offset;
    var calledAlready = false;
    function showUserInfo() {
        fetch("".concat(BASE_URL, "/users/").concat(userId), {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Device-token ".concat(deviceToken)
            }
        })
            .then(function (response) { return response.json(); })
            .then(function (user) {
            document.getElementById('id01').style.display = 'none';
            var userImg = document.createElement('img');
            profileImg = user.picture;
            userImg.src = profileImg;
            window.localStorage.setItem('picture_url', profileImg);
            var userNamePgf = document.createElement('p');
            userName = user.name;
            userNamePgf.innerText = "Jste p\u0159ihl\u00E1\u0161en pod \u00FA\u010Dtem: ".concat(userName);
            window.localStorage.setItem('user_name', userName);
            var logoutBtn = document.createElement('button');
            logoutBtn.onclick = function () { return logout(); };
            logoutBtn.setAttribute('id', 'logout-button');
            logoutBtn.innerText = "Log out";
            var loginAreaDiv = document.getElementById('login-area');
            loginAreaDiv.innerHTML = userImg.outerHTML;
            loginAreaDiv.innerHTML += userNamePgf.outerHTML;
            loginAreaDiv.appendChild(logoutBtn);
        });
    }
    function showUserInfoOffline() {
        document.getElementById('id01').style.display = 'none';
        var userImg = document.createElement('img');
        profileImg = window.localStorage.getItem('picture_url');
        userImg.src = profileImg;
        var userNamePgf = document.createElement('p');
        userName = window.localStorage.getItem('user_name');
        ;
        userNamePgf.innerText = "Jste p\u0159ihl\u00E1\u0161en pod \u00FA\u010Dtem: ".concat(userName);
        var logoutBtn = document.createElement('button');
        logoutBtn.onclick = function () { return logout(); };
        logoutBtn.setAttribute('id', 'logout-button');
        logoutBtn.innerText = "Log out";
        var loginAreaDiv = document.getElementById('login-area');
        loginAreaDiv.innerHTML = userImg.outerHTML;
        loginAreaDiv.innerHTML += userNamePgf.outerHTML;
        loginAreaDiv.appendChild(logoutBtn);
    }
    function login() {
        var email = document.getElementById('uname');
        var password = document.getElementById('psw');
        if (email != null && password != null) {
            var params = { 'email': email.value, 'password': password.value, 'platform': 'android', 'device_name': 'Randomdroid 9' };
            getToken(params);
        }
    }
    function getToken(params) {
        fetch("".concat(BASE_URL, "/devices/email"), {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
            .then(function (response) {
            if (response.status === 201) {
                return response.json();
            }
            else {
                var error = new Error('promise chain cancelled getToken');
                error.name = 'CancelPromiseChainError';
                throw error;
            }
        })
            .then(function (tokenInfo) {
            deviceToken = tokenInfo.device_token;
            window.localStorage.setItem('device_token', deviceToken);
            userId = tokenInfo.user_id;
            window.localStorage.setItem('user_id', userId);
            var jwtAccess = tokenInfo.jwt.access.split('.')[1];
            var expirationInfo = JSON.parse(atob(jwtAccess));
            expiration = expirationInfo.exp;
            window.localStorage.setItem('expiration', expiration);
            showUserInfo();
        })["catch"](function (error) {
            if (error.name == 'CancelPromiseChainError') {
                document.getElementById('login-info').innerText = "P\u0159ihl\u00E1\u0161en\u00ED se nepoda\u0159ilo";
            }
        });
    }
    function logout() {
        window.localStorage.clear();
        location.reload();
    }
    function getFirstPoemsByTags() {
        var mainDiv = document.getElementById('main');
        mainDiv.innerHTML = '';
        getPoemsByTags(6, 0);
    }
    function getPoemsByTags(limit, offset) {
        if (getTagsAsParams().length != 0 && deviceToken != null && +expiration > (Date.now() / 1000)) {
            showSearchedTags();
            fetch("".concat(BASE_URL, "/poems/search?limit=").concat(limit, "&offset=").concat(offset), {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Device-token ".concat(deviceToken)
                },
                body: getTagsAsParams()
            })
                .then(function (response) {
                if (response.status === 200) {
                    return response.json();
                }
                else {
                    var error = new Error('promise chain cancelled getPoems');
                    error.name = 'CancelPromiseChainError';
                    throw error;
                }
            })
                .then(function (poems) {
                var mainDiv = document.getElementById('main');
                if (poems.poems.length == 0) {
                    var errorMessage = "Pro tento tag nebyly nalezeny \u017E\u00E1dn\u00E9 b\u00E1sn\u011B";
                    if (!calledAlready) {
                        mainDiv.innerText = errorMessage;
                    }
                    hideNextButton(errorMessage);
                }
                else {
                    poems.poems.forEach(function (element) {
                        var article = document.createElement('article');
                        var poemTitleLnk = document.createElement('a');
                        poemTitleLnk.href = "".concat(WEB_URL, "/poem/").concat(element.id);
                        poemTitleLnk.target = '_blank';
                        var poemTitleHdr = document.createElement('h2');
                        poemTitleHdr.innerText = element.title;
                        poemTitleLnk.appendChild(poemTitleHdr);
                        var poemBodyPgf = document.createElement('p');
                        poemBodyPgf.insertAdjacentHTML('afterbegin', element.text);
                        var authorLnk = document.createElement('a');
                        authorLnk.href = "".concat(WEB_URL, "/author/").concat(element.author.id);
                        authorLnk.target = '_blank';
                        authorLnk.innerText = element.author.name;
                        var hashtagsPgf = document.createElement('p');
                        hashtagsPgf.innerText = "Tags: ".concat(element.tags);
                        article.appendChild(poemTitleLnk);
                        article.appendChild(poemBodyPgf);
                        article.insertAdjacentHTML('beforeend', "Autor: ".concat(authorLnk.outerHTML));
                        article.appendChild(hashtagsPgf);
                        mainDiv.appendChild(article);
                    });
                    if (poems.poems.length == limit) {
                        setLimitAndOffset(poems.next);
                        createNextButton();
                    }
                    if (poems.poems.length < limit) {
                        hideNextButton("\u017D\u00E1dn\u00E9 dal\u0161\u00ED b\u00E1sn\u011B");
                    }
                }
            })["catch"](function (error) {
                if (error.name == 'CancelPromiseChainError') {
                    document.getElementById('main').innerText = "\u0160patn\u011B zadan\u00FD tag, obsahuje nevyhledateln\u00E9 znaky. Pou\u017E\u00EDvejte pouze p\u00EDsmena a \u010D\u00E1rky.";
                }
            });
        }
        else {
            var mainDiv = document.getElementById('main');
            mainDiv.innerText = "Zadejte tag do vyhled\u00E1vac\u00EDho pol\u00ED\u010Dka. P\u0159ed vyhled\u00E1v\u00E1n\u00EDm se ujist\u011Bte, \u017Ee jste p\u0159ihl\u00E1\u0161en\u00ED, p\u0159\u00EDpadn\u011B tak u\u010Di\u0148te kliknut\u00EDm na tla\u010D\u00EDtko Login";
        }
    }
    function getTagsAsParams() {
        var queryTagsElement = document.getElementById('tags');
        var queryTags = queryTagsElement.value.trim();
        if (queryTags.length == 0 || queryTags == "Zadej tag") {
            var mainDiv = document.getElementById('main');
            mainDiv.innerText = "Nezadali jste \u017E\u00E1dn\u00FD tag do vyhled\u00E1vac\u00EDho ok\u00FDnka :)";
            return '';
        }
        return "{\"tags\":[\"".concat(queryTags.replace(/\s+/g, '').replace(/,/g, "\", \""), "\"]}");
    }
    function setLimitAndOffset(nextPageLink) {
        var offsetArray = nextPageLink.split('=');
        var limitArray = offsetArray[1].split('&');
        limit = +limitArray[0];
        offset = +offsetArray[2];
    }
    function createNextButton() {
        if (!calledAlready) {
            var nextBtn = document.createElement('button');
            nextBtn.onclick = function () { return getPoemsByTags(limit, offset); };
            nextBtn.setAttribute('id', 'next-poem-button');
            nextBtn.innerText = "Dal\u0161\u00ED b\u00E1sn\u011B";
            document.getElementById('next-area').appendChild(nextBtn);
        }
        else {
            var nextBtn = document.getElementById('next-poem-button');
            nextBtn.onclick = function () { return getPoemsByTags(limit, offset); };
            nextBtn.innerText = "Dal\u0161\u00ED b\u00E1sn\u011B";
        }
        calledAlready = true;
    }
    function hideNextButton(errorMessage) {
        var nextBtn = document.getElementById('next-poem-button');
        nextBtn.onclick = function () { return; };
        nextBtn.innerText = errorMessage;
    }
    function showSearchedTags() {
        var queryTagsElement = document.getElementById('tags');
        var queryTags = queryTagsElement.value.trim();
        document.getElementById('stats').innerText = "Hledan\u00E9 tagy: ".concat(queryTags.replace(/\s+/g, '').replace(/,/g, ", "));
    }
    window.onload = function () {
        document.querySelector('#tags').addEventListener('keypress', function (e) {
            if (e.key === 'Enter')
                getFirstPoemsByTags();
        });
        document.querySelector('#psw').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                login();
            }
        });
        if (deviceToken != null && +expiration > (Date.now() / 1000)) {
            if (userName != null) {
                showUserInfoOffline();
            }
            else {
                showUserInfo();
            }
        }
    };
    return {
        getFirstPoemsByTags: getFirstPoemsByTags,
        login: login
    };
})();
//# sourceMappingURL=script.js.map