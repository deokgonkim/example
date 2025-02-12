// https://developers.google.com/apps-script/guides/sheets

/**
 * @param {string} sheet_name
 * @param {boolean} create_new
 */
function getSheetByName(sheet_name, create_new) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheet_name)
    const lastIndex = SpreadsheetApp.getActiveSpreadsheet().getSheets().length
    if (sheet == null) {
        if (create_new) {
            return SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheet_name, lastIndex)
        } else {
            throw new Error(`Sheet ${sheet_name} not found`)
        }
    }
    return sheet
}

/**
 * 시트를 읽어 배열로 반환한다.
 * @param {String} sheet_name 시트명
 * @param {Number} data_row_index(Optional) 데이터 줄번호 (starting with 1, default 1)
 * @param {Number} header_row_index(Optional) 헤더 키 줄번호 (starting with 1, default 2)
 * @param {Boolean} as_aoo(Optional) 배열을 ArrayOfObject로 반환여부 (default false)
 * @param {Array<String>} Optional. mandatory_fields 필수 컬럼명
 * @returns
 */
function readSheet(sheet_name, data_row_index, header_row_index, as_aoo, mandatory_fields) {
    if (header_row_index == undefined) {
        header_row_index = 1
    }
    if (data_row_index == undefined) {
        data_row_index = 2
    }
    if (mandatory_fields == undefined) {
        mandatory_fields = []
    }
    if (header_row_index < 1 || data_row_index < 1) {
        throw new Error(`Invalid row number received ${data_row_index} ${header_row_index}`)
    }

    const sheet = getSheetByName(sheet_name)

    const data = sheet.getDataRange().getValues()

    const result = []

    // header 세팅
    result.push(data[header_row_index - 1])

    // mandatory_fields 체크
    for (const key of mandatory_fields) {
        const header = result[0]
        if (header.indexOf(key) == -1) {
            throw new Error(`Mandatory field ${key} not found`)
        }
    }

    // 데이터 읽어오기
    for (let i = 1; i <= data.length; i++) {
        if (i < data_row_index) {
            continue
        }
        if (i == header_row_index) {
            continue
        }

        result.push(data[i - 1])
    }

    if (as_aoo) {
        return Library.aoaToAoo(result, 0, 1);
    } else {
        return result
    }
}

/**
 * update value at cell
 * @param {String} sheet_name
 * @param {{row, column} | [row, column] | 'A1'} range_value Start with 1
 * @param {String} value
 * @param {String} bgColor cellBackgroundColor
 * @param {String} fontColor fontColor
 */
function updateValueAt(sheet_name, range_value, value, bgColor, fontColor) {
    var sheet = getSheetByName(sheet_name)
    let range
    if (range_value.row && range_value.column) {
        // range_value = { row: 1, column: 1 }
        const { row, column } = range_value
        range = sheet.getRange(row, column)
    } else if (Array.isArray(range_value) && range_value.length == 2) {
        // range_value = [1, 1] // [row, column]
        range = sheet.getRange(...range_value)
    } else {
        // range_value = 'A1'
        range = sheet.getRange(range_value)
    }
    range.setValue(value)

    if (bgColor) range.setBackgrounds([[bgColor]])
    if (fontColor) range.setFontColors([[fontColor]])
    return range
}

function testSheetApi() {
    const sheet_name = 'Sheet1'
    // const sheet = getSheetByName(sheet_name, true)
    // console.log(sheet)
    // const result = readSheet(sheet_name)
    // console.log(result)
    // const result = readSheet(sheet_name, 1, ['consignee_name', 'consignee_phone', 'product_name', 'qty'])
    // console.log(result)
    // updateValueAt(sheet_name, {row: 1, column: 1}, 'rc11')
    const result = readSheetAsArrayOfObject(sheet_name, 2, 1, true, ['order date'])
    console.log(JSON.stringify(result.slice(0, 4), null, 4));
}

const SheetApi = {
    getSheetByName,
    readSheet,
    updateValueAt
}
