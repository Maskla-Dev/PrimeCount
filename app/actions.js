const Plotly = require("plotly.js");
const fs = require("fs");
const button = document.getElementById("plotter");
const progress = document.getElementById("progress");
const mith = document.getElementById("mith")
const graphics = document.getElementById("graphics");
let worker = new Worker("./worker.js");
worker.onmessage = workerListener;
let items_per_page = 10000;
let total_finded = 0;
let pages = {
    current: 1,
    total: 1
}
let current_pos = {
    binary: 0,
    count: 0
};
button?.addEventListener("click", (e) => {
    e.preventDefault();
    let STOP_NUMBER = mith.value;
    mith.disabled = true;
    button.disabled = true;
    worker.postMessage(Number(STOP_NUMBER));
})

graphics?.getElementsByClassName("prev")[0].addEventListener("click", () => {
    changePage(pages.current - 1);
});
graphics?.getElementsByClassName("next")[0].addEventListener("click", () => {
    changePage(pages.current + 1);
});

function workerListener(e) {
    if (e.data.activity == "done") {
        progress.getElementsByClassName("load-status")[0].innerHTML = "done"
        progress.getElementsByClassName("loader-bar")[0].style.width = "100%";
        total_finded = e.data.payload.value;
        updatePages();
        button.disabled = false;
        mith.disabled = false;
    }
    else if (e.data.activity == "status-update") {
        progress.getElementsByClassName("load-status")[0].innerHTML = e.data.payload.value
        progress.getElementsByClassName("loader-bar")[0].style.width = e.data.payload.value;

    }
}

function updatePages() {
    pages.total = Math.ceil(total_finded / items_per_page);
    changePage(1);
    graphics.getElementsByClassName("current")[0].innerHTML = pages.current;
    graphics.getElementsByClassName("total")[0].innerHTML = pages.total
}

function changePage(new_page) {
    if (new_page > 0 && new_page <= pages.total) {
        pages.current = new_page;
        plot(getData());
    }
}

function plot(data) {
    let normal = {
        x: data.x,
        y: data.count,
        mode: "lines"
    }
    let log = [{
        x: data.x,
        y: data.log2,
        name: "Log2",
        mode: "lines+markers"
    }, {
        x: data.x,
        y: data.log10,
        name: "Log10",
        mode: "lines+markers"
    }];
    let xaxis = {
        autotypenumbers: "strict"
    };
    Plotly.newPlot("normal", [normal], {
        title: "1s count",
        ...xaxis
    });
    Plotly.newPlot("log", log, {
        title: "Logx of 1s count",
        ...xaxis
    });
}

function getData() {
    let data = {
        x: [],
        count: [],
        log2: [],
        log10: []
    };
    let buffer = Buffer.alloc(fs.statSync("./app/files/binaryset").size - 1);
    fs.readSync(fs.openSync("./app/files/binaryset", fs.constants.O_RDONLY), buffer, {
        position: 1
    });
    data.x = buffer.toString("utf8").split(",");
    data.x = data.x.slice(0, data.x.length - 1);
    for (let i = 0; i < data.x.length; ++i) {
        data.x[i] = data.x[i].slice(1, data.x[i].length - 1);
        data.count.push(countOnes(data.x[i]));
    }
    for (let item of data.count) {
        data.log2.push(Math.log2(item));
        data.log10.push(Math.log10(item));
    }
    return data;
}

function countOnes(word) {
    let count = 0;
    for (let letter of word) {
        count += letter == "1" ? 1 : 0;
    }
    return count
}