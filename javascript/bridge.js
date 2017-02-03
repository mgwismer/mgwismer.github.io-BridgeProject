/*
// if we weren't using jquery to handle the document ready state, we would do this:
if (window.addEventListener) {
    window.addEventListener("load",initPlayingCards,false);
} else if (window.attachEvent) {
    window.attachEvent("onload",initPlayingCards);
} else {
    window.onload = function() {initPlayingCards();}
}
function initPlayingCards() {
    cardDeck = new playingCards();
}
*/
$(document).ready(function(){
  //check for bootstrap
  console.log(typeof $().modal == 'function');
  var cardRank = {
    Two: 0,
    Three: 1,
    Four: 2,
    Five: 3,
    Six: 4,
    Seven: 5,
    Eight: 6,
    Nine: 7,
    Ten: 8,
    Jack: 9,
    Queen: 10,
    King: 11,
    Ace: 12,
  }
  var cardHCP = {
    Two: 0,
    Three: 0,
    Four: 0,
    Five: 0,
    Six: 0,
    Seven: 0,
    Eight: 0,
    Nine: 0,
    Ten: 0,
    Jack: 1,
    Queen: 2,
    King: 3,
    Ace: 4,
  }
  var numOfPlayers = 4;
  var numConsecutivePasses = 3;
  var maxNumOfRounds = 7;
  var aBook = 6;
  var numTricksInAGame = 13;
  function playCard(rank,suit,chair) {
    this.rank = rank;
    this.suit = suit;
    this.chair = chair;
    this.trump = function() {
      return this.suit == table.trump;
    }
  }

  function playHand(table) {
    //if 0 leads then the order is [0,1,2,3], if 1 leads the order is [1,2,3,0]
    this.playDir = [[0,1,2,3],[1,2,3,0],[2,3,0,1],[3,0,1,2]];
    this.playTable = table;
    this.trick = [];
    this.listenToCards = function(n,dir) {
      //this is where the event listeners are added to the hand
      var currHandDiv = document.getElementById(dir+"Hand");
      this.currCards = this.playTable.hands[n].completeHand();
      this.chair = n;
      //need to do this to pass the object into the event listener
      self = this
      currHandDiv.addEventListener("click", function(e1){
        //when you click you get the front which is a child of playingCard
        //there are 13 playingCards in the hand.
        child = e1.target.parentElement;
        var i = 0;
        //find the index of which card clicked
        while( (child = child.previousSibling) != null ) 
          i++;
        if (checkLegitPlay(self,i)) {
          self.trick.push(self.currCards[i]);
          moveCardToCenter(self,i);
          self.playTable.hands[n].removeCardFromHand(self.currCards[i]);
          return true;
        }
        else
          alert("must follow suit if you can");
        console.log(self.trick);
      });
    }

    checkLegitPlay = function(self,i) {
      if (self.trick.length == 0) {
        return true;
      }
      else if (self.currCards[i].suit == trick[0].suit)
        return true;
      else if (suitNotInHand(self,n,trick[0].suit))
        return true;
      else
        return false;
    }

    suitNotInHand = function(self,n,leadSuit) {
      var theHand = self.hands[n];
      if ((leadSuit == Spades)&& (self.hands[n].spades.length == 0))
        return true;
      else if ((leadSuit == Hearts) && (self.hands[n].hearts.length == 0))
        return true;  
      else if ((leadSuit == Diamonds) && (self.hands[n].diamonds.length == 0))
        return true;     
      else if ((leadSuit == Clubs) && (self.hands[n].clubs.length == 0))
        return true;
      else
        return false;
    }
 
    moveCardToCenter = function(self,i,n) {
      //i is the card index
      //n is the seat position
      el = $('#currTrickDiv');
      el.html('');
      card = self.currCards[i]; 
      //puts the card in currTrickDiv
      el.append(card.getHTML());
      //get the variable of currTrickDiv
      var trick = document.getElementById("currTrickDiv");
      //gets the playingCard in currTrickDiv, I want to just add
      //an idName to the playingCard div but I haven't been able to
      //do that
      var c = trick.getElementsByClassName("playingCard")[0];
      c.id = "eastTrick";
      console.log("move card to center");
      console.log(self);
      console.log(i);
    }

    this.addCardToTrick = function(){
      this.trick.push(playedCard);
    }

    this.playOneTrick = function() {

    }
    this.startHand = function() {
      console.log("start Hand");
      console.log(this.playTable);
      var lead = this.playTable.defender1;
      for (var i = 0; i < 1 ; i++) {
        //holds the numerical value of whose turn
        var whoseTurn = this.playDir[lead][i];
        var turnDir = this.playTable.table[whoseTurn];
        this.playTable.hands[whoseTurn].flipCards(turnDir+"Hand");
        console.log(turnDir);
        //add a picked card to the trick
        //this.trick.push(this.listenToCards(turnDir));
        this.listenToCards(whoseTurn,turnDir);
      }
    }
  }

  function bridgeHand() {
    this.spades = [];
    this.hearts = [];
    this.clubs = [];
    this.diamonds = [];
    //an array that includes all 13 cards
    this.completeHand = function() {
      return this.hearts.concat(this.spades).concat(this.diamonds).concat(this.clubs);
    }
    //sort within each suit according to rank
    this.sortHand = function() {
      this.spades.sort(this.compare);
      this.hearts.sort(this.compare);
      this.diamonds.sort(this.compare);
      this.clubs.sort(this.compare);
    }
    this.compare = function(a, b) {
      if (cardRank[a.rankString] < cardRank[b.rankString])
        return -1;
      if (cardRank[a.rankString] > cardRank[b.rankString])
        return 1;
      return 0;
    }

    this.addCardToHand = function(card) {
      switch (card.suit) {
        case "S":
          this.spades.push(card);
          break;
        case "D":
          this.diamonds.push(card);
          break;
        case "C":
          this.clubs.push(card);
          break;
        case "H":
          this.hearts.push(card);
          break;
      }
    }
 
    this.removeCardFromHand = function(card) {
      console.log("remove Card from hand");
      console.log(card);
    }

    this.flipCards = function(direction) {
      var dirDiv = document.getElementById(direction);
      var c = dirDiv.getElementsByClassName("playingCard");
      for (var i = 0; i < c.length; i++) {
        var front = c[i].getElementsByClassName("front")[0];
        if (front.style.visibility == "hidden") {
          front.style.visibility = "visible";
        }
        else {
          front.style.visibility = "hidden";
        }
      }
    }

    this.showHand = function(idName) {
      var el = $('#'+idName);
      el.html('');
      hand = this.completeHand();
      for(var i = 0; i < hand.length; i++) {
        el.append(hand[i].getHTML("none"));
        var allCards = document.getElementsByClassName("playingCard");
        var lastCard = allCards[allCards.length-1];
        lastCard.style.left = -i*55+"px";
        lastCard.style.zIndex = i;
      }
    }
  }

  var showError = function(msg){
    $('#error').html(msg).show();
    setTimeout(function(){
      $('#error').fadeOut('slow');
    },3000);
  }

  //Bridge Table object with methods
  function bridgeTable() {
    this.table = ["north", "east","south","west"];
    this.partner = [2, 3, 0, 1];
    this.currentPos = 0;
    this.currentBidder = this.table[this.currentPos];
    this.trump = null;
    this.contract = 0;
    this.tricksNeeded = 7;
    //this.player is the person who took the bid and will play
    this.bidder = null;
    this.dummy = null;
    //defender1 will lead
    this.defender1 = null;
    this.defender2 = null;
    this.createTable = function() {
      console.log("button clicked");
      var cardDeck = $("#cardDeck").playingCards();
      cardDeck.shuffle();
      var north = new bridgeHand;
      var south = new bridgeHand;
      var east = new bridgeHand;
      var west = new bridgeHand;
      for(var j = 0; j < 13; j++) {
        north.addCardToHand(cardDeck.draw());
        east.addCardToHand(cardDeck.draw());
        south.addCardToHand(cardDeck.draw());
        west.addCardToHand(cardDeck.draw());
      }
      north.sortHand();
      west.sortHand();
      east.sortHand();
      south.sortHand();
      this.hands = [north, east, south, west];
      this.showHands(north, west, east, south);
      this.addFlipButtons(north, west, east, south);
      var theBid = new bid;
      theBid.startBid(this);
    }

    this.displayBidResults = function() {
      console.log("bid results");
      $('.biddingDiv').css("display","none");
      //this is the person who took the bid and is playing
      //this.player is a number (0-3) while this.playerDir is a word (i.e north, east)
      this.bidderDir = this.table[this.bidder];
      this.dummy = this.determineDummy();
      //direction to left of bidder is defender1 and the lead
      if (this.bidder == 3)
        this.defender1 = 0
      else 
        this.defender1 = this.bidder + 1;
      this.defender2 = this.partner[this.defender1];
      this.tricksNeeded = parseInt(this.contract)+aBook;
      $("#bidderDir").html("Bidder: "+this.table[this.bidder]);
      $('#dummyDir').html("Dummy: "+this.table[this.dummy]);
      $('#contract').html("Contract: "+this.contract+" "+this.trump);
      $('#leadDir').html("Lead Dir: "+this.table[this.defender1]);
      $('#handReq').html(this.table[this.bidder]+"/"+this.table[this.dummy]+" must take "+this.tricksNeeded+" in order to make their bid");
      $('.playResults').css("display","block");   
    }

    this.showHands = function(north, west, east, south) {
      north.showHand("northHand");
      north.flipCards("northHand");
      west.showHand("westHand");
      east.showHand("eastHand");
      south.showHand("southHand");
      west.flipCards("westHand");
      east.flipCards("eastHand");
      south.flipCards("southHand");
    }

    this.addFlipButtons = function(dir1,dir2,dir3,dir4) {
      $('#northFlip').click(function() {
        dir1.flipCards("northHand");
      });
      $('#eastFlip').click(function() {
        dir2.flipCards("eastHand");
      });
      $('#southFlip').click(function() {
        dir3.flipCards("southHand");
      });
      $('#westFlip').click(function() {
        dir4.flipCards("westHand");
      });
    }

    this.playGame = function() {
      console.log("game started");
    }
    this.gameDisplayResults = function() {
      console.log("results");
    }
    this.determineDummy = function() {
      return this.partner[this.bidder];
    }
  }

  var bid = function() {
    bidOrder = ["north","east","south","west"];
    suitOrder = ["♣︎","♦︎","♥︎","♠︎","NT"];
    this.currentRow = 1;
    //position of current bidder
    this.currentPos = 0;
    this.amount = 0;
    this.suit = null;
    this.history = [];
    //stores position of most recent non PASS bidder
    this.bidder = null;
    this.setCurrentBid = function(amt, suit) {
      this.amount = amt;
      this.suit = suit;
    }
    this.startBid = function(myTable) {
      //buttons to display bid results when bidding is over
      $("#bidResultsbtn").css("visibility","hidden");
      $('#playGamebtn').css("visibility","hidden");
      //values in the pull down menus.
      var amt = document.getElementById("amtSelect"); 
      var suit = document.getElementById("suitSelect");
      //save properties of bid to pass into event listeners.
      var self = this;
      self.currBid = [this.amount, this.suit];
      //myTable.table is the array of directions
      myTable.hands[self.currentPos].flipCards(myTable.table[self.currentPos]+"Hand");
      //a button to submit the bid.
      subevt = $('#submitBid');
      subevt.css("visibility","visible");
      subevt.click(function() {
        //current values in the pulldown menus
        var bidamt = amt.options[amt.selectedIndex].text;
        var bidsuit = suit.options[suit.selectedIndex].text;
        if (legitBid(bidamt, bidsuit, self.currBid)) {
          //update the current bid, if not a PASS
          if (bidamt != "PASS") {
            self.currBid = [bidamt, bidsuit];
            //stores who made the last non-PASS bid. This suit will be trump if it
            //is the final bid.
            self.bidder = self.currentPos;
          }
          else 
            //make the suit a null if bidamt is PASS
            bidsuit = null;
          //keep a history of all bids and PASSES (i.e. all submits)
          self.history.push([bidamt, bidsuit]);
          //bidding is over if 3 PASSes in a row.
          if (!threePasses(self.history)) {
            updateTable(self.currentRow, bidamt, bidsuit);
            changeBidder(self);
          }
          else {
            updateTable(self.currentRow, bidamt, bidsuit);
            myTable.trump = self.determineTrump(self);
            myTable.contract = self.currBid[0];
            myTable.bidder = self.determineBidder(self.history,myTable.trump);
            biddingOver(self);
          }
        } //end if legit bid
      }); //end click event
    }
   
    //trump is always the last suit that was bid.
    this.determineTrump = function() {
      return this.currBid[1];
    }

    //the first person to bid the trump suit who is also a partner 
    //of the last person to bid.
    this.determineBidder = function(history,trump) {
      //the last person to PASS, have to do % because there are many rounds.
      var lastPASS = (history.length-1)%numOfPlayers;
      //lastBidder is last person to make a non-PASS bid
      if (lastPASS == numConsecutivePasses)
        //because 1 and 2 also passed.
        var lastBidder = 0;
      else
        //because there are only 4, [0,1,2,3]
        var lastBidder = lastPASS + 1;
      //bidTeam is lastBidder or partner
      var bidTeam = lastBidder%2;
      for (var i = bidTeam; i < history.length; i += 2) {
        if (trump == history[i][1])
          //the first person on the team to bid trump is the bidder
          //need a mod 4 if they started bidding that suit after the first round.       
          return i%numOfPlayers;
      }
    }

    //if there are 3 consecutive PASS bids, unless it is the first three, 
    //the bidding is over.
    threePasses = function(bids) {
      if (bids.length > 3) {
        //the last three in the bids array
        var lastThree = bids.slice(-3);
        if ((lastThree[0][0] == "PASS") && (lastThree[0][0] == lastThree[1][0])&&(lastThree[1][0] == lastThree[2][0]))
          return true;
        else
          return false;
      }
    }

    updateTable = function(currRow, amount, suit) {
      var round = document.getElementById('row'+currRow);
      x = round.insertCell(-1);
      if (amount != "PASS")
        x.innerHTML = amount+suit;
      else
        //amount is a number 1 through 7 or the word PASS
        x.innerHTML = amount;
    }

    changeBidder = function(self) {
      myTable.hands[self.currentPos].flipCards(myTable.table[self.currentPos]+"Hand");
      self.currentPos += 1;
      if (self.currentPos == numOfPlayers) {
        //after the 4th seat go back to first
        self.currentPos = 0;
        //advance the row
        self.currentRow += 1; 
        //insert new row
        var newRow = document.getElementById('bidTable').insertRow(-1);
        newRow.setAttribute("id","row"+self.currentRow);
        //label new row
        var round = document.getElementById('row'+self.currentRow);
        x = round.insertCell(-1);
        x.innerHTML = "RND "+self.currentRow;
      }
      if ((self.currentRow == maxNumOfRounds) && (self.currentPos == numOfPlayers)) {
        biddingOver(self);
      }
      myTable.hands[self.currentPos].flipCards(myTable.table[self.currentPos]+"Hand");
      //Tells the user which direction is the current bidder
      document.getElementById('bidDir').innerHTML = bidOrder[self.currentPos];
    }

    biddingOver = function(self) {
      subevt = $('#submitBid').css("visibility","hidden");
      subevt.off('click');
      bidRes = $('#bidResultsbtn').css("visibility","visible");
      bidRes = $('#playGamebtn').css("visibility","visible");
      myTable.hands[self.currentPos].flipCards(myTable.table[self.currentPos]+"Hand");
      document.getElementById('bidDir').innerHTML = "Bidding Over";
    }
    
    //implements the rules of bridge bidding
    legitBid = function(amt, suit, currBid) {
      if (currBid[0] != 'PASS') {
        if(amt > currBid[0]) 
          return true;
        else if (amt < currBid[0])  {
          alert("Invalid Bid, Amount must be greater than "+currBid[0]);
          return false;
        }
        else if (currBid[1] == null)
          return true;
        else if (suitOrder.indexOf(suit) > suitOrder.indexOf(currBid[1]))
          return true;
        else {
          alert("Invalid Bid. Pick a higher ranked suit");
          return false;
        }
      }
      return true;
    }
  }

  function removePlayingCards() {
    var cardNode = document.getElementById("northHand");
    while (cardNode.firstChild) {
      cardNode.removeChild(cardNode.firstChild);
    }
    var cardNode = document.getElementById("westHand");
    while (cardNode.firstChild) {
      cardNode.removeChild(cardNode.firstChild);
    }
    var cardNode = document.getElementById("eastHand");
    while (cardNode.firstChild) {
      cardNode.removeChild(cardNode.firstChild);
    }
    var cardNode = document.getElementById("southHand");
    while (cardNode.firstChild) {
      cardNode.removeChild(cardNode.firstChild);
    }
  }

  $('#dealCards').click(function() {
    removePlayingCards();
    myTable.createTable();
  });
  $('#bidResultsbtn').click(function() {
    myTable.displayBidResults();
  });
  $('#playGamebtn').click(function() {
    var myHand = new playHand(myTable);
    myHand.startHand();
  });
  var myTable = new bridgeTable;
});