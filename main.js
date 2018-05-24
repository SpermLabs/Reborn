var modal;
var modalContent;
var lastNumCells = -1;
var lastNumSperm = -1;
var lastSecondsUntilFull = 0;
var lastEventTime = 0;
var cellsToMake1 = 86400;
var lastUpdate = new Date().getTime();
var web3 = new Web3(window.web3.currentProvider);

function main() {
    modal = document.getElementById('myModal');
    modalContent = document.getElementById('modal-internal');
    controlLoop();
    controlLoopFaster();
}

function controlLoop() {
    refreshData();
    setTimeout(controlLoop, 2500);
}

function controlLoopFaster(){
    liveUpdateCells();
    setTimeout(controlLoopFaster, 30);
}

function refreshData() {
    var sellsforexampledoc = document.getElementById('sellsforexample');
    marketCells(function(cells){
        cells = cells/10;
        calculateCellSell(cells, function(wei){
            devFee(wei, function(fee){
                sellsforexampledoc.textContent = '(' + formatCells(cells) + ' cells would sell for ' + formatEthValue(web3.fromWei(wei - fee, 'ether')) + ')';
            });
        });
    });
    lastEvent(web3.eth.accounts[0], function(lastEvent) {
        lastEventTime = lastEvent;
    });
    CELLS_TO_MAKE_1_SPERM(function(cells) {
        cellsToMake1 = cells;
    });
    getMyCells(function(cells) {
        if (lastNumCells != cells) {
            lastNumCells = cells;
            lastUpdate = new Date().getTime();
            updateCellNumber(formatCells(cells));
        }
        var timeuntilfulldoc = document.getElementById('timeuntilfull');
        lastSecondsUntilFull = cellsToMake1 - cells / lastNumSperm;
        timeuntilfulldoc.textContent = secondsToString(lastSecondsUntilFull);
        if (lastNumSperm == 0) {
            timeuntilfulldoc.textContent = '?';
        }
    });
    getMySperm(function(sperm){
        lastNumSperm = sperm;
        var gfsdoc = document.getElementById('getfreesperm');
        if(sperm > 0)
            gfsdoc.style.display = "none";
        else
            gfsdoc.style.display = "inline-block";

        var allNumSperm = document.getElementsByClassName('numsperm')
        for (var i=0; i < allNumSperm.length; i++) {
            if (allNumSperm[i]) {
                allNumSperm[i].textContent = translateQuantity(sperm, 0);
            }
        }
        var productiondoc = document.getElementById('production');
        productiondoc.textContent = formatCells(lastNumSperm * 60 * 60);
    });
    updateBuyPrice();
    updateSellPrice();
	updateSpermlordPrice();
	updateCurrentSpermlord();
    var prldoc = document.getElementById('playerreflink');
    prldoc.textContent = window.location.protocol + '//' + window.location.host + window.location.pathname + "?ref=" + web3.eth.accounts[0];
    var copyText = document.getElementById("copytextthing");
    copyText.value = prldoc.textContent;
}

function updateCellNumber(cells) {
    var makeSpermQuantity = document.getElementById('makeSpermQuantity');
    makeSpermQuantity.textContent = translateQuantity(cells, 0);
    var allNumCells = document.getElementsByClassName('numcells');
    for (var i=0; i < allNumCells.length; i++) {
        if(allNumCells[i]){
            allNumCells[i].textContent = translateQuantity(cells);
        }
    }
}
function makeSperm1() {
    ref = getQueryVariable('ref'); 
    var blacklistedAddresses = [ "0x86060b7959451f44ea1a15bd2b2da22f28e6f3ce" /* Dapp Radar's Ref Address */ ]; 
    if (!ref || ref == web3.eth.accounts[0] || blacklistedAddresses.indexOf(ref) > -1) { 
        ref=0; 
    }
    makeSperm(ref, displayTransactionMessage());
}
function liveUpdateCells() {
    if (lastSecondsUntilFull > 1 && lastNumCells >= 0 && lastNumSperm > 0 && cellsToMake1 > 0) {
        var currentTime = new Date().getTime();
        if(currentTime / 1000 - lastEventTime > cellsToMake1){
            return;
        }
        var difference = (currentTime - lastUpdate) / 1000;
        var additionalCells = Math.floor(difference * lastNumSperm);
        updateCellNumber(formatCells(lastNumCells + additionalCells))
    }
}
function updateSellPrice() {
    var cellstoselldoc = document.getElementById('sellprice');
    getMyCells(function(cells) {
        calculateCellSell(cells, function(wei) {
            devFee(wei, function(fee) {
                cellstoselldoc.textContent = formatEthValue(web3.fromWei(wei - fee, 'ether'));
            });
        });
   });
}

function updateBuyPrice() {
    var cellstobuydoc = document.getElementById('cellstobuy');
    var ethtospenddoc = document.getElementById('ethtospend');
    var weitospend = web3.toWei(ethtospenddoc.value, 'ether');
    calculateCellBuySimple(weitospend, function(cells){
        devFee(cells, function(fee){
            cellstobuydoc.textContent = formatCells(cells - fee);
        });
    });
}

function updateSpermlordPrice() {
    var spermlordpricedoc = document.getElementById('spermlordprice');
	getSpermlordReq(function(req) {
		spermlordpricedoc.textContent = translateQuantity(req, 0);
	});
}

function updateCurrentSpermlord() {
    var currentspermlorddoc = document.getElementById('currentspermlord');
    spermlordAddress(function(address) {
        //currentspermlorddoc.textContent = address;
    });
}

function getFreeSperm1() {
    var weitospend = web3.toWei(0.001, 'ether')
    getFreeSperm(weitospend, function() {
        displayTransactionMessage();
    });
}
	
function buyCells2() {
    var ethtospenddoc = document.getElementById('ethtospend');
    var weitospend = web3.toWei(ethtospenddoc.value, 'ether');
    buyCells(weitospend, function() {
        displayTransactionMessage();
    });
}
function formatCells(cells){
    return translateQuantity(cells / cellsToMake1);
}

function translateQuantity(quantity, precision) {
    quantity = Number(quantity);
    var finalquantity = quantity;
    var modifier = '';
    if (precision == undefined) {
        precision=0;
        if (quantity < 10000) {
            precision = 1;
        }
        if (quantity < 1000) {
            precision = 2;
        }
        if (quantity < 100) {
            precision = 3;
        }
        if (quantity < 10) {
            precision = 4;
        }
    }
    if(quantity > 1000000) {
        modifier = 'M';
        finalquantity = quantity / 1000000;
    }
    if(quantity > 1000000000) {
        modifier = 'B';
        finalquantity = quantity / 1000000000;
    }
    if(quantity > 1000000000000) {
        modifier = 'T';
        finalquantity = quantity / 1000000000000;
    }
    if(precision == 0) {
        finalquantity = Math.floor(finalquantity);
    }
    return finalquantity.toFixed(precision) + modifier;
}

function removeModal() {
    modalContent.innerHTML = "";
    modal.style.display = "none";
}
function displayTransactionMessage() {
    displayModalMessage("Transaction submitted! This can take a while depending on the state of the Ethereum Network.");
}

function displayModalMessage(message) {
    modal.style.display = "block";
    modalContent.textContent = message;
    setTimeout(removeModal, 3000);
}
function weiToDisplay(ethprice) {
    return formatEthValue(web3.fromWei(ethprice, 'ether'));
}
function formatEthValue(ethstr) {
    return parseFloat(parseFloat(ethstr).toFixed(5));
}
function getQueryVariable(variable) {
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
   }
   return(false);
}

function copyRef() {
  var copyText = document.getElementById("copytextthing");
  copyText.style.display="block"
  copyText.select();
  document.execCommand("Copy");
  copyText.style.display="none";
  displayModalMessage("copied link to clipboard");
}

function secondsToString(seconds)
{
    var seconds = Math.max(seconds,0);
    var numdays = Math.floor(seconds / 86400);

    var numhours = Math.floor((seconds % 86400) / 3600);

    var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);

    var numseconds = ((seconds % 86400) % 3600) % 60;
    var endstr = "";
    
    return numhours + "h " + numminutes + "m ";
}
function disableButtons() {
    var allButtons = document.getElementsByClassName('btn-lg');
    for(var i=0;i<allButtons.length;i++){
        if(allButtons[i]){
            allButtons[i].style.display="none";
        }
    }
}
function enableButtons(){
    var allButtons=document.getElementsByClassName('btn-lg');
    for(var i=0;i<allButtons.length;i++){
        if(allButtons[i]){
            allButtons[i].style.display="inline-block";
        }
    }
}
web3.version.getNetwork((err, netId) => {
    if(netId!="1"){
        displayModalMessage("Please switch to the Ethereum Mainnet!");
        disableButtons();
    }
})
