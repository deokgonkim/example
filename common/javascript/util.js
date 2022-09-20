
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

module.exports = {
    chunk
}
