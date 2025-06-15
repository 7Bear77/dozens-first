console.log('dozens of hours of fun');

// library of the cards we want to generate
const cardObjectDefinitions = [
	{ id: 1, imagePath: '/styles/images/card-1.png' },
	{ id: 2, imagePath: '/styles/images/card-2.png' },
	{ id: 3, imagePath: '/styles/images/card-3.png' },
	{ id: 4, imagePath: '/styles/images/card-4.png' },
	{ id: 5, imagePath: '/styles/images/card-5.png' },
	{ id: 6, imagePath: '/styles/images/card-6.png' },
	{ id: 7, imagePath: '/styles/images/card-7.png' },
	{ id: 8, imagePath: '/styles/images/card-8.png' },
	{ id: 9, imagePath: '/styles/images/card-9.png' },
	{ id: 10, imagePath: '/styles/images/card-10.png' },
	{ id: 11, imagePath: '/styles/images/card-11.png' },
	{ id: 12, imagePath: '/styles/images/card-12.png' },
	{ id: 13, imagePath: '/styles/images/card-w.png' },
];

const cardbackImgPath = '/styles/imgs/card-back.png';
const cardContainerElem = document.querySelector('.card-container');

{
	/* <div class="card">
<div class="card-inner">
    <div class="card-front">
        <img/>
    </div>
    <div class="card-back">
        <img/> */
}

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
	addSrcToImageElem(cardBackImg, cardbackImgPath);

	//assign class to imgs of the card
	addClassToElement(cardFrontImg, 'card-img');
	addClassToElement(cardBackImg, 'card-img');

	//apply propper parent-child relationships, starting with 'youngest' to 'oldest'
	addChildElement(cardFrontElem, cardFrontImg);
	addChildElement(cardBackElem, cardBackImg);
	addChildElement(cardInnerElem, cardFrontElem);
	addChildElement(cardInnerElem, cardbackElem);
	addChildElement(cardElem, cardInnerElem);
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
	imgElemElem.src = src;
}

// creates a parent-child relationship between elems on the DOM
function addChildElement(parentElem, childElem) {
	parentElem.appendChild(childElem);
}
