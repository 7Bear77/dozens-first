console.log('dozens of hours of fun');

// library of the cards we want to generate
const cardObjectDefinitions = [
	{ id: 1, imagePath: './styles/img/card-1.png' },
	{ id: 2, imagePath: './styles/img/card-2.png' },
	{ id: 3, imagePath: './styles/img/card-3.png' },
	{ id: 4, imagePath: './styles/img/card-4.png' },
	{ id: 5, imagePath: './styles/img/card-5.png' },
	{ id: 6, imagePath: './styles/img/card-6.png' },
	{ id: 7, imagePath: './styles/img/card-7.png' },
	{ id: 8, imagePath: './styles/img/card-8.png' },
	{ id: 9, imagePath: './styles/img/card-9.png' },
	{ id: 10, imagePath: './styles/img/card-10.png' },
	{ id: 11, imagePath: './styles/img/card-11.png' },
	{ id: 12, imagePath: './styles/img/card-12.png' },
	{ id: 13, imagePath: './styles/img/card-w.png' },
];

const cardBackImgPath = './styles/img/card-back.png';

const stockPileSize = 30;
const numOfPlayers = 2;
const numOfSets = 12;
const maxHandSize = 5;
let globalCardIdCounter = 1;

const cardContainerElem = document.querySelector('.card-container');
const toBeShuffledDiv = document.querySelector('.to-be-shuffled');

const DOM = {
	drawPile: document.querySelector('.draw-pile'),
	playPiles: document.querySelectorAll('.play-pile'),
};

const gameState = {
	drawPile: [],
	buildPiles: [[], [], [], []],
	players: [],
	cardsToBeShuffled: [],
	currentPlayerIndex: 0,
};

function getPlayerZone(playerIndex) {
	const root = document.querySelector(`.pl${playerIndex}`);
	return {
		root,
		handZone: root.querySelector('.hand-zone'),
		stockZone: root.querySelector('.stock-pile'),
		discardZones: root.querySelectorAll('.discard-pile-zone .discard-pile'),
	};
}

function createCard(cardItem) {
	const cardElem = createElement('div');
	const cardInnerElem = createElement('div');
	const cardFrontElem = createElement('div');
	const cardBackElem = createElement('div');

	const cardFrontImg = createElement('img');
	const cardBackImg = createElement('img');

	addClassToElement(cardElem, 'card');
	addClassToElement(cardInnerElem, 'card-inner');
	addClassToElement(cardFrontElem, 'card-front');
	addClassToElement(cardBackElem, 'card-back');

	addIdToElement(cardElem, cardItem.id);

	addSrcToImageElem(cardFrontImg, cardItem.imagePath);
	addSrcToImageElem(cardBackImg, cardBackImgPath);

	addClassToElement(cardFrontImg, 'card-img');
	addClassToElement(cardBackImg, 'card-img');

	addChildElement(cardFrontElem, cardFrontImg);
	addChildElement(cardBackElem, cardBackImg);
	addChildElement(cardInnerElem, cardFrontElem);
	addChildElement(cardInnerElem, cardBackElem);
	addChildElement(cardElem, cardInnerElem);

	return cardElem;
}

function createElement(elemType) {
	return document.createElement(elemType);
}

function addClassToElement(elem, className) {
	elem.classList.add(className);
}

function removeClassFromElement(elem, className) {
	elem.classList.remove(className);
}

function addIdToElement(elem, id) {
	elem.id = id;
}

function addSrcToImageElem(imgElem, src) {
	imgElem.src = src;
}

function addChildElement(parentElem, childElem) {
	if (parentElem) {
		parentElem.appendChild(childElem);
	} else {
		console.log('attempted to append a child to a null parent');
	}
}

function shuffle(array) {
	let currentIndex = array.length;
	while (currentIndex !== 0) {
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
	renderAllZones();
}

function addPlayers() {
	for (let i = 0; i < numOfPlayers; i++) {
		gameState.players.push({
			hand: [],
			stockPile: [],
			discardPiles: [[], [], [], []],
		});
	}
}

function addCardsToStockPile() {
	for (let i = 0; i < numOfPlayers; i++) {
		gameState.players[i].stockPile = gameState.drawPile.splice(
			0,
			stockPileSize
		);
	}
}

function drawCards(player) {
	let cardsToDraw = maxHandSize - gameState.players[player].hand.length;
	let drawPile = gameState.drawPile;

	if (cardsToDraw > 0) {
		let cardsDrawn = gameState.drawPile.splice(0, cardsToDraw);
		gameState.players[player].hand.push(...cardsDrawn);
		renderAllZones();
		if (drawPile.length < maxHandSize) {
			reStock();
		} else {
			return;
		}
	} else {
		console.log('error drawing cards');
		return;
	}
}

function endTheTurn() {
	gameState.currentPlayerIndex =
		(gameState.currentPlayerIndex + 1) % numOfPlayers;
	renderAllZones();
}

function isValidMove(card, buildPile) {
	const nextRequiredCard = buildPile.length + 1;
	return card.id === nextRequiredCard || card.id === 13;
}

function playCard(playerIndex, sourceType, cardSourceIndex, targetPileIndex) {
	const player = gameState.players[playerIndex];
	let source;

	switch (sourceType) {
		case 'stock':
			source = player.stockPile;
			break;
		case 'hand':
			source = player.hand;
			break;
		case 'discard':
			source = player.discardPiles;
			break;
		default:
			console.log('Invalid sourcetype');
			return;
	}

	let card;
	const discardPile = player.discardPiles[cardSourceIndex];

	if (sourceType === 'hand') {
		card = player.hand[cardSourceIndex];
	} else if (sourceType === 'stock') {
		card = player.stockPile[player.stockPile.length - 1];
		determineWinner(playerIndex);
	} else if (sourceType === 'discard') {
		card = discardPile[discardPile.length - 1];
	}

	if (isValidMove(card, gameState.buildPiles[targetPileIndex])) {
		gameState.buildPiles[targetPileIndex].push(card);
		isFullPile(targetPileIndex);
		if (sourceType === 'hand') {
			player.hand.splice(cardSourceIndex, 1);
		} else if (sourceType === 'discard') {
			discardPile.pop();
		} else if (sourceType === 'stock') {
			player.stockPile.pop();
		}
	} else {
		console.log('Invalid Move');
		return;
	}
	renderAllZones();
}

function discardCard(playerIndex, cardSourceIndex, targetPileIndex) {
	const player = gameState.players[playerIndex];
	const card = player.hand[cardSourceIndex];
	player.discardPiles[targetPileIndex].push(card);
	player.hand.splice(cardSourceIndex, 1);
	endTheTurn();
}

function clearFullPlayPile(targetPileIndex) {
	gameState.cardsToBeShuffled.push(...gameState.buildPiles[targetPileIndex]);
	gameState.buildPiles[targetPileIndex] = [];
}

function reStock() {
	shuffle(gameState.cardsToBeShuffled);
	gameState.drawPile.push(...gameState.cardsToBeShuffled);
}

function isFullPile(targetPileIndex) {
	const pile = gameState.buildPiles[targetPileIndex];
	if (pile.length === 12) {
		clearFullPlayPile(targetPileIndex);
	} else {
		return;
	}
}

function startGame() {
	addPlayers();
	const allCards = addCardsToArray(gameState.drawPile);
	shuffle(gameState.drawPile);
	addCardsToStockPile();
	drawCards(gameState.currentPlayerIndex);
	renderAllZones();
}

function createCards() {
	for (i = 0; i < numOfSets; i++) {
		{
			cardObjectDefinitions.forEach((cardItem) => {
				createCard(cardItem);
			});
		}
	}
}

function addCardsToArray(location) {
	const cards = Array.from({ length: numOfSets }).flatMap(() =>
		cardObjectDefinitions.map((card) => ({
			...card,
			instanceId: globalCardIdCounter++,
		}))
	);
	location.push(...cards);
	return cards;
}

function renderPile(cards, container, options = {}) {
	container.innerHTML = '';
	cards.forEach((card) => {
		const cardEl = createCard(card, options);
		container.appendChild(cardEl);
	});
}

function renderAllZones() {
	renderPile(gameState.drawPile, DOM.drawPile);
	gameState.buildPiles.forEach((pile, i) => {
		renderPile(pile, DOM.playPiles[i]);
	});
	gameState.players.forEach((player, playerIndex) => {
		const playerZone = getPlayerZone(playerIndex);
		renderPile(player.hand, playerZone.handZone);
		if (playerZone.stockZone) {
			renderPile(player.stockPile, playerZone.stockZone);
		}
		player.discardPiles.forEach((discardPile, dIndex) => {
			renderPile(discardPile, playerZone.discardZones[dIndex]);
		});
	});
}

function determineWinner(playerIndex) {
	const player = gameState.players[playerIndex];
	if (player.stockPile.length === 0) {
		console.log('you win the game');
	} else {
		return;
	}
}

function hideFunctions() {
	let functions = document.querySelector('.control-buttons');
	functions.classList.toggle('hidden');
}

const gameBoard = document.querySelector('.game-board');
let selectedCard = {
	playerIndex: null,
	sourceType: null,
	cardIndex: null,
	cardEl: null,
};

gameBoard.addEventListener('click', (event) => {
	const cardEl = event.target.closest('.card');
	if (!cardEl) return;
	const discardPileChoice = event.target.closest('.discard-pile');
	const playPileChoice = event.target.closest('.play-pile');
	const currentPlayer = gameState.players[gameState.currentPlayerIndex];
	const playerHand = currentPlayer.hand;
	const player = cardEl.closest('[class^="pl"]');
	const discard = cardEl.closest('[class^="d"]');
	let cardPos;
	let playerIndex = null;
	let zoneType = null;

	if (player) {
		const playerClasses = Array.from(player.classList);
		const plClass = playerClasses.find((cls) => /^pl\d+$/.test(cls));
		playerIndex = plClass ? Number(plClass.replace('pl', '')) : null;
	}

	if (cardEl.closest('.hand-zone')) {
		zoneType = 'hand';
		cardPos = playerHand.findIndex((card) => card.id === Number(cardEl.id));
	} else if (cardEl.closest('.discard-pile')) {
		zoneType = 'discard';
		const discardClasses = Array.from(discard.classList);
		const discardPile = discardClasses.find((cls) => /^d\d+$/.test(cls));
		cardPos = discardPile ? Number(discardPile.replace('d', '')) : null;
	} else if (cardEl.closest('.stock-pile')) {
		zoneType = 'stock';
	}

	if (zoneType == 'stock') {
		cardPos = currentPlayer.stockPile.length - 1;
		console.log('stock pile ' + cardPos);
	} else if (zoneType == 'discard') {
		cardPos = currentPlayer.discardPiles[cardPos].length - 1;
		console.log('discard ' + cardPos);
	} else if (zoneType == 'hand') {
		cardPos = cardPos;
		console.log('hand ' + cardPos);
	}

	if (playerIndex === gameState.currentPlayerIndex) {
		if (!selectedCard.cardEl) {
			selectedCard = {
				playerIndex,
				sourceType: zoneType,
				cardIndex: cardPos,
				cardEl: cardEl,
			};
			console.log(selectedCard);
		}
	} else {
		console.log('not your card to play!');
		return;
	}
});

document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('.start-game').addEventListener('click', () => {
		startGame();
	});
	document.querySelector('.log-game-state').addEventListener('click', () => {
		console.log(gameState);
	});
	document.querySelector('.play-card').addEventListener('click', () => {
		playCard(
			prompt('playerIndex'),
			prompt('sourceType'),
			prompt('cardSourceIndex'),
			prompt('targetPileIndex')
		);
	});
	document.querySelector('.discard-card').addEventListener('click', () => {
		discardCard(gameState.currentPlayerIndex, 0, 0);
	});
	document.querySelector('.draw-cards').addEventListener('click', () => {
		drawCards(gameState.currentPlayerIndex);
	});
	document.querySelector('.re-stock').addEventListener('click', () => {
		reStock();
	});
	document.querySelector('.render').addEventListener('click', renderAllZones);
	document.querySelector('.hide').addEventListener('click', hideFunctions);
});
