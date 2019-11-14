let urls = {};

document.body.onload = function () {
    chrome.storage.sync.get('urls', function (item) {
        if (!chrome.runtime.error) {
            log(item);
            if (item.urls === '') {
                log('no urls...');
                return
            }
            urls = item.urls;
            renderUrls();
            log(urls)
        }
    });
};


function goto(e) {
    var str = e.target.dataset.url
    log(str)
    for (var i = 0; i < str.length; i++) {
        if (str[i] === '*') {
            var variable = prompt("Variable " + i);
            if (variable == null || variable == "") {
                alert('Variables not set for url');
                return;
            }
            str = str.replaceAt(i, variable)
        }
    }
    chrome.tabs.create({ url: str });
};

document.getElementById("form").onsubmit = function (e) {

    const url = e.target[0].value;
    if (!url) {
        alert('No url has entered!');
        return;
    }

    var name = prompt("Name of url:", "Sandbox wp-admin");
    if (name == null || name == "") {
        alert('Every url need a name...');
        return;
    }

    urls[name] = url;
    log(urls);

    chrome.storage.sync.set({urls: urls});

    renderUrls()
};

function renderUrls() {
    for (let i in urls) {
        const element = document.createElement('a');
        element.addEventListener('click', goto)
        element.dataset['url'] = urls[i]
        element.setAttribute('href', '#')
        element.setAttribute('class', 'goto')
        let newContent = document.createTextNode(urls[i]);
        element.appendChild(newContent);
        document.getElementById("data").appendChild(element).appendChild(document.createElement("br"));
    }
}

function log(param) {
    chrome.extension.getBackgroundPage().console.log(param);
}

document.getElementById("clear-all").onclick = function () {
    chrome.storage.sync.set({urls: ''}, function () {
        log('All clear!');
    });
};


String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + encodeURI(replacement) + this.substr(index + 1);
};
