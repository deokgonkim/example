function onOpen() {
    var ui = SpreadsheetApp.getUi()
    ui.createMenu('주문 검증')
        .addItem('초기화', 'menuClearResultField')
        .addItem('주문 검증', 'menuValidateOrders')
        .addToUi()
    ui.createMenu('주문관리')
        .addItem('주문 등록', 'menuOrderCreate')
        .addToUi()
}

function menuValidateOrders() {
    var ui = SpreadsheetApp.getUi()
    ui.alert('주문 검증을 시작합니다');
    try {
        ORDER.validateOrders('Sheet1', 3);
    } catch (e) {
        ui.alert(e.message);
    }
}

function menuClearResultField() {
    ORDER.clearResultField('Sheet1', 3)
}

function menuOrderCreate() {
    var ui = SpreadsheetApp.getUi()
    ui.alert('주문등록을 시작합니다');
    ORDER.readSheet1('Sheet1', 3)
}
