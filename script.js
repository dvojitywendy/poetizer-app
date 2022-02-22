var device_token = "";

function login() {
    var email = document.getElementById("uname").value;
    var password = document.getElementById("psw").value;

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        console.log(xhr.responseText);
        var obj = JSON.parse(xhr.responseText);
        if (obj !== undefined) {
            document.getElementById('id01').style.display='none';
            device_token = obj.device_token;
        }
        }
    };
    xhr.open('POST', 'https://api.poetizer.com/devices/email', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var params = '{"email": "' + email + '","password": "' + password + '","platform": "android","device_name": "Randomdroid 9"}';
    xhr.send(params);
}

function msgprint() {
    var tags = document.getElementById("tags").value;

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        console.log(xhr.responseText);
        var obj = JSON.parse(xhr.responseText);
        
        var element = document.getElementById("main");
        element.innerHTML = "";

        for (var i = 0; i < obj.poems.length; i++) {

        var article = document.createElement("article");

        var linkTitle = document.createElement("a");
        linkTitle.href = "https://poetizer.com/poem/" + obj.poems[i].id;
        linkTitle.target = "_blank";
        var title = document.createElement("h2");
        var textTitle = document.createTextNode(obj.poems[i].title);
        title.appendChild(textTitle);
        linkTitle.appendChild(title);

        var para = document.createElement("p");
        var textPara = para.insertAdjacentHTML('afterBegin', obj.poems[i].text);
        

        var linkAuthor = document.createElement("a");
        linkAuthor.href = "https://poetizer.com/author/" + obj.poems[i].author.id;
        linkAuthor.target = "_blank";
        var author = document.createElement("p");
        var textAuthor = document.createTextNode("Autor: " + obj.poems[i].author.name);
        author.appendChild(textAuthor);
        linkAuthor.appendChild(author);

        article.appendChild(linkTitle);
        article.appendChild(para);
        article.appendChild(linkAuthor);
        
        element.appendChild(article);
    }
        }
    };
    xhr.open('POST', 'https://api.poetizer.com/poems/search?limit=6&offset=0', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Device-token ' + device_token);
    var params = '{"tags": ["'+tags+'"]}';
    xhr.send(params);
}