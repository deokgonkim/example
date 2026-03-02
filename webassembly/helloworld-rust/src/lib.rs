use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn run() -> Result<(), JsValue> {
    let window = web_sys::window().ok_or_else(|| JsValue::from_str("no global `window` exists"))?;
    let document = window
        .document()
        .ok_or_else(|| JsValue::from_str("should have a document on window"))?;

    if let Some(root) = document.get_element_by_id("app") {
        root.set_inner_html("Hello, World from Rust + WebAssembly!");
    }

    web_sys::console::log_1(&"Hello, World from Rust + WebAssembly!".into());
    Ok(())
}
