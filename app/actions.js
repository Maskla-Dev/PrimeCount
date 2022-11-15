const Plotly = require("plotly.js");

const button = document.getElementById("plotter");
const mith = document.getElementById("mith")
let unblock_status = 0b00;
let worker = new Worker("./worker.js");
worker.onmessage = workerListener();

button?.addEventListener("click", (e) => {
    e.preventDefault();
    let STOP_NUMBER = mith.value;
    mith.disabled = true;
    button.disabled = true;
    unblock_status = 0b00;
    worker.postMessage(Number(STOP_NUMBER));
})

async function printLog2(origin, STOP_NUMBER) {
    let data = [{
        x: origin.x,
        y: getLog2(origin.y),
        mode: "lines+markers",
        name: "log2 1s count"
    }];
    let plot_layout = {
        title: `Log2 1s count from 0 to ${STOP_NUMBER}`
    }
    Plotly.newPlot("plot-log-two", data, plot_layout);
    unblock_status = unblock_status | 0b01;
    if (unblock_status == 0b11) {
        mith.disabled = false;
        button.disabled = false;
    }
}

async function printLog10(origin, STOP_NUMBER) {
    let data = [{
        x: origin.x,
        y: getLog10(origin.y),
        mode: "lines+markers",
        name: "log2 1s count"
    }];
    let plot_layout = {
        title: `Log10 1s count from 0 to ${STOP_NUMBER}`
    }
    plot_layout.title = `Log10 1s count from 0 to ${STOP_NUMBER}`;
    Plotly.newPlot("plot-log-ten", data, plot_layout);
    unblock_status = unblock_status | 0b10;
    if (unblock_status == 0b11) {
        mith.disabled = false;
        button.disabled = false;
    }
}

function getLog2(data) {
    let log2 = [];
    for (let num of data) {
        log2.push(Math.log2(num));
    }
    return log2;
}

function getLog10(data) {
    let log10 = [];
    for (let num of data) {
        log10.push(Math.log10(num));
    }
}

function workerListener(e) {
    if(e.data.activity == "done"){
        
    }
}