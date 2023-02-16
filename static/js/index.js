// Load in our js functions
pageLoader()

function pageLoader(){
    //load in event listens to change viewable div
    let links=document.getElementsByClassName("nav-link")
    for(let link of links){
        link.addEventListener("click",(e)=>changeDiv(e))
    }

    //Load Bubble Listeners
    addBubbleListeners()

    // load in event listener for find breweries buttons
    let findBrews=document.querySelector("#find-brews-input")
    findBrews.addEventListener("click", (e)=>findBreweries(e,1)) 
    console.log("page loaded")

    
    // load event listeners for color buttons
    colorButtons=document.getElementsByClassName("light-dark-button")
    for (let btn of colorButtons){
        btn.addEventListener('click', e=>changeBackgroundColor(e))
    }

    //load drag an drop listeners
    loadDragNDropBeer()
}

// To Make the Page a Single Page App We Will swap visible divs on navlink clicks
function changeDiv(e){
    let toTurnOff=document.getElementsByClassName("is-visible")

    for (let element of toTurnOff){
            console.log("turning off", element )
            element.classList.replace("is-visible","is-invisible")
            let navlink=document.getElementsByName(element.id)[0]
            navlink.classList.remove("active")
        }
      
        let toTurnOn=e.target.name
        toTurnOn=document.getElementById(toTurnOn)
        toTurnOn.classList.replace("is-invisible","is-visible")
        e.target.classList.add("active")
        
    // This will turn on an Off the Beer movement depending if we are on the page or not
    handleBeer()
}

// Change the background color based on button clicks
function changeBackgroundColor(e){
    console.log("clicked color button")
    if (e.target.value=="Dark"){
        document.body.style.backgroundColor="#C96E12"
    }else{
        document.body.style.backgroundColor="#FFF897"
    }
}


//Add click listeners to the Bubbles to show how events propagate
function addBubbleListeners(){
    let bubbles=document.getElementsByClassName("bubble")
    //Here you can show adding event.stropPropagation() to the middle bubble will stop the outer bubble from being clicked
    bubbles[0].addEventListener('click', (event)=>{console.log("You clicked outer ... propagrated from:", event.target.id)})
    bubbles[1].addEventListener('click', (event)=>{console.log("You clicked middle ... propagrated from:", event.target.id)})
    bubbles[2].addEventListener('click', (event)=>{console.log("You clicked inner ... propagrated from:", event.target.id)})
}

// Run API call from User Input to get breweries
function findBreweries(event, page){
    event.preventDefault();
    
    console.log("finding brewery")
    let city = document.getElementsByName('city')[0].value
    let perPage=10
    let url=`https://api.openbrewerydb.org/breweries?by_city=${city}&per_page=${perPage}&page=${page}`
    console.log('page', page)
    fetch(url)
        .then(response=>response.json())
            .then(data=>displayBreweries(event, data, page))
                .catch(error=>console.error(error))
}

// Function to add a cell of data to a row (appending td to a tr)
function newDataCell(tr, value){
    td=document.createElement("td")
    td.innerText=value ?? '-'
    tr.appendChild(td)
}

//Clears out the brewery table to remove any previous searches/pages
function clearBrewTable(table){
    table.innerHTML=""
    let buttonsToClear=document.querySelectorAll(".prev-next-btn")
    for (let btn of buttonsToClear){
        console.log("removing... ", btn)
        btn.remove()
    }
    return table
}

// Callback function for FindBreweries that will write the information to the screen
function displayBreweries(event, data, page){
    
    //Remove all the old results from the table
    let table = document.getElementById("brewery-table")
    table = clearBrewTable(table)
    
    //When we done have results we want to give feedback
    if (Object.keys(data).length<=0){
        table.innerHTML="No More Breweries"
        return   
    }

    // Create the Brewery Table Headers 
    let thead = document.createElement("thead")
    table.append(thead)
    let tr=document.createElement("tr")
    thead.appendChild(tr)
    
    const tableHeadings=["Name", "Type", "Street Address", "Address 2", "Address 3", "City", "State"]
    let th
    for (let heading of tableHeadings){
        th = document.createElement("th")
        th.scope="col"
        th.innerText=heading
        tr.appendChild(th)
    }

    // Write the information for each brewery to the table
    for (brewery of data){
        tr=document.createElement("tr")
        table.appendChild(tr)

        let td=document.createElement("td")
        td.innerHTML=`<a href=${brewery.website_url}>${brewery.name}</a>`
        
        // This will change the copy paste behavoir when 
        // copying the name of the brewery, it will now also 
        // include the website
        let copyString= `Visit ${brewery.name} at ${brewery.website_url}`
        td.addEventListener('copy', (event)=> {
            const selection = document.getSelection();
            event.clipboardData.setData('text/plain',  copyString);
            event.preventDefault();
            }
        )
        tr.appendChild(td)
        newDataCell(tr, brewery.brewery_type)
        newDataCell(tr, brewery.street)
        newDataCell(tr, brewery.address_2)
        newDataCell(tr, brewery.address_3)
        newDataCell(tr, brewery.city)
        newDataCell(tr, brewery.state)
    }
    // If there is no data there should not be a next button
    if (Object.keys(data).length>=0){
        nextButton=document.createElement("button")
        nextButton.addEventListener('click',()=>findBreweries(event, page+1))
        nextButton.classList.add("prev-next-btn", "btn", "btn-primary")
        nextButton.innerText="Next"
        table.insertAdjacentElement("afterend", nextButton)
    }

    // Page 1 should neer have a previous button
    if(page != 1){    
        prevButton=document.createElement("button")
        prevButton.addEventListener('click',()=>{findBreweries(event, page-1)})
        prevButton.classList.add("prev-next-btn", "btn", "btn-danger")
        prevButton.innerText="Prev"
        table.insertAdjacentElement("afterend", prevButton)
    }
}


// The switch to start listening to keypresses to move beer glass
function handleBeer(){
    let checkToStartBeerMove=document.getElementsByClassName("is-visible")[0]
    if (checkToStartBeerMove.id=="grab"){
        startBeerMove()
    }else{
        endBeerMove()
    }
}

// Move the glass with the key strokes by changing the absolute position 
// (note this method works only for absolute positions
// assigned with inline css)

function handleBeerEvent(event){
    const arrowKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'];
    console.log(event.key)
    // If the user presses one of our trigger keys 
    // we will move the glass 5 pixels in that direction
    if (arrowKeys.includes(event.key)){
        let glass=document.querySelector(".beerglass")
        switch(event.key){
            case "ArrowRight":
                glass.style.left = parseInt(glass.style.left.substring(0,glass.style.left.length-2))+5+"px"
                break;
            case "ArrowLeft":
                glass.style.left = parseInt(glass.style.left.substring(0,glass.style.left.length-2))-5+"px"
                break;
            case "ArrowUp":
                glass.style.top = parseInt(glass.style.top.substring(0,glass.style.top.length-2))-5+"px"
                break;
            case "ArrowDown":
                glass.style.top = parseInt(glass.style.top.substring(0,glass.style.top.length-2))+5+"px"
                break;
        }
        if (glass.style.top === "200px" && glass.style.left === "450px"){
            setTimeout(()=>{
                alert("Enjoy your mug")
            })
        }
    }
}

// Turn on key listening for beer movement
function startBeerMove(){
    console.log("listening for beer events")
    document.addEventListener('keydown', handleBeerEvent)
}

// Turn off key listening for beer movement
function endBeerMove(){
    console.log("no longer listening for events")
    document.removeEventListener('keydown', handleBeerEvent)
}

// load event listeners for drag and drop
function loadDragNDropBeer(){
    let draggable=document.getElementsByClassName("beerglass")[1]
    let droppable=document.getElementById("droppable")
    droppable.addEventListener('drop',(e)=>drop(e))
    droppable.addEventListener('dragover', (e)=>allowDrop(e))
    draggable.addEventListener('dragstart', (e)=>drag(e))
    draggable.draggable=true
}

//stop the default behavior for dragover to allow our dropping
function allowDrop(e) {
    console.log('allowDrop')
    e.preventDefault()
}

//use the events datatransfer to hold the beer glass while dragging
function drag(e) {
    console.log('drag')
    e.dataTransfer.setData("text", e.target.id)
}

//add the beer to the coaster div
function drop(e) {
    console.log('drop')

    e.preventDefault()
    var data = e.dataTransfer.getData("text")
    console.log(data)
    e.target.appendChild(document.getElementById(data))
}