// 製作遊戲地圖: 地雷、空地、指示旁邊有幾個地雷的數字、尺寸
// 10 * 10 按鈕
// 10 個地雷
// click events
// 點到空地會把連續的空地都打開
// 點到地雷gg
// 點到指示就顯示數字
// 點右鍵標記雷區

// 在board加入10 * 10按紐
const board = document.querySelector('.board')
setupBoard()

board.addEventListener('click', (e) => {
  if (e.target.matches('[data-mine]')) {
    return gameover()
  }

  if (e.target.matches('[data-number]')) {
    return showNumber(e.target)
  }

  if (e.target.matches('[data-space]')) {
    return revealSpace(e.target)
  }
})

//
function setupBoard() {
  setMapSize()
  setupButtons()
  const buttons = [...board.querySelectorAll('div')]
  const minesNumbers = setupMines(buttons)
  setupNumbersAroundMines(buttons, minesNumbers)
  coverButtons(buttons)
}

/**
 * 標記地雷旁邊的數字或其他空白地
 * @param {Element} buttons 地圖上100個按鈕
 */
function setupNumbersAroundMines(buttons, minesNumbers) {
  buttons.forEach((button, index) => {
    if (button.dataset.mine === 'mine') return

    const positionsAround = getPositionsAround(index)
    let countMinesAround = 0

    positionsAround.forEach((pos) => {
      if (minesNumbers.includes(pos)) {
        countMinesAround++
      }
    })

    if (countMinesAround > 0) {
      button.dataset.number = countMinesAround
    } else {
      button.dataset.space = ''
    }
  })
}

/**
 *
 * @param {Number} index button 的 index
 * @returns button 附近八個位置
 */
function getPositionsAround(index) {
  const onFirstColumn = index % 10 === 0
  const onLastColumn = index % 10 === 9
  const onFirstRow = index <= 9
  const onLastRow = index >= 90

  const topLeft = index - 11
  const top = index - 10
  const topRight = index - 9
  const left = index - 1
  const right = index + 1
  const bottomLeft = index + 9
  const bottom = index + 10
  const bottomRight = index + 11

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
  const minesNumbers = generateTenNumbers()

  buttons.forEach((button, index) => {
    if (minesNumbers.includes(index)) {
      button.dataset.mine = 'mine'
    }
  })

  return minesNumbers
}

/**
 * 產生10個隨機數字，範圍0到99對應index
 * 標記地雷位置用
 * @returns Numbers Array
 */
function generateTenNumbers() {
  let numbers = []

  for (let i = 0; i < 10; i++) {
    const num = Math.floor(Math.random() * 100)
    numbers.push(num)
  }

  return numbers
}

/**
 * 做100個按鈕
 */
function setupButtons() {
  const fragment = document.createDocumentFragment()

  for (let i = 1; i <= 100; i++) {
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
  document.documentElement.style.setProperty('--size', '10')
}

function coverButtons(buttons) {
  buttons.forEach((button) => {
    button.dataset.status = 'hidden'
  })
}

/**
 * gg 顯示所有地雷
 */
function gameover() {
  const mines = board.querySelectorAll('[data-mine]')
  mines.forEach((element) => {
    element.dataset.status = 'mine'
  })

  setTimeout(() => {
    if (confirm('G_G, press ok to restart.')) {
      board.innerHTML = ''
      setupBoard()
    }
  }, 0)
}

/**
 * recursive 顯示連續空白地
 * @param {Element} element 空白地的按鈕
 */
function revealSpace(element) {
  if (element.dataset.number || !element.hasAttribute('data-status')) return
  delete element.dataset.status

  const adjacentElements = getAdjacentElement(element)

  adjacentElements.forEach((element) => {
    revealSpace(element)
  })
}

/**
 * 回傳圍繞按鈕上下左右的按紐，
 * @param {Element} element 被按到的空地按紐
 * @returns 上下左右的按紐
 */
function getAdjacentElement(element) {
  const buttons = [...board.querySelectorAll('div')]
  const index = buttons.indexOf(element)
  const onFirstColumn = index % 10 === 0
  const onLastColumn = index % 10 === 9
  const onFirstRow = index <= 9
  const onLastRow = index >= 90

  // 上下左右的按紐
  const left = !onFirstColumn && buttons[index - 1]
  const right = !onLastColumn && buttons[index + 1]
  const top = !onFirstRow && buttons[index - 10]
  const bottom = !onLastRow && buttons[index + 10]

  // 過濾掉null false
  const elements = [left, right, top, bottom].filter((entry) => entry)

  return elements
}

/**
 * 顯示數字
 * @param {Element} element 顯示附近地雷的數字按紐
 */
function showNumber(element) {
  element.dataset.status = 'number'
  element.textContent = element.dataset.number
}
