var baseUrl = "https://api.poetizer.com";
var webUrl = "https://poetizer.com";
var device_token = window.localStorage.getItem("device_token");

function showUserInfo(user_id) {

    fetch(baseUrl + '/users/' + user_id, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Device-token ' + device_token
        }
    })
        .then(response => response.json())
        .then(user => {
            document.getElementById('id01').style.display = 'none';

            var img = document.createElement("img");
            img.src = user.picture;

            var name = document.createElement("p");
            var textName = document.createTextNode("Jste přihlášen pod účtem: " + user.name);
            name.appendChild(textName);

            document.getElementById('login-area').innerHTML = img.outerHTML;
            document.getElementById('login-area').innerHTML += name.outerHTML;
        });
}

function login() {
    var email = document.getElementById("uname").value;
    var password = document.getElementById("psw").value;
    var params = { "email": email, "password": password, "platform": "android", "device_name": "Randomdroid 9" };

    getToken(params);
}

function getToken(params) {
    fetch(baseUrl + '/devices/email', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
        .then(response => response.json())
        .then(token_info => {
            device_token = token_info.device_token;
            window.localStorage.setItem("device_token", device_token);
            user_id = token_info.user_id;
            showUserInfo(user_id);
        });

}

function getPoemsByTags() {
    var querytags = document.getElementById("tags").value;
    var params = { "tags": [querytags] };

    fetch(baseUrl + '/poems/search?limit=6&offset=0', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Device-token ' + device_token
        },
        body: JSON.stringify(params)
    })
        .then(response => response.json())
        .then(poems => {
            var maindiv = document.getElementById("main");
            maindiv.innerHTML = "";

            poems.poems.forEach(element => {
                var article = document.createElement("article");

                var linkTitle = document.createElement("a");
                linkTitle.href = `${webUrl}/poem/${element.id}`;
                linkTitle.target = "_blank";
                var title = document.createElement("h2");
                var textTitle = document.createTextNode(element.title);
                title.appendChild(textTitle);
                linkTitle.appendChild(title);

                var para = document.createElement("p");
                para.insertAdjacentHTML('afterBegin', element.text);

                var linkAuthor = document.createElement("a");
                linkAuthor.href = `${webUrl}/author/${element.author.id}`;
                linkAuthor.target = "_blank";
                linkAuthor.innerText = element.author.name;

                var hashtags = document.createElement("p");
                hashtags.innerText = `Tags: ${element.tags}`;

                article.appendChild(linkTitle);
                article.appendChild(para);
                article.insertAdjacentHTML('beforeend', `Autor: ${linkAuthor.outerHTML}`);
                article.appendChild(hashtags);

                maindiv.appendChild(article);
            });
        })
}

window.onload = function () {
    document.querySelector('#tags').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            getPoemsByTags();
        }
    });
    document.querySelector('#psw').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            login();
        }
    });
}