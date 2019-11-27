let urls = {};
alertify.defaults.glossary.title = 'Dynamit';
getUrls();
const input = document.getElementById('url');
input.focus();
input.addEventListener('keyup', function (e) {
    let search = e.target.value;
    const children = document.getElementById('data').children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        child.classList.add('d-none');
        if (child.dataset.key.includes(search) || child.dataset.url.includes(search)) {
            child.classList.remove('d-none');
        }
    }
});

let selected;
document.addEventListener('keydown', function (e) {
    const childrenHtml = document.getElementById('data').children;
    let children = [];
    for (let i = 0; i < childrenHtml.length; i++) {
        let child = childrenHtml[i];
        if (!child.className.includes('d-none')) {
            children.push(child);
        }
    }
    if (e.keyCode === 40) {

        if (selected) {
            selected.classList.remove('selected');
            const next = getNextSibling(selected, ':not(.d-none)');
            if (next) {
                selected = next;
            } else {
                selected = children[0];
            }
            selected.classList.add('selected')
        } else {
            selected = children[0];
            selected.classList.add('selected')
        }

    }

    if (e.keyCode === 38) {
        if (selected) {
            selected.classList.remove('selected');
            const next = getNextSibling(selected, ':not(.d-none)', true);
            if (next) {
                selected = next;
            } else {
                selected = children[children.length - 1];
            }
            selected.classList.add('selected')
        } else {
            selected = children[children.length - 1];
            selected.classList.add('selected')
        }
    }

});

// https://gomakethings.com/finding-the-next-and-previous-sibling-elements-that-match-a-selector-with-vanilla-js/
function getNextSibling(elem, selector, reverse = false) {

    // Get the next sibling element
    let sibling = reverse ? elem.previousElementSibling : elem.nextElementSibling;

    // If there's no selector, return the first sibling
    if (!selector) return sibling;

    // If the sibling matches our selector, use it
    // If not, jump to the next sibling and continue the loop
    while (sibling) {
        if (sibling.matches(selector)) return sibling;
        sibling = reverse ? sibling.previousElementSibling : sibling.nextElementSibling
    }

};


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
    if (!isUrl(str)) {
        alertify.error('Let\'s save you some time, it\'s not a real URL (:');
        return;
    }
    for (var i = 0; i < str.length; i++) {
        str = await getVariable(str, i)
    }
    const prefix = 'http://';
    if (str.substr(0, prefix.length) !== prefix) {
        str = prefix + str;
    }
    chrome.tabs.create({url: str});
}

function isUrl(str) {
    //https://www.regextester.com/93652
    const expression = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    const regex = new RegExp(expression);
    return str.match(regex)
}


function getVariable(str, i) {

    return new Promise(resolve => {
        if (str[i] === '*') {
            const visible = 8;
            alertify.prompt(str.substr(i - visible, visible) + ' * ' + str.substr(i + 1, visible), '',
                function (evt, variable) {
                    if (variable == null || variable == "") {
                        alertify.error('A dynamic variables not set for URL');
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

    log(selected.getElementsByTagName('a'));

    e.preventDefault();

    let url = e.target[0].value;
    if (!url) {
        alertify.error('URL is missing...');
        return false;
    }

    let that = this;
    alertify.prompt("Give it a label, example: Account edit", '',
        function (evt, name) {
            if (name == null || name == "") {
                alertify.error('Every URL need a name...');
                return
            }
            urls[name] = url;
            chrome.storage.sync.set({urls: urls}, renderUrls())
            alertify.success('Success, new URL added');
            that.reset()
        });
};

function renderUrls() {
    const el = document.getElementById("data");
    el.innerHTML = '';
    for (let i in urls) {

        const wrapper = document.createElement('li');
        wrapper.setAttribute('class', 'wrapper');
        wrapper.setAttribute('data-key', i);
        wrapper.setAttribute('data-url', urls[i]);

        const div = document.createElement('div');

        const url = document.createElement('a');
        url.addEventListener('click', goto);
        url.setAttribute('data-url', urls[i]);
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
        label.addEventListener('click', goto);
        label.setAttribute('class', 'label');
        label.setAttribute('data-url', urls[i]);
        label.appendChild(document.createTextNode(i));

        div.appendChild(label);
        div.appendChild(url);

        wrapper.appendChild(div);
        wrapper.appendChild(remove);


        el.appendChild(wrapper);
    }
    input.focus();
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
