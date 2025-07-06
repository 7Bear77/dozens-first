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
let discardPileIncrement = 5;

const DOM = {
	drawPile: document.querySelector('.draw-pile'),
	playPiles: document.querySelectorAll('.play-pile'),
	cardsToShuffle: document.querySelector('.to-be-shuffled'),
	playPileText: document.querySelectorAll('.play-pile-text'),
	hands: document.querySelectorAll('.hand-zone'),
	gameBoard: document.querySelector('.game-board'),
	startGame: document.getElementById('start-game'),
	mainMenu: document.querySelector('.main-menu'),
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
	if (elem) {
		elem.classList.remove(className);
	} else {
		console.log('can not add class to undefined element');
	}
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
		renderAllZones();
		return;
	}
}

function endTheTurn() {
	gameState.currentPlayerIndex =
		(gameState.currentPlayerIndex + 1) % numOfPlayers;
	updateCurrentPlayerIndicator();
	renderAllZones();
}

function updateCurrentPlayerIndicator() {
	const playerIndex = gameState.currentPlayerIndex;
	const currentPlayer = gameState.players[playerIndex];
	const playerHand = DOM.hands[playerIndex];
	const otherHands = [...DOM.hands];
	otherHands.splice(playerIndex, 1);
	if (currentPlayer) {
		addClassToElement(playerHand, 'green');
		removeClassFromElement(playerHand, 'red');
		otherHands.forEach((hand) => {
			addClassToElement(hand, 'red');
			removeClassFromElement(hand, 'green');
		});
	}
}

function isValidMove(card, buildPile) {
	const nextRequiredCard = buildPile.length + 1;
	return card.id === nextRequiredCard || card.id === 13;
}

function playCard(playerIndex, sourceType, cardSourceIndex, targetPileIndex) {
	const player = gameState.players[gameState.currentPlayerIndex];
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
		card =
			player.discardPiles[cardSourceIndex][
				player.discardPiles[cardSourceIndex].length - 1
			];
	}

	if (isValidMove(card, gameState.buildPiles[targetPileIndex])) {
		gameState.buildPiles[targetPileIndex].push(card);
		isFullPile(targetPileIndex);
		updateTopCardText(targetPileIndex);
		if (sourceType === 'hand') {
			player.hand.splice(cardSourceIndex, 1);
			if (player.hand.length === 0) {
				drawCards(gameState.currentPlayerIndex);
				renderAllZones();
			} else {
				renderAllZones();
				return;
			}
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
	drawCards(gameState.currentPlayerIndex);
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
	updateCurrentPlayerIndicator();
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
	const isDiscardPile = container.classList.contains('discard-pile');
	const offset = 20;

	cards.forEach((card, i) => {
		const cardEl = createCard(card, options);
		if (isDiscardPile) {
			cardEl.style.top = `${i * offset}px`;
			cardEl.style.zIndex = i;
		}
		container.appendChild(cardEl);
	});
}

function renderAllZones() {
	renderPile(gameState.drawPile, DOM.drawPile);
	renderPile(gameState.cardsToBeShuffled, DOM.cardsToShuffle);
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

function updateTopCardText(targetPileIndex) {
	const playPilesText = DOM.playPileText;
	const playPilesTextArray = [...playPilesText];
	const pileLength = gameState.buildPiles[targetPileIndex].length;
	playPilesTextArray[targetPileIndex].innerHTML = `TOP CARD: ${pileLength}`;
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
	const discardPileEl = event.target.closest('.discard-pile');
	const playPileEl = event.target.closest('.play-pile');
	const stockPileEl = event.target.closest('.stock-pile');
	const playerZone = event.target.closest('[class^="pl"]');
	let playerIndex = null;

	if (playerZone) {
		const plClass = Array.from(playerZone.classList).find((cls) =>
			/^pl\d+$/.test(cls)
		);
		playerIndex = plClass ? Number(plClass.replace('pl', '')) : null;
	}

	if (
		cardEl &&
		cardEl.closest('.hand-zone') &&
		playerIndex === gameState.currentPlayerIndex
	) {
		const playerHand = gameState.players[playerIndex].hand;
		const cardIndex = playerHand.findIndex(
			(card) => card.id === Number(cardEl.id)
		);
		selectedCard = {
			playerIndex,
			sourceType: 'hand',
			cardIndex,
			cardEl,
		};
		console.log('Card selected from hand:', selectedCard);
		return;
	} else if (
		cardEl &&
		cardEl.closest('.stock-pile') &&
		playerIndex === gameState.currentPlayerIndex
	) {
		const playerStockPile = gameState.players[playerIndex].stockPile;
		const cardIndex = playerStockPile.length - 1;
		selectedCard = {
			playerIndex,
			sourceType: 'stock',
			cardIndex,
			cardEl,
		};
		console.log('Card selected from stock pile:', selectedCard);
		return;
	} else if (
		cardEl &&
		cardEl.closest('.discard-pile') &&
		playerIndex === gameState.currentPlayerIndex
	) {
		const discardPileEl = cardEl.closest('.discard-pile');
		const discardClasses = Array.from(discardPileEl.classList);
		const discardClass = discardClasses.find((cls) => /^d\d+$/.test(cls));
		const discardPileIndex = discardClass
			? Number(discardClass.replace('d', ''))
			: null;
		selectedCard = {
			playerIndex,
			sourceType: 'discard',
			cardIndex: discardPileIndex,
			cardEl,
		};
		console.log('Card selected from discard pile:', selectedCard);
		return;
	}

	// discard card function
	if (
		discardPileEl &&
		selectedCard.cardEl &&
		selectedCard.sourceType === 'hand'
	) {
		const discardClasses = Array.from(discardPileEl.classList);
		const discardClass = discardClasses.find((cls) => /^d\d+$/.test(cls));
		const discardIndex = discardClass
			? Number(discardClass.replace('d', ''))
			: null;
		if (discardIndex !== null) {
			discardCard(
				selectedCard.playerIndex,
				selectedCard.cardIndex,
				discardIndex
			);
			selectedCard = {
				playerIndex: null,
				sourceType: null,
				cardIndex: null,
				cardEl: null,
			};
		}
		return;
	}

	// play card function
	if (playPileEl && selectedCard.cardEl) {
		const playPileClasses = Array.from(playPileEl.classList);
		const playPileClass = playPileClasses.find((cls) => /^p\d+$/.test(cls));
		const playPileIndex = playPileClass
			? Number(playPileClass.replace('p', ''))
			: null;
		playCard(
			selectedCard.playerIndex,
			selectedCard.sourceType,
			selectedCard.cardIndex,
			playPileIndex
		);
		selectedCard = {
			playerIndex: null,
			sourceType: null,
			cardIndex: null,
			cardEl: null,
		};
	}
});

DOM.startGame.addEventListener('click', () => {
	DOM.mainMenu.style.display = 'none';
	DOM.gameBoard.style.display = 'grid';
	startGame();
});
