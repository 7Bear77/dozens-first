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
const drawPileDiv = document.querySelector('.draw-pile');
const playPile0Div = document.querySelector('.play-pile.p0');
const playPile1Div = document.querySelector('.play-pile.p1');
const playPile2Div = document.querySelector('.play-pile.p2');
const playPile3Div = document.querySelector('.play-pile.p3');
const player0HandDiv = document.querySelector('.p0 .hand-zone');
const player0Discard0Div = document.querySelector('.p0 .discard-pile-zone .d0');
const player0Discard1Div = document.querySelector('.p0 .discard-pile-zone .d1');
const player0Discard2Div = document.querySelector('.p0 .discard-pile-zone .d2');
const player0Discard3Div = document.querySelector('.p0 .discard-pile-zone .d3');
const player0StockPileDiv = document.querySelector('.p0 .stock-pile');
const player1HandDiv = document.querySelector('.p1 .hand-zone');
const player1Discard0Div = document.querySelector('.p1 .discard-pile-zone .d0');
const player1Discard1Div = document.querySelector('.p1 .discard-pile-zone .d1');
const player1Discard2Div = document.querySelector('.p1 .discard-pile-zone .d2');
const player1Discard3Div = document.querySelector('.p1 .discard-pile-zone .d3');
const player1StockPileDiv = document.querySelector('.p1 .stock-pile');

function addCardsToArray(location) {
	const cards = Array.from({ length: numOfSets }).flatMap(() =>
		cardObjectDefinitions.map((card) => ({
			...card,
		}))
	);
	location.push(...cards);
}

const gameState = {
	drawPile: [],
	buildPiles: [[], [], [], []],
	players: [],
	cardsToBeShuffled: [],
	currentPlayerIndex: 0,
};

// dynamically creates our card
function createCard(cardItem) {
	// create the div elements that make up the bones of the card
	const cardElem = createElement('div');
	const cardInnerElem = createElement('div');
	const cardFrontElem = createElement('div');
	const cardBackElem = createElement('div');

	// create images for the card
	const cardFrontImg = createElement('img');
	const cardBackImg = createElement('img');

	//adds classes to the appropriate elements
	addClassToElement(cardElem, 'card');
	addClassToElement(cardInnerElem, 'card-inner');
	addClassToElement(cardFrontElem, 'card-front');
	addClassToElement(cardBackElem, 'card-back');

	//adds id to card based on id in our library
	addIdToElement(cardElem, cardItem.id);

	//add src attribute and appropriate value to the img element
	addSrcToImageElem(cardFrontImg, cardItem.imagePath);
	addSrcToImageElem(cardBackImg, cardBackImgPath);

	//assign class to imgs of the card
	addClassToElement(cardFrontImg, 'card-img');
	addClassToElement(cardBackImg, 'card-img');

	//apply propper parent-child relationships, starting with 'youngest' to 'oldest'
	addChildElement(cardFrontElem, cardFrontImg);
	addChildElement(cardBackElem, cardBackImg);
	addChildElement(cardInnerElem, cardFrontElem);
	addChildElement(cardInnerElem, cardBackElem);
	addChildElement(cardElem, cardInnerElem);

	//add the cards to the container
	addChildElement(drawPileDiv, cardElem);
}

// will create an html element of elemType
function createElement(elemType) {
	return document.createElement(elemType);
}

// will add a class to an html element
function addClassToElement(elem, className) {
	elem.classList.add(className);
}

// will remove a class from an html element
function removeClassFromElement(elem, className) {
	elem.classList.remove(className);
}

// will add a unique id to the element
function addIdToElement(elem, id) {
	elem.id = id;
}

// will add appropriate path for img elements
function addSrcToImageElem(imgElem, src) {
	imgElem.src = src;
}

// creates a parent-child relationship between elems on the DOM
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
		if (drawPile.length < maxHandSize) {
			reStock();
		} else {
			return;
		}
	} else {
		console.log('error drawing cards');
		return;
	}
	reRenderCards();
}

function endTheTurn() {
	gameState.currentPlayerIndex =
		(gameState.currentPlayerIndex + 1) % numOfPlayers;
}

function isValidMove(card, buildPile) {
	const topCard = buildPile[buildPile.length - 1];
	const topCardValue = topCard?.id ?? 0;
	const cardValue = card.id;
	const nextRequiredCard = topCardValue + 1;
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
		determineWinner();
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
	addCardsToArray(gameState.drawPile);
	shuffle(gameState.drawPile);
	addCardsToStockPile();
	drawCards(gameState.currentPlayerIndex);
	console.log(gameState);
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

function renderCardsInPile(location) {
	location.forEach((cardItem) => {
		createCard(cardItem);
	});
}

function reRenderCards(location) {
	location.innerHTML = '';
	renderCardsInPile(location);
}

function determineWinner(playerIndex) {
	const player = gameState.players[currentPlayerIndex];
	if (player.stockPile.length === 0) {
		console.log('you win the game');
	} else {
		return;
	}
}

startGame();
renderCardsInPile(gameState.drawPile);
// createCards();
