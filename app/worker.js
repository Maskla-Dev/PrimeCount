const fs = require("fs");

let max_per_page = 10000;
let page_indexes = [];

onmessage = (e) => {
    if (typeof e.data == "number") {
        total_finded = 0;
        findPrimes(e.data)
        postMessage({
            activity: "done",
            payload: {
                value: total_finded
            }
        })
    }
}

let total_finded = 0;

function findPrimes(STOP_NUMBER) {
    let prime_number_list = [2, 3, 5, 7];
    // let ones_count = [1, 2, 2, 3];
    let bitmask = 0b000;
    let exponent = 3;
    openFiles(prime_number_list);
    for (let i = prime_number_list[prime_number_list.length - 1] + 1; i <= STOP_NUMBER; ++i) {
        postMessage({
            activity: "status-update",
            payload: {
                value: `${((i / STOP_NUMBER) * 100).toFixed(2)}%`
            }
        })
        bitmask = 0b000;
        exponent += (i > Math.pow(2, exponent)) ? 1 : 0;
        bitmask |= Number(isNumberEndingWithFive(i));
        bitmask <<= 1;
        bitmask |= Number(isDivisibleByTwo(i));
        bitmask <<= 1;
        bitmask |= Number(isBreakdownSumDivisibleByThree(i));
        bitmask <<= 1;
        if (bitmask != 0)
            continue;
        if (isDivisibleByAnyPrevPrime(i))
            continue;
        writeIntFile(i);
    }
    closeFiles();
}

function isNumberEndingWithFive(number) {
    let number_as_string = String(number);
    return (number_as_string[number_as_string.length - 1] == "5");
}

function isDivisibleByTwo(number) {
    return number % 2 == 0;
}

function isBreakdownSumDivisibleByThree(number) {
    let number_as_string = String(number);
    let sum = 0;
    for (let letter of number_as_string)
        sum += Number(letter);
    return sum % 3 == 0;
}

function isDivisibleByAnyPrevPrime(number) {
    let file_metadata = fs.statSync("./app/files/decimalset");
    let sqrt_root = Math.round(Math.sqrt(number));
    let pos = 1;
    let init_pos = pos;
    let end_pos = 0;
    let buffer = Buffer.alloc(1);
    let prev_prime = 2;
    let fd = fs.openSync("./app/files/decimalset", fs.constants.O_RDONLY);
    while (pos < file_metadata.size && prev_prime < sqrt_root) {
        fs.readSync(fd, buffer, { position: pos })
        if (buffer == "{")
            init_pos = pos + 1;
        if (buffer == "}") {
            end_pos = pos;
            prev_prime = Number(getNumberFromFile(fd, init_pos, end_pos).toString("utf8"));
        }
        if ((number % prev_prime) == 0)
            return true;
        ++pos;
    }
    return false;
}

function getNumberFromFile(fd, from, to) {
    let buffer = Buffer.alloc(to - from);
    fs.readSync(fd, buffer, { position: from });
    return buffer;
}

function openFiles(prime_list) {
    guaranteeDir();
    fs.writeFileSync("./app/files/decimalset", "{");
    fs.writeFileSync("./app/files/binaryset", "{");
    // fs.writeFileSync("./app/files/count", "");
    for (let number of prime_list) {
        fs.appendFileSync("./app/files/decimalset", `${number},`);
        fs.appendFileSync("./app/files/binaryset", `${number.toString(2)},`);
    }
    // for (let count of ones_counting) {
    //     fs.appendFileSync("./app/files/count", `${count}\n`);
    // }
}

function guaranteeDir() {
    if (!fs.existsSync("./app/files/"))
        fs.mkdirSync("./app/files/", { recursive: true });
}

function writeIntFile(number) {
    fs.appendFileSync("./app/files/decimalset", `${number},`);
    fs.appendFileSync("./app/files/binaryset", `${number.toString(2)},`);
    // fs.appendFileSync("./app/files/count", `${count}\n`);
    ++total_finded;
}
function closeFiles() {
    fs.appendFileSync("./app/files/decimalset", `}`);
    fs.appendFileSync("./app/files/binaryset", `}`);
}

function countOnes(number, exponent) {
    let bitmask = 0b1;
    let count = 0;
    while (bitmask <= Math.pow(2, exponent)) {
        if ((number & bitmask) == bitmask) {
            ++count;
        }
        bitmask <<= 1;
    }
    return count
}