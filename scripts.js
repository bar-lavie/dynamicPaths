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
    for(let i in e.target.dataset.url){
        console.log(i)
    }
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
