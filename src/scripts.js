let urls = {};
alertify.defaults.glossary.title = 'Dynamic Paths';

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


async function goto(e) {
    e.preventDefault();
    let str = e.target.dataset.url;
    for (var i = 0; i < str.length; i++) {
        str = await getVariable(str, i)
    }
    log(str)
    // chrome.tabs.create({url: str});
}


function getVariable(str, i) {

    return new Promise(resolve => {
        if (str[i] === '*') {
            const visible = 8;
            alertify.prompt(str.substr(i - visible, visible) + ' * ' + str.substr(i + 1, visible), '',
                function (evt, variable) {
                    if (variable == null || variable == "") {
                        alertify.error('Variables not set for url');
                        return
                    }
                    resolve(str.replaceAt(i, variable))
                });
        } else {
            resolve(str)
        }
    })
}


function removeItem(e) {
    delete urls[e.target.dataset.key];
    chrome.storage.sync.set({urls: urls}, renderUrls())
}

document.getElementById("form").onsubmit = function (e) {

    e.preventDefault();

    let url = e.target[0].value;
    if (!url) {
        alertify.error('Url is missing...');
        return false;
    }

    let that = this;
    alertify.prompt("Give it a label, example: Account edit", '',
        function (evt, name) {
            if (name == null || name == "") {
                alertify.error('Every url need a name...');
                return
            }
            urls[name] = url;
            chrome.storage.sync.set({urls: urls}, renderUrls())
            alertify.success('Success, new url added');
            that.reset()
        });
};

function renderUrls() {
    const el = document.getElementById("data");
    el.innerHTML = '';
    for (let i in urls) {

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'wrapper');

        const div = document.createElement('div');

        const url = document.createElement('a');
        url.addEventListener('click', goto);
        url.dataset['url'] = urls[i];
        url.setAttribute('href', '#');
        url.setAttribute('title', urls[i]);
        url.setAttribute('class', 'goto');
        url.appendChild(document.createTextNode(urls[i]));

        const remove = document.createElement('button');
        remove.addEventListener('click', removeItem);
        remove.setAttribute('type', 'button');
        remove.setAttribute('title', 'Remove');
        remove.setAttribute('class', 'remove');
        remove.setAttribute('data-key', i);
        let img = new Image(15);
        img.setAttribute('data-key', i);
        img.src = './assets/trash.png';
        remove.appendChild(img);

        const label = document.createElement('span');
        label.setAttribute('class', 'label');
        label.appendChild(document.createTextNode(i));

        div.appendChild(label);
        div.appendChild(url);

        wrapper.appendChild(div);
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

document.getElementsByClassName("goto").onmouseover = function (e) {
    log(e)
};


String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + encodeURI(replacement) + this.substr(index + 1);
};
