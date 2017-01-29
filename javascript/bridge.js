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

  var bridgeHand = function() {
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
      console.log(idName);
      //console.log(hand);
      for(var i = 0; i < hand.length; i++) {
        el.append(hand[i].getHTML());
        var allCards = document.getElementsByClassName("playingCard");
        console.log(allCards);
        var lastCard = allCards[allCards.length-1];
        lastCard.style.left = -i*55+"px";
      }
    }
  }

  var showError = function(msg){
    $('#error').html(msg).show();
    setTimeout(function(){
      $('#error').fadeOut('slow');
    },3000);
  }

  var bridgeTable = function() {
    this.table = ["north", "east","south","west"];
    this.currentPos = 0;
    this.currentBidder = this.table[this.currentPos];
    this.moveCurrentBidder = function() {
      this.table.push(currentBidder);
      this.table.shift();
      currentBidder = this.table[0];
    }
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
      this.showHands(north, west, east, south);
      this.addFlipButtons(north, west, east, south);
    }

    this.showHands = function(north, west, east, south) {
      console.log("show hands");
      north.showHand("northHand");
      west.showHand("westHand");
      east.showHand("eastHand");
      south.showHand("southHand");
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
  }

  var thebid = function() {
    this.bidOrder = ["C","D","H","S","NT"];
    this.amount = 0;
    this.suit = null;
    this.legitBid = function(amt, suit) {
      if(amt > this.amount) 
        return true;
      else if (amt < this.amount) 
        return false;
      else if (this.suit == null)
        return true;
      else if (this.bidOrder.indexOf(suit) > this.bidOrder.indexOf(this.suit))
        return true;
      else 
        return false;
    }
    this.setCurrentBid = function(amt, suit) {
      this.amount = amt;
      this.suit = suit;
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
    var myTable = new bridgeTable;
    myTable.createTable();
  });

});