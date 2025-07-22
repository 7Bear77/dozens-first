console.log('dozens of hours of fun');

// library of the cards we want to generate
const cardObjectDefinitions = [
	{ id: 0, imagePath: './styles/img/card-w.png' },
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
];

let isComputerTurn = false;

const cardBackImgPath = './styles/img/card-back.png';

const stockPileSize = 30;
const numOfPlayers = 2;
const numOfSets = 12;
const maxHandSize = 5;
let globalCardIdCounter = 1;
let discardPileIncrement = 5;
const additionalWilds = numOfSets / 2;

const DOM = {
	drawPile: document.querySelector('.draw-pile'),
	playPiles: document.querySelectorAll('.play-pile'),
	cardsToShuffle: document.querySelector('.to-be-shuffled'),
	playPileText: document.querySelectorAll('.play-pile-text'),
	hands: document.querySelectorAll('.hand-zone'),
	gameBoard: document.querySelector('.game-board'),
	startGame: document.getElementById('start-game'),
	mainMenu: document.querySelector('.main-menu'),
	discardButton0: document.querySelectorAll('.discard-button0'),
	discardButton1: document.querySelectorAll('.discard-button1'),
	discardButton2: document.querySelectorAll('.discard-button2'),
	discardButton3: document.querySelectorAll('.discard-button3'),
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

function createCard(cardItem, options = {}) {
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

	if (options.facedown) {
		cardElem.querySelector('.card-inner').style.transform =
			'rotateY(180deg)';
	}

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
		if (drawPile.length < maxHandSize) reStock();
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
	return card.id === nextRequiredCard || card.id === 0;
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
		return false;
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

	const extraWilds = Array.from({ length: additionalWilds }).map(() => ({
		id: 0,
		imagePath: './styles/img/card-w.png',
		instanceId: globalCardIdCounter++,
	}));
	cards.push(...extraWilds);
	location.push(...cards);
	return cards;
}

function renderPile(cards, container, options = {}) {
	container.innerHTML = '';
	const isDiscardPile = container.classList.contains('discard-pile');
	const isPl0 = container.closest('.pl0');
	const pl0Offset = 20;
	const pl1Offset = -30;

	cards.forEach((card, i) => {
		const isTopCard = i === cards.length - 1;
		const facedown = options.facedown && !isTopCard;
		const cardEl = createCard(card, { ...options, facedown });

		if (isDiscardPile && isPl0) {
			cardEl.style.top = `${i * pl0Offset}px`;
			cardEl.style.zIndex = i;
		} else if (isDiscardPile) {
			cardEl.style.top = `${i * pl1Offset}px`;
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
			renderPile(player.stockPile, playerZone.stockZone, {
				facedown: true,
			});
		}
		player.discardPiles.forEach((discardPile, dIndex) => {
			renderPile(discardPile, playerZone.discardZones[dIndex]);
		});
	});
}

function determineWinner(playerIndex) {
	const player = gameState.players[gameState.currentPlayerIndex];
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

function clearSelectedCard() {
	selectedCard = {
		playerIndex: null,
		sourceType: null,
		cardIndex: null,
		cardEl: null,
	};
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
	const playerZone = event.target.closest('[class^="pl"]');
	let playerIndex = null;

	if (playerZone) {
		const plClass = Array.from(playerZone.classList).find((cls) =>
			/^pl\d+$/.test(cls)
		);
		playerIndex = plClass ? Number(plClass.replace('pl', '')) : null;
	}

	if (selectedCard.cardEl) {
		removeClassFromElement(selectedCard.cardEl, 'selected');
	}
	if (
		cardEl &&
		cardEl.closest('.hand-zone') &&
		playerIndex === gameState.currentPlayerIndex
	) {
		addClassToElement(cardEl, 'selected');
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
		return;
	} else if (
		cardEl &&
		cardEl.closest('.stock-pile') &&
		playerIndex === gameState.currentPlayerIndex
	) {
		addClassToElement(cardEl, 'selected');

		const playerStockPile = gameState.players[playerIndex].stockPile;
		const cardIndex = playerStockPile.length - 1;
		selectedCard = {
			playerIndex,
			sourceType: 'stock',
			cardIndex,
			cardEl,
		};
		return;
	} else if (
		cardEl &&
		cardEl.closest('.discard-pile') &&
		playerIndex === gameState.currentPlayerIndex
	) {
		addClassToElement(cardEl, 'selected');
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
		return;
	}

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
			clearSelectedCard();
		}
		return;
	}

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
		clearSelectedCard();
	}
});

DOM.startGame.addEventListener('click', () => {
	DOM.mainMenu.style.display = 'none';
	DOM.gameBoard.style.display = 'grid';
	startGame();
});

for (let i = 0; i < DOM.discardButton0.length; i++) {
	DOM.discardButton0[i].addEventListener('click', () => {
		if (gameState.currentPlayerIndex === extractClass(event)) {
			discardCard(playerIndex, selectedCard.cardIndex, 0);
		}
	});
}
for (let i = 0; i < DOM.discardButton1.length; i++) {
	DOM.discardButton1[i].addEventListener('click', () => {
		if (gameState.currentPlayerIndex === extractClass(event)) {
			discardCard(playerIndex, selectedCard.cardIndex, 1);
		}
	});
}
for (let i = 0; i < DOM.discardButton2.length; i++) {
	DOM.discardButton2[i].addEventListener('click', () => {
		if (gameState.currentPlayerIndex === extractClass(event)) {
			discardCard(playerIndex, selectedCard.cardIndex, 2);
		}
	});
}
for (let i = 0; i < DOM.discardButton3.length; i++) {
	DOM.discardButton3[i].addEventListener('click', () => {
		if (gameState.currentPlayerIndex === extractClass(event)) {
			discardCard(playerIndex, selectedCard.cardIndex, 3);
		}
	});
}

function extractClass(event) {
	const container = event.target;
	const playerZone = container.closest('[class^="pl"]');
	const plClass = Array.from(playerZone.classList).find((cls) =>
		/^pl\d+$/.test(cls)
	);
	return (playerIndex = plClass ? Number(plClass.replace('pl', '')) : null);
}

let playableCards = [];

function computerCanPlayCard(gameVersion) {
	playableCards = [];
	const playerIndex = gameState.currentPlayerIndex;
	const player = gameState.players[playerIndex];
	const playerHand = player.hand;
	const buildPiles = gameState.buildPiles;
	const playerStock = player.stockPile;
	const stockLengthIndex = playerStock.length - 1;
	const playerDiscards = player.discardPiles;

	for (let pileIndex = 0; pileIndex < buildPiles.length; pileIndex++) {
		if (isValidMove(playerStock[stockLengthIndex], buildPiles[pileIndex])) {
			playableCards.push({
				cardId: playerStock[stockLengthIndex].id,
				pileIndex,
				type: 'stock',
			});
		}
		for (let cardIndex = 0; cardIndex < playerHand.length; cardIndex++) {
			if (isValidMove(playerHand[cardIndex], buildPiles[pileIndex])) {
				playableCards.push({
					cardId: playerHand[cardIndex].id,
					pileIndex,
					type: 'hand',
					cardIndex,
				});
			}
		}

		for (
			let discardIndex = 0;
			discardIndex < playerDiscards.length;
			discardIndex++
		) {
			const discardPile = playerDiscards[discardIndex];
			const topDiscardCard = discardPile[discardPile.length - 1];
			if (
				topDiscardCard &&
				isValidMove(topDiscardCard, buildPiles[pileIndex])
			) {
				playableCards.push({
					cardId: topDiscardCard.id,
					pileIndex,
					type: 'discard',
					discardIndex,
				});
			}
		}
	}
	console.log(playableCards);
	computerTurn();
}

// isValidMove(card, buildPile)
function canReachStock() {
	let gameStateCopy = gameState;
	let stockReached = false;
	const playerIndex = gameState.currentPlayerIndex;
	const player = gameState.players[playerIndex];
	const playerHand = player.hand;
	const buildPiles = gameState.buildPiles;
	const playerStock = player.stockPile;
	const stockLengthIndex = playerStock.length - 1;

	const topCardofPile = [];
	const stockCard = playerStock[stockLengthIndex];

	for (let i = 0; i < gameState.buildPiles.length; i++) {
		topCardofPile.push(gameState.buildPiles[i].length);
	}

	const cardsToReach = [];

	for (let i = 0; i < topCardofPile.length; i++) {
		if (stockCard.id > topCardofPile[i]) {
			let difference = stockCard.id - topCardofPile[i];
			cardsToReach.push({
				difference: difference - 1,
				index: i,
				bigger: true,
			});
		} else {
			let difference = stockCard.id + (12 - topCardofPile[i]);
			cardsToReach.push({
				difference: difference - 1,
				index: i,
				bigger: false,
			});
		}
	}
	console.log(cardsToReach);
	let easiestIndexToReach;
	let smallNum = 12;
	for (let i = 0; i < cardsToReach.length; i++) {
		if (cardsToReach[i].difference < smallNum) {
			smallNum = cardsToReach[i].difference;
			easiestIndexToReach = i;
		}
	}

	const cardsNeededToPlayStock = [];

	if (stockCard.id !== 0) {
		if (cardsToReach[easiestIndexToReach].bigger === true) {
			for (
				let j = stockCard.id - 1;
				j > topCardofPile[easiestIndexToReach];
				j--
			) {
				cardsNeededToPlayStock.push({
					id: j,
					index: cardsToReach[easiestIndexToReach].index,
				});
			}
		} else {
			for (
				let j = topCardofPile[easiestIndexToReach] + 1;
				j !== stockCard.id;
				j++
			) {
				if (j === 13) {
					j = 1;
				}
				cardsNeededToPlayStock.push({
					id: j,
					index: cardsToReach[easiestIndexToReach].index,
				});
			}
		}
	}

	console.log(cardsNeededToPlayStock);

	let COPY = {
		player: gameStateCopy.players[gameStateCopy.currentPlayerIndex],
		playerIndex: gameStateCopy.currentPlayerIndex,
		playableCards: computerCanPlayCard,
		topStock:
			gameStateCopy.players[gameStateCopy.currentPlayerIndex].stockPile
				.length - 1,
	};
	playableTypes = playableCards.map((card) => card.type);
}

// function playCard(playerIndex, sourceType, cardSourceIndex, targetPileIndex) {
function computerTurn() {
	const currentPlayer = gameState.players[gameState.currentPlayerIndex];
	const canPlayStock = playableCards.findIndex(
		(stockCard) => stockCard.type == 'stock'
	);
	const canPlayHand = playableCards.filter((card) => card.type === 'hand');
	const canPlayDiscard = playableCards.filter(
		(card) => card.type === 'discard'
	);
	const stockIndex = currentPlayer.stockPile.length - 1;
	let largestCard = 0;
	const ids = currentPlayer.hand.map((card) => card.id);
	ids.forEach((id) => {
		if (id > largestCard) {
			largestCard = id;
		}
	});
	const discardIndex = currentPlayer.hand.findIndex(
		(item) => item.id === largestCard
	);
	if (canPlayStock !== -1) {
		playCard(
			currentPlayer,
			'stock',
			stockIndex,
			playableCards[canPlayStock].pileIndex
		);
	} else if (canPlayHand[0]) {
		playCard(
			currentPlayer,
			'hand',
			canPlayHand[0].cardIndex,
			canPlayHand[0].pileIndex
		);
	} else if (canPlayDiscard[0]) {
		playCard(
			currentPlayer,
			'discard',
			canPlayDiscard[0].discardIndex,
			canPlayDiscard[0].pileIndex
		);
	} else {
		determineDiscardCard();
	}
}

function determineDiscardCard() {
	const currentPlayer = gameState.players[gameState.currentPlayerIndex];
	const playerIndex = gameState.currentPlayerIndex;
	const playerHand = currentPlayer.hand;
	const playerDiscards = currentPlayer.discardPiles;
	const playerStock = currentPlayer.stockPile;
	const stockCard = playerStock[playerStock.length - 1];

	const discardMatches = [];
	const lastOfDiscards = [];
	const playerHandId = playerHand.map((card) => card.id);

	playerDiscards.forEach((pile) => {
		if (pile.length > 0) {
			lastOfDiscards.push(pile[pile.length - 1]);
		} else {
			lastOfDiscards.push([]);
		}
	});

	const discardsIds = lastOfDiscards.map((card) =>
		card ? card.id : undefined
	);

	let chosenCardId =
		playerHand.length === 1
			? playerHand[0].id
			: playerHand.find((card) => card.id === stockCard.id)?.id ||
			  playerHand.find((card) => discardsIds.includes(card.id))?.id ||
			  Math.max(...playerHandId);

	const chosenCardIndex = playerHand.findIndex(
		(card) => card.id === chosenCardId
	);

	let chosenDiscardIndex;

	const nextHighest = chosenCardId + 1;
	const largerCardsThanChosen = discardsIds.filter((id) => id > chosenCardId);
	const smallerCardsThanChosen = discardsIds.filter(
		(id) => id < chosenCardId
	);

	if (discardsIds.includes(chosenCardId)) {
		chosenDiscardIndex = discardsIds.findIndex(
			(pile) => pile === chosenCardId
		);
		console.log('discarded because match');
	} else if (discardsIds.includes(undefined)) {
		chosenDiscardIndex = discardsIds.findIndex(
			(pile) => pile === undefined
		);
		console.log('discarded because empty pile');
	} else if (discardsIds.includes(stockCard.id)) {
		chosenDiscardIndex = discardsIds.findIndex(
			(pile) => pile === stockCard.id
		);
		console.log('discarded because matches stockpile');
	} else if (discardsIds.includes(nextHighest)) {
		chosenDiscardIndex = discardsIds.findIndex(
			(pile) => pile === nextHighest
		);
		console.log('discarded because next sequential');
	} else if (largerCardsThanChosen.length > 0) {
		const largestDiscardId = Math.max(...largerCardsThanChosen);
		chosenDiscardIndex = discardsIds.findIndex(
			(id) => id === largestDiscardId
		);
		console.log('discarded because pile has larger than chosen');
	} else if (smallerCardsThanChosen.length > 0) {
		const smallestDiscardId = Math.min(...smallerCardsThanChosen);
		chosenDiscardIndex = discardsIds.findIndex(
			(id) => id === smallestDiscardId
		);
		console.log('discarded because pile has smaller than chosen');
	} else {
		chosenDiscardIndex = Math.floor(Math.random * discardsIds.length - 1);
	}

	discardCard(playerIndex, chosenCardIndex, chosenDiscardIndex);
}

document
	.querySelector('.canplay')
	.addEventListener('click', computerCanPlayCard);

document.querySelector('.compturn').addEventListener('click', computerTurn);
document
	.querySelector('.discard')
	.addEventListener('click', determineDiscardCard);
