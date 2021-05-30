// 製作遊戲地圖: 地雷、空地、指示旁邊有幾個地雷的數字、尺寸
// 10 * 10 按鈕
// 10 個地雷
// click events
// 點到空地會把連續的空地都打開
// 點到地雷gg
// 點到指示就顯示數字
// 點右鍵標記雷區

// 在board加入10 * 10按紐
const BOARD_SIZE = 15
const BUTTONS_AMOUNT = BOARD_SIZE * BOARD_SIZE
const MINES_AMOUNT = 30
const board = document.querySelector('.board')
setupBoard()

board.addEventListener('click', (e) => {
  if (e.target.matches('[data-status="marked"]')) return

  if (e.target.matches('[data-mine]')) {
    return gameover(e.target)
  }

  if (e.target.matches('[data-number]')) {
    return showNumber(e.target)
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
})

// 初始化遊戲
function setupBoard() {
  setMapSize()
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
 * @returns 鄰近按鈕的 index，最多八個
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
 * @param {Element} buttons 地圖上100個按鈕
 * @returns mines numbers 1 ~ 100
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

function styleMine(element) {
  element.classList.add('bg-mine')
  element.style.setProperty('--bg-mine', Math.random() * 720)

  const div = document.createElement('div')
  div.classList.add('fg-mine')

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

    if (numbers.includes(num)) {
      continue
    } else {
      numbers.push(num)
    }

    if (numbers.length === MINES_AMOUNT) break
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

function coverButtons(buttons) {
  buttons.forEach((button) => {
    button.dataset.status = 'hidden'
  })
}

/**
 * gg 顯示所有地雷，按到的那顆先顯示，其他的陸續顯示
 */
function gameover(target) {
  // 顯示按到的那顆地雷
  target.dataset.status = 'mine'

  // 找出剩下的地雷
  const mines = [...board.querySelectorAll('[data-mine]')]
  const restOfMines = mines.filter((mine) => mine !== target)

  // 顯示剩下的地雷
  revealMines(restOfMines)

  // FIXME: 先別GG
  setTimeout(() => {
    if (confirm('G_G, press ok to restart.')) {
      board.innerHTML = ''
      setupBoard()
    }
  }, 0)
}

/**
 * recursive 顯示所有地雷
 * @param {Element} mines 地雷元素陣列
 * @param {Number} currentMineIndex
 */
function revealMines(mines, currentMineIndex = 0) {
  let counter = currentMineIndex

  if (counter < mines.length) {
    mines[currentMineIndex].dataset.status = 'mine'
    counter++
    setTimeout(() => {
      revealMines(mines, counter)
    }, Math.random() * 500)
  }
}

/**
 * recursive 顯示連續空地或數字
 * @param {Element} element 空地的按鈕
 */
function revealSpace(element) {
  // 如果已經是空地就中斷，不然會無限迴圈
  if (!element.hasAttribute('data-status')) return

  // 顯示空地
  delete element.dataset.status

  // 相連的上下左右元素
  const adjacentElements = getAdjacentElement(element)

  //一個一個揭開
  setTimeout(() => {
    adjacentElements.forEach((element) => {
      // 如果旁邊是數字
      if (element.dataset.number) {
        showNumber(element)
      } else {
        // 旁邊是空地就 recursive
        revealSpace(element)
      }
    })
  }, 60)
}

/**
 * 回傳圍繞按鈕上下左右的按紐，
 * @param {Element} element 被按到的空地按紐
 * @returns 上下左右的按紐
 */
function getAdjacentElement(element) {
  const buttons = [...board.querySelectorAll('.board>div')]
  // 用 ('div') 地雷裡的div也被會選到，所以要再區分

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

  // 過濾掉null false
  return [left, right, top, bottom].filter((entry) => entry)
}

/**
 * 顯示數字
 * @param {Element} element 顯示附近地雷的數字按紐
 */
function showNumber(element) {
  element.dataset.status = 'number'
  element.textContent = element.dataset.number

  const adjacentElements = getAdjacentElement(element)
}

/**
 * 切換右鍵的標記
 * @param {Element} element
 */
function toggleMarker(element) {
  if (element.dataset.status === 'marked') {
    element.dataset.status = 'hidden'
    console.log(element.dataset.status)
  } else {
    element.dataset.status = 'marked'
  }
}
