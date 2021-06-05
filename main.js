const board = document.querySelector('.board')
const minesInput = document.querySelector('[data-mines-amount-input]')
const minesAmountDisplay = document.querySelector('[data-mines-amount-text]')
const boardSizeInput = document.querySelector('[data-board-size-input]')
const boardSizeDisplay = document.querySelector('[data-board-size-text]')
const colorInput = document.querySelector('[data-theme-input]')
const startButton = document.querySelector('[data-start]')
const errorDisplay = document.querySelector('[data-error-message]')
const MineLeftText = document.querySelector('[data-mine-left]')

// !input value 是 String
let BOARD_SIZE = parseInt(boardSizeInput.value),
  BUTTONS_AMOUNT = BOARD_SIZE * BOARD_SIZE,
  MINES_AMOUNT = parseInt(minesInput.value),
  COLOR_VALUE = parseInt(colorInput.value),
  CURRENT_TOTAL_MINES = MINES_AMOUNT,
  ERROR = null,
  G_G = false

setupBoard()

colorInput.addEventListener('input', handleColorInput)

minesInput.addEventListener('input', handleMineInput)

boardSizeInput.addEventListener('input', handleBoardSizeInput)

startButton.addEventListener('click', handleStartButton)

board.addEventListener('click', (e) => {
  if (G_G && confirm('Try again?')) {
    return setupBoard()
  }

  if (e.target.matches('[data-status="marked"]')) return

  if (e.target.matches('[data-mine]')) {
    return gameover(e.target)
  }

  if (e.target.matches('[data-number]')) {
    showNumber(e.target)
    return
  }

  if (e.target.matches('[data-space]')) {
    return revealSpace(e.target)
  }
})

// 右鍵
board.addEventListener('contextmenu', (e) => {
  e.preventDefault()

  if (
    !e.target.matches('[data-status="hidden"]') &&
    !e.target.matches('[data-status="marked"]')
  ) {
    return
  }

  toggleMarker(e.target)
  updateMinesLeftText()
})

// 初始化遊戲
function setupBoard() {
  resetState()
  displayText()
  storeMinesNumber()
  setMapSize()
  setMapTheme()
  setupButtons()
  const buttons = [...board.querySelectorAll('div')]
  const minesNumbers = setupMines(buttons)
  setupNumbersAroundMines(buttons, minesNumbers)
  coverButtons(buttons)
}

/**
 * 標記地雷旁邊的數字和其他空白地
 * @param {Element} buttons 地圖上所有按鈕
 */
function setupNumbersAroundMines(buttons, minesNumbers) {
  buttons.forEach((button, index) => {
    if (button.dataset.mine === 'mine') return

    const positionsAround = getPositionsAround(index)
    let adjacentMinesCount = 0

    positionsAround.forEach((pos) => {
      if (minesNumbers.includes(pos)) {
        adjacentMinesCount++
      }
    })

    if (adjacentMinesCount > 0) {
      button.dataset.number = adjacentMinesCount
      button.classList.add(`count-${adjacentMinesCount}`)
    } else {
      button.dataset.space = 'space'
    }
  })
}

/**
 * 檢查 button 的位置是不是在地圖邊緣
 * 最左邊、最右邊、第一行、最後一行
 * @param {Number} index button element 在 board 內的 index
 */
function checkPosition(index) {
  const onFirstColumn = index % BOARD_SIZE === 0
  const onLastColumn = index % BOARD_SIZE === BOARD_SIZE - 1
  const onFirstRow = index < BOARD_SIZE
  const onLastRow = index >= BOARD_SIZE * BOARD_SIZE - BOARD_SIZE

  return {
    onFirstColumn,
    onLastColumn,
    onFirstRow,
    onLastRow,
  }
}

/**
 * 取得附近八個位置的 index
 * @param {Number} currentIndex 目前的index
 */
function getPositionsIndex(currentIndex) {
  return {
    topLeft: currentIndex - 1 - BOARD_SIZE,
    top: currentIndex - BOARD_SIZE,
    topRight: currentIndex + 1 - BOARD_SIZE,
    left: currentIndex - 1,
    right: currentIndex + 1,
    bottomLeft: currentIndex - 1 + BOARD_SIZE,
    bottom: currentIndex + BOARD_SIZE,
    bottomRight: currentIndex + 1 + BOARD_SIZE,
  }
}

/**
 * 取得 button element 附近按鈕的 index
 * 要拿來跟地雷的位置比對，標記數字用的
 * @param {Number} index button 的 index
 * @returns 鄰近按鈕的 index，對應方位最多八個
 */
function getPositionsAround(index) {
  const { onFirstColumn, onLastColumn, onFirstRow, onLastRow } =
    checkPosition(index)

  const {
    topLeft,
    top,
    topRight,
    left,
    right,
    bottomLeft,
    bottom,
    bottomRight,
  } = getPositionsIndex(index)

  if (onFirstColumn && onFirstRow) {
    return [bottom, right, bottomRight]
  }

  if (onFirstColumn && onLastRow) {
    return [top, right, topRight]
  }

  if (onLastColumn && onFirstRow) {
    return [left, bottomLeft, bottom]
  }

  if (onLastColumn && onLastRow) {
    return [topLeft, left, top]
  }

  if (onFirstColumn) {
    return [top, bottom, topRight, right, bottomRight]
  }

  if (onLastColumn) {
    return [topLeft, left, bottomLeft, top, bottom]
  }

  if (onFirstRow) {
    return [left, bottomLeft, bottom, right, bottomRight]
  }

  if (onLastRow) {
    return [left, topLeft, top, topRight, right]
  }

  return [topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight]
}

/**
 * 標記地雷
 * @param {HTMLAllCollection} buttons 地圖上所有按鈕
 * @returns 所有地雷的 index
 */
function setupMines(buttons) {
  // 地雷數字陣列
  const minesNumbers = generateMinesNumbers()

  buttons.forEach((button, index) => {
    if (minesNumbers.includes(index)) {
      button.dataset.mine = 'mine'

      styleMine(button)
    }
  })

  return minesNumbers
}

/**
 * 地雷樣式
 * @param {Element} element 地雷元素
 */
function styleMine(element) {
  element.classList.add('bg-mine')
  element.style.setProperty('--bg-mine', Math.random() * 720)

  const div = document.createElement('div')

  element.appendChild(div)
}

/**
 * 產生 MINES_AMOUNT 個不重複隨機數字
 * 範圍0 ~ BUTTONS_AMOUNT
 * 標記地雷位置用
 * @returns Numbers Array
 */
function generateMinesNumbers() {
  let numbers = []

  while (true) {
    const num = Math.floor(Math.random() * BUTTONS_AMOUNT)

    if (!numbers.includes(num)) numbers.push(num)

    if (numbers.length >= MINES_AMOUNT) break
  }

  return numbers
}

/**
 * 做 BUTTONS_AMOUNT 個按鈕到地圖上
 */
function setupButtons() {
  const fragment = document.createDocumentFragment()

  for (let i = 1; i <= BUTTONS_AMOUNT; i++) {
    // 按鈕初始狀態
    const div = document.createElement('div')
    // div.dataset.status = 'hidden'

    // 加入 fragment
    fragment.appendChild(div)
  }

  // 加入處理好的 fragment 到 board
  board.appendChild(fragment)
}

// 用custom property決定地圖尺寸
function setMapSize() {
  document.documentElement.style.setProperty('--size', BOARD_SIZE)
}

/**
 * gg 顯示所有地雷，按到的那顆先顯示，其他的陸續顯示
 */
function gameover(target) {
  G_G = true
  // 顯示按到的那顆地雷
  target.dataset.status = 'mine'

  // 找出剩下的地雷
  const mines = [...board.querySelectorAll('[data-mine]')]
  const restOfMines = mines.filter((mine) => mine !== target)

  // 顯示剩下的地雷
  revealMines(restOfMines)
}

/**
 * recursive 顯示所有地雷
 * @param {Element} mines 地雷元素陣列
 * @param {Number} currentMineIndex
 */
function revealMines(mines, currentMineIndex = 0) {
  // 如果重新開始了，停止掀開炸彈
  if (!G_G) return

  let counter = currentMineIndex

  if (counter < mines.length) {
    mines[currentMineIndex].dataset.status = 'mine'
    counter++
    setTimeout(() => {
      revealMines(mines, counter)
    }, Math.random() * 150)
  }
}

/**
 * recursive 顯示連續空地或數字
 * @param {Element} element 空地的按鈕
 */
function revealSpace(element) {
  // 如果炸掉了就別再掀開空地，不然 confirm 中斷了 revealSpace
  // 重新開始後還是會繼續跑
  // 如果已經是空地就中斷，不然會無限迴圈
  if (G_G || !element.hasAttribute('data-status')) return

  // 顯示空地
  delete element.dataset.status

  // 相連的上下左右元素
  const adjacentElements = getAdjacentElement(element)

  // 這個條件是為了不要呼叫 checkVictory() 那麼多次
  // 散出去的 recursion 只會在周圍元素不是還沒掀開的區域
  // 才呼叫 checkVictory()
  if (
    adjacentElements.top?.dataset?.status === 'hidden' ||
    adjacentElements.right?.dataset?.status === 'hidden' ||
    adjacentElements.bottom?.dataset?.status === 'hidden' ||
    adjacentElements.left?.dataset?.status === 'hidden'
  ) {
    // 一個一個揭開
    setTimeout(() => {
      Object.values(adjacentElements).forEach((element) => {
        if (!element) return
        // 如果旁邊是數字
        if (element.dataset.number) {
          showNumber(element)
        } else {
          // 旁邊是空地就 recursive
          revealSpace(element)
        }
      })
    }, 60)
  } else {
    // 處理 edge case 大地圖 少地雷
    // 按一下直接贏的狀況
    checkVictory()

    // marker 被 revealSpace，所以要更新
    updateMinesLeftText()
  }

  // 移除空地旁數字的 border
  removeBorders(adjacentElements)
}

/**
 * 回傳圍繞按鈕上下左右的按紐，
 * @param {Element} element 被按到的空地按紐
 * @returns 上下左右的按紐
 */
function getAdjacentElement(element) {
  const buttons = [...board.querySelectorAll('.board>div')]
  // 用 ('div') 地雷裡的 div 也被會選到，所以要再區分

  const index = buttons.indexOf(element)
  const { onFirstColumn, onLastColumn, onFirstRow, onLastRow } =
    checkPosition(index)

  const {
    left: leftElementIndex,
    right: rightElementIndex,
    top: topElementIndex,
    bottom: bottomElementIndex,
  } = getPositionsIndex(index)

  // 上下左右的按紐
  const left = !onFirstColumn && buttons[leftElementIndex]
  const right = !onLastColumn && buttons[rightElementIndex]
  const top = !onFirstRow && buttons[topElementIndex]
  const bottom = !onLastRow && buttons[bottomElementIndex]

  return { left, right, top, bottom }
}

/**
 * 顯示數字
 * @param {Element} element 顯示附近地雷的數字按紐
 */
function showNumber(element) {
  element.dataset.status = 'number'
  element.textContent = element.dataset.number
  borderController(element)

  // 通常最後勝利前是打開數字
  // 所以在這裡檢查
  checkVictory()
}

/**
 * 切換右鍵的標記
 * @param {Element} element
 */
function toggleMarker(element) {
  if (element.dataset.status === 'marked') {
    element.dataset.status = 'hidden'
  } else {
    element.dataset.status = 'marked'
  }
}

/**
 * 把緊鄰空地的數字元素的 border 移除
 * @param {Object} adjacentElements 空地旁的上下左右元素
 */
function removeBorders(adjacentElements) {
  if (adjacentElements.left) {
    adjacentElements.left.classList.remove('border-right')
  }

  if (adjacentElements.right) {
    adjacentElements.right.classList.remove('border-left')
  }

  if (adjacentElements.top) {
    adjacentElements.top.classList.remove('border-bottom')
  }

  if (adjacentElements.bottom) {
    adjacentElements.bottom.classList.remove('border-top')
  }
}

/**
 * 處理連續的數字元素 border 的顯示
 * @param {Element} element 顯示數字的按鈕
 */
function borderController(element) {
  const { left, right, top, bottom } = getAdjacentElement(element)

  // 左邊有元素時
  if (left) {
    // 如果左邊元素不是數字，而且還沒按過，加上border left
    if (left.dataset.status === 'hidden' && left.dataset.status !== 'number') {
      element.classList.add('border-left')
    }

    // 如果左邊元素是數字，移除他的border right
    if (left.dataset.status === 'number') {
      left.classList.remove('border-right')
    }
  }

  // 右邊有元素時
  if (right) {
    // 如果右邊元素是數字，移除他的border left
    if (right.dataset.status === 'number') {
      right.classList.remove('border-left')
    }

    // 如果右邊元素不是數字，而且還沒按過，加上border right
    if (
      right.dataset.status === 'hidden' &&
      right.dataset.status !== 'number'
    ) {
      element.classList.add('border-right')
    }
  }

  // 上方有元素時
  if (top) {
    // 如果上方元素不是數字，而且還沒按過，加上border top
    if (top.dataset.status === 'hidden' && top.dataset.status !== 'number') {
      element.classList.add('border-top')
    }

    // 如果上方元素是數字，移除他的border bottom
    if (top.dataset.status === 'number') {
      top.classList.remove('border-bottom')
    }
  }

  // 下方有元素時
  if (bottom) {
    // 如果下方元素是數字，移除他的border top
    if (bottom.dataset.status === 'number') {
      bottom.classList.remove('border-top')
    }

    // 如果下方元素不是數字，而且還沒按過，加上border bottom
    if (
      bottom.dataset.status === 'hidden' &&
      bottom.dataset.status !== 'number'
    ) {
      element.classList.add('border-bottom')
    }
  }
}

/**
 * 遊戲初始化後把按紐蓋起來
 * @param {HTMLAllCollection} buttons 地圖上的按紐
 */
function coverButtons(buttons) {
  buttons.forEach((button) => {
    button.dataset.status = 'hidden'
  })
}

/**
 * 顯示錯誤訊息，因為這個 <p> 是 flex item
 * 就算沒內容 .space-children > * + * 得到的margin
 * 還是會佔著空間，所以用了 display none 把它隱藏
 * @param {String} message 錯誤訊息
 */
function showErrorMessage(message) {
  errorDisplay.textContent = message
  errorDisplay.classList.add('show')
}

/**
 * 隱藏錯誤訊息
 */
function hideErrorMessage() {
  errorDisplay.textContent = ''
  errorDisplay.classList.remove('show')
}

/**
 * 顯示地雷數量和更新 MINES_AMOUNT
 */
function handleMineInput() {
  minesAmountDisplay.textContent = minesInput.value
  MINES_AMOUNT = parseInt(minesInput.value)
}

/**
 * 顯示地圖尺寸和更新 BOARD_SIZE BUTTONS_AMOUNT
 */
function handleBoardSizeInput() {
  boardSizeDisplay.textContent = `${boardSizeInput.value} x ${boardSizeInput.value}`
  BOARD_SIZE = parseInt(boardSizeInput.value)
  BUTTONS_AMOUNT = BOARD_SIZE * BOARD_SIZE
}

/**
 * 地雷數太多顯示錯誤
 * 或重新開始遊戲
 */
function handleStartButton() {
  ERROR = MINES_AMOUNT > BUTTONS_AMOUNT / 2 ? 'Too Many Mines!!!' : null

  // 中斷
  if (ERROR) return showErrorMessage(ERROR)

  // restart
  setupBoard()
}

/**
 * 初始化主題顏色
 */
function setMapTheme() {
  document.documentElement.style.setProperty('--theme', COLOR_VALUE)
}

/**
 * 變換主題顏色
 */
function handleColorInput() {
  COLOR_VALUE = parseInt(colorInput.value)
  document.documentElement.style.setProperty('--theme', COLOR_VALUE)
}

/**
 * 重置參數和隱藏錯誤訊息
 */
function resetState() {
  G_G = false
  board.innerHTML = ''
  hideErrorMessage()
}

/**
 * 顯示 Board Size 和 Mines Amount
 */
function displayText() {
  minesAmountDisplay.textContent = MINES_AMOUNT
  boardSizeDisplay.textContent = `${BOARD_SIZE} x ${BOARD_SIZE}`
  MineLeftText.textContent = MINES_AMOUNT
}

/**
 * 如果還沒點的區域跟地雷數一樣就等於勝利了
 */
function checkVictory() {
  const hiddenArea = [...document.querySelectorAll('[data-status=hidden]')]
  if (hiddenArea.length === CURRENT_TOTAL_MINES) {
    alert(`(☞ﾟヮﾟ)☞ ☜(ﾟヮﾟ☜) (☞ﾟヮﾟ)☞ ☜(ﾟヮﾟ☜)`)
  }
}

/**
 * 更新扣掉 marker 後的地雷剩餘數量
 */
function updateMinesLeftText() {
  const markersCount = Array.from(
    document.querySelectorAll('[data-status="marked"]'),
  ).length
  MineLeftText.textContent = MINES_AMOUNT - markersCount
}

/**
 * 按下開始遊戲當下的地雷總數
 * 拿來計算勝利用的
 */
function storeMinesNumber() {
  CURRENT_TOTAL_MINES = MINES_AMOUNT
}
