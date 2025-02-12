
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

function readSettings(sheet_name) {
    var setting_values = SheetApi.readSheet(sheet_name, 1)
    const settings = {}
    for (const row of setting_values) {
        const key = row[0]
        const value = row[1]
        settings[key] = value
    }

    return settings
}

function getSetting(sheet_name, setting_key) {
    return readSettings(sheet_name)[setting_key]
}

/**
* split `arr` into a specified `size` list.
* ex.
* var original_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
* 
* var chunks = chunk(original_list, 3)
* 
* [
*  [1, 2, 3],
*  [4, 5, 6],
*  [7, 8, 9],
*  [10]
* ]
* @param {array} arr
* @param {number} size
* @returns {array}
*/
const chunk = (arr, size) => {
    const r = []
    for (let i = 0; i < arr.length; i += size) {
        r.push(arr.slice(i, i + size))
    }
    return r
}

/**
 * Array of Array를 Array of Object로 반환한다.
 * @param {Array<Array>} arr 배열
 * @param {Number?} keyRowIndex Object key로 사용할 줄번호 (starting with 0, default 0)
 * @param {Number?} dataRowStartIndex 데이터 row 시작 줄번호 (starting with 0, default 1)
 */
function aoaToAoo(arr, keyRowIndex, dataRowStartIndex) {
    if (keyRowIndex == undefined) {
        keyRowIndex = 0
    }
    if (dataRowStartIndex == undefined) {
        dataRowStartIndex = keyRowIndex + 1
    }

    if (arr.length < 1 || arr[keyRowIndex] == undefined) {
        throw new Error('Invalid parameter received')
    }

    const result = []

    const keys = arr[keyRowIndex]
    for (let i = 0; i < arr.length; i++) {
        const row = arr[i]
        if (i == keyRowIndex) continue
        if (i < dataRowStartIndex) continue
        const obj = {}
        for (let j = 0; j < row.length; j++) {
            obj[keys[j]] = row[j]
        }
        result.push(obj)
    }

    return result;
}

/**
 * 날짜 형식을 yyyy-MM-dd 형식으로 반환한다.
 * @param {String} s 문자형식의 날짜.
 */
function toDate(s) {
    if (s.length == 6) {
        // yyMMdd
        const updated = '20' + s.slice(0, 2) + '-' + s.slice(2, 4) + '-' + s.slice(4)
        return Utilities.formatDate(new Date(Date.parse(`${updated}`)), 'KST', 'yyyy-MM-dd')
    } else if (s.length == 8) {
        if (s.match(/[0-9]{2}-[0-9]{2}-[0-9]{2}/)) {
            // yy-MM-dd
            return Utilities.formatDate(new Date(Date.parse(`20${s}`)), 'KST', 'yyyy-MM-dd')
        } else {
            // yyyyMMdd
            const updated = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6)
            return Utilities.formatDate(new Date(Date.parse(`${updated}`)), 'KST', 'yyyy-MM-dd')
        }
    } else if (s.length == 10) {
        return Utilities.formatDate(new Date(Date.parse(s)), 'KST', 'yyyy-MM-dd')
    } else {
        throw new Error(`Unsupported date value ${s}`)
    }
}

function alert(message) {
    var ui = SpreadsheetApp.getUi()
    ui.alert(message)
}

function toast(args) {
    if (Array.isArray(args)) SpreadsheetApp.getActiveSpreadsheet().toast(...args)
    else SpreadsheetApp.getActiveSpreadsheet().toast(args)
}

function parseApiError(e) {
    if (e.contentJson && e.contentJson.error && e.contentJson.error.advice) {
        return e.contentJson.error.advice
    } else if (e.contentJson && e.contentJson.error) {
        return `${e.contentJson.error}`
    } else if (e.contentText) {
        return `${e.contentText}`
    } else {
        return `${e}`
    }
}

function testLibrary() {
    // const settings = readSettings('Settings')
    // console.log(settings)
    // const roouty_key = getSetting('Settings', 'ROOUTY_KEY')
    // console.log(roouty_key)
    // const arr = [
    //   ['key1', 'key2', 'key3'],
    //   ['KEY1', 'KEY2', 'KEY3'],
    //   [1, 2, 3],
    //   ['a', 'b', 'c'],
    //   ['d', 'e', 'f']
    // ]

    // const result = aoaToAoo(arr, 2, 0);aoaToAoo('a', )
    // console.log(JSON.stringify(result, null, 4))
    console.log(toDate('221026'));
    console.log(toDate('20221027'));
    console.log(toDate('2022-10-28'));
    console.log(toDate('22-10-29'));
}

const Library = {
    sleep,
    readSettings,
    getSetting,
    chunk,
    aoaToAoo,
    toDate,
    alert,
    toast,
    parseApiError
}