function HTMLActuator() {
  this.tileContainer        = document.querySelector(".tile-container");
  this.scoreContainer       = document.querySelector(".score-container");
  this.bestContainer        = document.querySelector(".best-container");
  this.messageContainer     = document.querySelector(".game-message");
  this.achievementContainer = document.querySelector(".achievement");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

// 把div改成了img
HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  if (tile.value > 2048) {
    var inner   =  document.createElement("div");
  } else {
    var inner   =  document.createElement("img");
  }
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);
  this.applyImage(inner, tile.value)

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
      self.applyImage(wrapper, tile.value)
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);
    this.applyImage(wrapper, tile.value)

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
    this.applyImage(wrapper, tile.value)
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

// 通过value添加图片
// 从2到2048分别是：
// 草方块 橡木 工作台 圆石 铁矿 钻石矿 黑曜石 地狱砖块 远古残骸 末地石 龙蛋
HTMLActuator.prototype.applyImage = function (element, value) {
  element.setAttribute("src", "img/" + value + ".webp");
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "你赢了!" : "你死了!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

// 更新成就
HTMLActuator.prototype.updateAchievement = function (achievementIndex) {
  var achievementText = this.achievementContainer.querySelector(".achievement-text");
  switch (achievementIndex){
    case 16:
      achievementText.textContent = "石器时代";
      break;
    case 32:
      achievementText.textContent = "来硬的";
      break;
    case 64:
      achievementText.textContent = "钻石！";
      break;
    case 128:
      achievementText.textContent = "冰桶挑战";
      break;
    case 256:
      achievementText.textContent = "勇往直下";
      break;
    case 512:
      achievementText.textContent = "深藏不露";
      break;
    case 1024:
      achievementText.textContent = "结束了？";
      break;
    case 2048:
      achievementText.textContent = "下一世代";
      break;
    default:
      return;
  }

  if (!this.achievementContainer.classList.contains("activation-achievement")) {
    this.achievementContainer.classList.add("activation-achievement");
  } else {
    this.achievementContainer.getAnimations()[0].play();
  }
};