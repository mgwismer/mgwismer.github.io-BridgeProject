/*
// if we weren't using jquery to handle the document ready state, we would do this:
if (window.addEventListener) {
    window.addEventListener("load",initPlayingCards,false);
} else if (window.attachEvent) {
    window.attachEvent("onload",initPlayingCards);
} else {
    window.onload = function() {initPlayingCards();}
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
  //does not recognize the emoji
  var suitSymbolToString = {
    "NT": "NoTrump",
    "♠︎": "Spades",
    "♥︎": "Hearts",
    "♦︎": "Diamonds",
    "♣︎": "Clubs",
  }
  var theTeams = [0, 1, 0, 1];

  var numOfPlayers = 4;
  var numConsecutivePasses = 3;
  var maxNumOfRounds = 7;
  var aBook = 6;
  var numTricksInAGame = 13;
  var factorOverlap = 2.3;

  function trickResults(contract, bidder) {
    this.teams = [0,1];
    this.theTeamsTricks = [0,0]
    this.bidder = bidder;
    this.contractTeam = theTeams[bidder];
    this.contract = contract;
    this.addToTrickCount = function(winChair) {
      this.theTeamsTricks[this.teams[theTeams[winChair]]]++;
      $("#NSTricks").html(this.theTeamsTricks[this.teams[theTeams[0]]]);
      $("#EWTricks").html(this.theTeamsTricks[this.teams[theTeams[1]]]);
    }
    this.checkForMadeContract = function() {
      var required = parseInt(this.contract)+6;
      $("#finalResults").css("visibility","visible");
      if (this.theTeamsTricks[this.contractTeam] == required) {
        $("#finalResults").append("<h6> CONTRACT MADE </h6>");
      }
      else {
       $("#finalResults").append("<h6> CONTRACT NOT MADE </h6>");
      }
    }
  }
  function playCard(card,chair) {
    this.pcard = card;
    this.chair = chair;
    this.trump = function() {
      return this.suit == table.trump;
    }
  }

  function playHand(table) {
    //if 0 leads then the order is [0,1,2,3], if 1 leads the order is [1,2,3,0] etc
    this.playDir = [[0,1,2,3],[1,2,3,0],[2,3,0,1],[3,0,1,2]];
    this.playTable = table;
    this.trick = [];
    this.nextMove = true;
    this.numTricksLeft = numTricksInAGame;
    this.startRound = function() {
      $("#gameAgainbtn").css("visibility","visible");
      this.changeButtons();
      $("#currTrickDiv").css("visibility", "visible");
      this.results = new trickResults(this.playTable.contract, this.playTable.bidder);
      $(".resultsTableDiv").css("visibility","visible");
      this.lead = this.playTable.defender1;
      //holds the numerical value of whose turn
      this.index = 0;
      this.whoseTurn = this.playDir[this.lead][this.index];
      self = this;
      this.addFlipButtons(self);
    }
   
    this.changeButtons = function() {
      $("#northFlip").attr("value", "PLAY NORTH");
      $("#eastFlip").attr("value", "PLAY EAST");
      $("#westFlip").attr("value", "PLAY WEST");
      $("#southFlip").attr("value", "PLAY SOUTH");
    }

    this.addFlipButtons = function(theTable) {
      $('#northFlip').click(function() {
        self.chooseACard(self, "north");
      });
      $('#eastFlip').click(function() {
        self.chooseACard(self, "east"); 
      });
      $('#southFlip').click(function() {
        self.chooseACard(self, "south");
      });
      $('#westFlip').click(function() {
        self.chooseACard(self,"west");
      });
    }

    this.chooseACard = function(self, direction) {
      console.log("num Tricks left");
      console.log(self.numTricksLeft);
      if (self.numTricksLeft > 0) {
        //if it is your turn your cards will be flipped and listened to.
        if(self.playTable.tableDir[self.whoseTurn] == direction) {
          //don't flip the cards back if it is the dummy hand.
          if (self.playTable.dummy != self.whoseTurn)
            self.playTable.hands[self.whoseTurn].flipCards(direction+"Hand");
          else {
            //when it is the dummy's turn you should flip her partner's cards.
            var dummyPartner = self.playTable.partner[self.whoseTurn];
            var nDirection = self.playTable.tableDir[dummyPartner];
            self.playTable.hands[dummyPartner].flipCards(nDirection+"Hand");
          }
          listenToCards(self,direction);
        }
        else 
          alert("IT IS "+self.playTable.tableDir[self.whoseTurn]+"'s turn"); 
      }
      else {
        self.results.checkForMadeContract();
        alert("GAME OVER"); 
      }
    }

    showDummyHand = function(self) {
      var dummyDir = self.playTable.tableDir[self.playTable.dummy];
      var dirDiv = document.getElementById(dummyDir+"Hand");
      var c = dirDiv.getElementsByClassName("playingCard");
      for (var i = 0; i < c.length; i++) {
        var front = c[i].getElementsByClassName("front")[0];
        front.style.visibility = "visible";
      }
    }

    listenToCards = function(self,dir) {
      //this is where the event listeners are added to the hand
      var currHandDiv = document.getElementById(dir+"Hand");
      self.currCards = self.playTable.hands[self.whoseTurn].completeHand();
      currHandDiv.addEventListener("click", function(e1){
        //when you click you get the 'front' div which is a child of playingCard div
        //there are 13 playingCards in the hand. We want the playing card
        child = e1.target.parentElement;
        var i = 0;
        //find the index of which card clicked by checking how many siblings before it.
        while( (child = child.previousSibling) != null ) 
          i++;
        if (checkLegitPlay(self,i)) {
          //this removes the card from the hand array object
          self.playTable.hands[self.whoseTurn].removeCardFromHand(self.currCards[i]);
          //self.whoseTurn is the index, table is the array of string directions
          var seatDir = self.playTable.tableDir[self.whoseTurn];
          var el = $('#'+seatDir+"Hand");
          //This part removes all the card from the display. Remove the cards first before showing them, necessary for 
          //when you remove a card.
          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }
          //this is necessary because the bidder's hand is shown when it is dummy's turn.
          //the bidder can always see both her and her partner's (i.e. dummy's) hand.
          if (self.playTable.dummy == self.whoseTurn) {
            bidderDir = self.playTable.tableDir[self.playTable.bidder];
            self.playTable.hands[self.playTable.bidder].flipCards(bidderDir+"Hand");
          }
          self.playTable.hands[self.whoseTurn].showHand(seatDir+"Hand");
          //saves the card and the seat that played it in the trick array.
          var playedCard = new playCard(self.currCards[i],self.whoseTurn);
          self.trick.push(playedCard);
          moveCardToCenter(self,i,self.whoseTurn);
          //the entire table can always see the dummy's hand.
          showDummyHand(self);
          if (self.index < numOfPlayers-1) {
            self.index++;
          }
          else {
            self.winCurrTrick = checkAndRecordTrickWin(self);
            //the chair that won the trick leads the next trick.
            self.lead = self.winCurrTrick;
            //each trick starts at self.index 0.
            self.index = 0;
            clearTheTable(self);
            //remove all cards from the trick array, ready for new trick.
            self.trick = [];
            //starts with 13 tricks left.
            self.numTricksLeft--;
            removeCardListeners(self);
          }
          console.log("whose turn");
          self.whoseTurn = self.playDir[self.lead][self.index];
          console.log(self.whoseTurn);
        }
        else
          alert("must follow suit if you can");
      });
    }

    checkLegitPlay = function(self,i) {
      // console.log("in check legit");
      // console.log(self.currCards[i]);
      //could also check to see if self.index = 0
      if (self.index == 0) {
        return true;
      }
      else if (self.currCards[i].suit == self.trick[0].pcard.suit)
        return true;
      else if (suitNotInHand(self,self.whoseTurn,self.trick[0].pcard.suitString))
        return true;
      else
        return false;
    }

    checkAndRecordTrickWin = function(self) {
      if (trumpSuitInTrick(self.playTable.trump,self.trick)) {
        //if trump is played that becomes the winning suit.
        var winTrick = highestRankSuit(self.trick,suitSymbolToString[self.playTable.trump]);
      }
      else
        //otherwise the suit that was lead is the winning suit.
        var winTrick = highestRankSuit(self.trick,self.trick[0].pcard.suitString);
      self.results.addToTrickCount(winTrick);
      return winTrick;
    }

    //Puts all the cards that are in the winning suit into a separate array, winSuitCards,
    //and then sorts that array, according to rank, to determine which card takes the trick.
    //The winning suit is trump and if no trump, is the lead suit.
    highestRankSuit = function(theTrick, winningSuit) {
      var winSuitCards = [];
      for (var i = 0; i < numOfPlayers; i++) {
        if (theTrick[i].pcard.suitString == winningSuit)
          winSuitCards.push(theTrick[i]);
      }
      winSuitCards.sort(compareRank);
      //the person who threw the highest card in the winning suit wins the trick.
      return winSuitCards[winSuitCards.length-1].chair;
    }

    compareRank = function(a,b) {
      if (cardRank[a.pcard.rankString] < cardRank[b.pcard.rankString])
        return -1;
      if (cardRank[a.pcard.rankString] > cardRank[b.pcard.rankString])
        return 1;
      return 0;
    }

    trumpSuitInTrick = function(trump,playedCards) {
      for(var i = 0; i < numOfPlayers; i++) {
        if (suitSymbolToString[trump] == playedCards[i].pcard.suitString)
          return true;
      }
      return false;
    }

    //a player must follow suit if they can. This function checks whether they can.
    suitNotInHand = function(self,n,leadSuit) {
      var currHand = self.playTable.hands[n];
      if ((leadSuit == "Spades")&& (currHand.spades.length == 0))
        return true;
      else if ((leadSuit == "Hearts") && (currHand.hearts.length == 0))
        return true;  
      else if ((leadSuit == "Diamonds") && (currHand.diamonds.length == 0))
        return true;     
      else if ((leadSuit == "Clubs") && (currHand.clubs.length == 0))
        return true;
      else
        return false;
    }
   
    moveCardToCenter = function(self,i) {
      //i is the card index
      //n is the seat position
      var seatDir = self.playTable.tableDir[self.whoseTurn];
      //this is the div in the middle of the table
      el = $('#'+seatDir+'Trick');
      el.html('');
      card = self.currCards[i]; 
      //puts the card in currTrickDiv
      el.append(card.getHTML());
    }

    clearTheTable = function(self) {
      for (var i = numOfPlayers - 1; i >= 0; i--) {
        var seatDir = self.playTable.tableDir[i];
        el = document.getElementById(seatDir+"Trick");  
        el.removeChild(el.firstChild);
      }
    }

    removeCardListeners = function(self) {
      $("#northHand").remove();
      $("#eastHand").remove();
      $("#southHand").remove();
      $("#westHand").remove();
      $(".northCont").append('<div id="northHand" class="playingHand" </div>');
      $(".eastCont").append('<div id="eastHand" class="playingHand" </div>');
      $(".southCont").append('<div id="southHand" class="playingHand" </div>');
      $(".westCont").append('<div id="westHand" class="playingHand" </div>');
      var north = self.playTable.hands[0];
      var east = self.playTable.hands[1];
      var south = self.playTable.hands[2];
      var west = self.playTable.hands[3];
      self.playTable.showHands(north,east,south,west);
      showDummyHand(self);
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
      switch(card.suit) {
        case "S": {
          var pos = this.spades.map(function(e) {return e.rank; }).indexOf(card.rank);
          this.spades.splice(pos,1);
          break;
        }
        case "H": {
          var pos = this.hearts.map(function(e) {return e.rank; }).indexOf(card.rank);
          this.hearts.splice(pos,1);
          break;
        }
        case "D": {
          var pos = this.diamonds.map(function(e) {return e.rank; }).indexOf(card.rank);
          this.diamonds.splice(pos,1);
          break;
        }
        case "C": {
          var pos = this.clubs.map(function(e) {return e.rank; }).indexOf(card.rank);
          this.clubs.splice(pos,1);
          break;
        }
      }
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
      var handDiv = document.getElementById(idName);
      for(var j = 0; j < hand.length; j++) {
        el.append(hand[j].getHTML());
      }
      var cardsInHand = handDiv.getElementsByClassName("playingCard");
      var cardFact = numTricksInAGame/cardsInHand.length
      for (var i = cardsInHand.length-1; i >= 0; i--) {
        var card = cardsInHand[i];
        card.style.left = -(i*factorOverlap)+"em";
        card.style.zIndex = i;
      }
    }
  }

  //Bridge Table object with methods
  function bridgeTable() {
    this.tableDir = ["north", "east","south","west"];
    this.partner = [2, 3, 0, 1];
    this.currentPos = 0;
    this.currentBidder = this.tableDir[this.currentPos];
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
      $("#gameAgainbtn").css("visibility","hidden");
      $(".bidResults").css("visibility","hidden");
      $(".biddingDiv").css("display","block");
      var cardDeck = $("#cardDeck").playingCards();
      cardDeck.shuffle();
      var north = new bridgeHand;
      var south = new bridgeHand;
      var east = new bridgeHand;
      var west = new bridgeHand;
      for(var j = 0; j < numTricksInAGame; j++) {
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
      this.handsSaved = [north, east, south, west];
      this.showHands(north, east, south, west);
      var theBid = new bid;
      theBid.startBid(this);
    }

    this.playAgain = function() {
      $(".bidResults").css("visibility","hidden");
      $(".biddingDiv").css("display","block");
      this.hands = this.handsSaved;
      north = this.handsSaved[0];
      east = this.handsSaved[1];
      south = this.handsSaved[2];
      west = this.handsSaved[3];
      console.log(north);
      console.log(east);
      this.showHands(north, east, south, west);
      var theBid = new bid;
      theBid.startBid(this);
    }

    this.displayBidResults = function() {
      console.log("bid results");
      $(".bidResults").css("visibility","visible");
      $('.biddingDiv').css("display","none");
      //this is the person who took the bid and is playing
      //this.player is a number (0-3) while this.playerDir is a word (i.e north, east)
      this.bidderDir = this.tableDir[this.bidder];
      this.dummy = this.determineDummy();
      //direction to left of bidder is defender1 and the lead
      if (this.bidder == 3)
        this.defender1 = 0
      else 
        this.defender1 = this.bidder + 1;
      this.defender2 = this.partner[this.defender1];
      this.tricksNeeded = parseInt(this.contract)+aBook;
      $("#bidderDir").html("Bidder: "+this.tableDir[this.bidder]);
      $('#dummyDir').html("Dummy: "+this.tableDir[this.dummy]);
      $('#contract').html("Contract: "+this.contract+" "+this.trump);
      $('#leadDir').html("Lead Dir: "+this.tableDir[this.defender1]);
      $('#handReq').html(this.tableDir[this.bidder]+"/"+this.tableDir[this.dummy]+" must take "+this.tricksNeeded+" in order to make their bid");
      $('.playResults').css("display","block");   
    }

    this.showHands = function(north, east, south, west) {
      north.showHand("northHand");
      north.flipCards("northHand");
      west.showHand("westHand");
      east.showHand("eastHand");
      south.showHand("southHand");
      west.flipCards("westHand");
      east.flipCards("eastHand");
      south.flipCards("southHand");
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
      this.clearBidTable();
      $("#bidResultsbtn").css("visibility","hidden");
      $('#playGamebtn').css("visibility","hidden");
      //values in the pull down menus.
      var amt = document.getElementById("amtSelect"); 
      var suit = document.getElementById("suitSelect");
      //save properties of bid to pass into event listeners.
      var self = this;
      self.currBid = [this.amount, this.suit];
      //myTable.table is the array of directions
      myTable.hands[self.currentPos].flipCards(myTable.tableDir[self.currentPos]+"Hand");
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
            myTable.trump = self.currBid[1];
            myTable.contract = self.currBid[0];
            myTable.bidder = self.determineBidder(self.history,myTable.trump);
            biddingOver(self);
          }
        } //end if legit bid
      }); //end click event
    }

    this.clearBidTable = function() {
      var table = document.getElementById("bidTable");
      var rowCount = table.rows.length;
      console.log(rowCount);
      console.log(table);
      for (var i = 1; i < rowCount; i++) {
        table.deleteRow(i);
      }
      //insert row 1
      var newRow = document.getElementById('bidTable').insertRow(-1);
      newRow.setAttribute("id","row1");        
      //label row 1 as RND 1
      var round = document.getElementById('row1');
      x = round.insertCell(-1);
      x.innerHTML = "RND 1";
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
      if (amount != "PASS") {
        x.innerHTML = amount+suit;
      }
      else {
        //amount is a number 1 through 7 or the word PASS
        x.innerHTML = amount;
      }
    }
  
    changeBidder = function(self) {
      myTable.hands[self.currentPos].flipCards(myTable.tableDir[self.currentPos]+"Hand");
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
      myTable.hands[self.currentPos].flipCards(myTable.tableDir[self.currentPos]+"Hand");
      //Tells the user which direction is the current bidder
      document.getElementById('bidDir').innerHTML = bidOrder[self.currentPos];
    }

    biddingOver = function(self) {
      subevt = $('#submitBid').css("visibility","hidden");
      subevt.off('click');
      bidRes = $('#bidResultsbtn').css("visibility","visible");
      bidRes = $('#playGamebtn').css("visibility","visible");
      myTable.hands[self.currentPos].flipCards(myTable.tableDir[self.currentPos]+"Hand");
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

  $(".aboutHeading").hover(function() {
    $('.aboutParagraph').slideDown("slow");
  })
  $(".thePartsHeading").hover(function() {
    $('.thePartsParagraph').slideDown("slow");
  });
  $(".theBidPartHeading").hover(function() {
    $('.theBidParagraph').slideDown("slow");
  });
  $(".thePlayPartHeading").hover(function() {
    $('.thePlayParagraph').slideDown("slow");
  });
  $(".row").hover(function() {
    $('.aboutParagraph').slideUp("medium");
    $('.thePartsParagraph').slideUp("medium");
    $('.theBidParagraph').slideUp("medium");
    $('.thePlayParagraph').slideUp("medium");
  })
  $('#learnButton').click(function() {
    $('.main-container').css('display','block');
    $('.frontImage').slideUp(3000);
  });
  $('#dealCards').click(function() {
    removePlayingCards();
    myTable.createTable();
    $('#currTrickDiv').css("visibility","hidden");
  });
  $('#bidResultsbtn').click(function() {
    myTable.displayBidResults();
  });
  $('#playGamebtn').click(function() {
    var myHand = new playHand(myTable);
    $('#currTrickDiv').css("visibility","hidden");
    myHand.startRound();
  });
  $('#gameAgainbtn').click(function() {
    removePlayingCards();
    myTable.playAgain();
  })
  var myTable = new bridgeTable;
});