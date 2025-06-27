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

const stockPileSize = 30;
const numOfPlayers = 2;
const numOfSets = 12;
let globalCardIdCounter = 1;
const maxHandSize = 5;

const cardBackImgPath = './styles/img/card-back.png';
const cardContainerElem = document.querySelector('.card-container');

const gameState = {
	drawPile: Array.from({ length: numOfSets }).flatMap(() =>
		cardObjectDefinitions.map((card) => ({
			...card,
			instanceId: globalCardIdCounter++,
		}))
	),
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
	addChildElement(cardContainerElem, cardElem);
}

// will create an html element of elemType
function createElement(elemType) {
	return document.createElement(elemType);
}

// will add a class to an html element
function addClassToElement(elem, className) {
	elem.classList.add(className);
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
	parentElem.appendChild(childElem);
}

function shuffle(array) {
	let currentIndex = array.length;
	while (currentIndex != 0) {
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
	addPlayers();
	for (let i = 0; i < numOfPlayers; i++) {
		gameState.players[i].stockPile = gameState.drawPile.splice(
			0,
			stockPileSize
		);
	}
}

function drawCards(player) {
	let cardsToDraw = maxHandSize - gameState.players[player].hand.length;
	if (cardsToDraw > 0) {
		let cardsDrawn = gameState.drawPile.splice(0, cardsToDraw);
		gameState.players[player].hand.push(...cardsDrawn);
	}
	endTheTurn();
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
	card = player.hand[cardSourceIndex];
	console.log(gameState.players.discardPiles);
	player.discardPiles[targetPileIndex].push(card);
	player.hand.splice(cardSourceIndex, 1);
	endTheTurn();
	console.log(gameState);
}

function clearFullPlayPile(targetPileIndex) {
	gameState.cardsToBeShuffled.push(...gameState.piles[targetPileIndex]);
}

function reStock() {
	shuffle(gameState.cardsToBeShuffled);
	gameState.drawPile.push(...gameState.cardsToBeShuffled);
}

function isFullPile(targetPileIndex) {
	const pile = gameState.buildPiles[targetPileIndex];
	if (pile.length === 12) {
		clearFullPlayPile();
	} else {
		return;
	}
}

shuffle(gameState.drawPile);
addCardsToStockPile();
drawCards(gameState.currentPlayerIndex);
drawCards(gameState.currentPlayerIndex);
console.log(gameState);
