let urls = {};

getUrls();

function getUrls() {
    chrome.storage.sync.get('urls', function (item) {
        if (!chrome.runtime.error) {
            if (Object.keys(item).length === 0 || item.urls === '') {
                return
            }
            urls = item.urls;
        }
        renderUrls();
    });
}


function goto(e) {
    var str = e.target.dataset.url
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
    chrome.tabs.create({url: str});
};

function removeItem(e) {
    log('remove')
    delete urls[e.target.dataset.key];
    chrome.storage.sync.set({urls: urls}, renderUrls())
}

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
    chrome.storage.sync.set({urls: urls}, renderUrls())
};

function renderUrls() {
    const el = document.getElementById("data");
    el.innerHTML = '';
    log('render')
    log(urls)
    for (let i in urls) {

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'wrapper');

        const url = document.createElement('a');
        url.addEventListener('click', goto);
        url.dataset['url'] = urls[i];
        url.setAttribute('href', '#');
        url.setAttribute('class', 'goto');
        url.appendChild(document.createTextNode(urls[i]));

        const remove = document.createElement('button');
        remove.addEventListener('click', removeItem);
        remove.setAttribute('type', 'button');
        remove.setAttribute('title', 'Remove');
        remove.setAttribute('class', 'remove');
        remove.setAttribute('data-key', i);
        let img = new Image(15);
        img.src = './assets/trash.png';
        remove.appendChild(img);

        const label = document.createElement('span');
        label.setAttribute('class', 'label');
        label.appendChild(document.createTextNode(i));


        wrapper.appendChild(label);
        wrapper.appendChild(url);
        wrapper.appendChild(remove);


        el.appendChild(wrapper);
    }
}

function log(param) {
    chrome.extension.getBackgroundPage().console.log(param);
}

// document.getElementById("clear-all").onclick = function () {
//     chrome.storage.sync.set({urls: ''}, function () {
//         log('All clear!');
//     });
// };
document.getElementsByClassName("tooltip")[0].onclick = function (e) {

    let element = document.getElementsByClassName("instructions")[0];
    if (element.style.display === 'block') {
        this.innerHTML = '?';
        element.style.display = 'none';
        return;
    }
    this.innerHTML = '-';
    element.style.display = 'block'
};

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + encodeURI(replacement) + this.substr(index + 1);
};
