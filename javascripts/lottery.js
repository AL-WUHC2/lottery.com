var Lottery = {};

window.sessionStorage.currentState = window.sessionStorage.currentState || "initial";
Lottery.currentOrder = 0;

Lottery.initSetting = function() {
    Lottery.settingData = $.evalJSON(window.localStorage.n3rLotteryData || "{"
            + "\"lotteryTitle\": \"年会抽奖\", "
            + "\"lotteryLs\": [{\"lName\": \"三等奖\", \"lCount\": 4}, "
                          + "{\"lName\": \"二等奖\", \"lCount\": 2}, "
                          + "{\"lName\": \"一等奖\", \"lCount\": 1}], "
            + "\"memberLs\": [\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\", \"10\", "
                         + "\"11\", \"12\", \"13\", \"14\", \"15\", \"16\", \"17\", \"18\", \"19\", "
                         + "\"20\", \"21\", \"22\", \"23\", \"24\"], "
            + "\"lotteryProperty\": {\"lotteryConfirm\": false}}");
    
    $("#lotteryTitle").val(Lottery.settingData.lotteryTitle);
    
    var lotteryLsContent = "";
    for (var i = 0; i < Lottery.settingData.lotteryLs.length; i++) {
        lotteryLsContent += Lottery.settingData.lotteryLs[i].lName
                          + "|" + Lottery.settingData.lotteryLs[i].lCount;
        if (i + 1 < Lottery.settingData.lotteryLs.length) lotteryLsContent += "\n";
    }
    $("#lotteryLs").html(lotteryLsContent);
    
    var memberLsContent = "";
    for (var i = 0; i < Lottery.settingData.memberLs.length; i++) {
        memberLsContent += Lottery.settingData.memberLs[i];
        if (i + 1 < Lottery.settingData.memberLs.length) memberLsContent += ",";
    }
    $("#memberLs").html(memberLsContent);
    
    if (Lottery.settingData.lotteryProperty.lotteryConfirm) {
        $("#lotteryConfirm").attr("checked", "checked");
    } else {
        $("#lotteryConfirm").removeAttr("checked");
    }
}

Lottery.showSetting = function() {
    window.sessionStorage.currentState = "setting";
    $("#settingPage").show().siblings().hide();
}

Lottery.saveSetting = function() {
    Lottery.settingData = $.evalJSON(window.localStorage.n3rLotteryData || "{}");
    
    Lottery.settingData.lotteryTitle = $("#lotteryTitle").val();
    
    Lottery.settingData.lotteryLs = [];
    var lotteryLs = $.trim($("#lotteryLs").val()).split("\n");
    for (var i = 0; i < lotteryLs.length; i++) {
        var lot = $.trim(lotteryLs[i]);
        if (lot.length == 0) continue;
        
        var temp = lot.split("|");
        Lottery.settingData.lotteryLs.push({
            "lName": temp[0],
            "lCount": parseInt(temp[1])
        });
    }
    
    Lottery.settingData.memberLs = [];
    var memberLs = $.trim($("#memberLs").val()).replace(/,/g, "\n").split("\n");
    for (var i = 0; i < memberLs.length; i++) {
        var mem = $.trim(memberLs[i]);
        if (mem.length == 0) continue;
        
        Lottery.settingData.memberLs.push(mem);
    }
    
    Lottery.settingData.lotteryProperty = {};
    Lottery.settingData.lotteryProperty.lotteryConfirm = $("#lotteryConfirm").attr("checked") ? true : false;
    
    window.localStorage.n3rLotteryData = $.toJSON(Lottery.settingData);
    
    Lottery.showLottery();
}
$("#saveSetting").live("click", Lottery.saveSetting);

Lottery.showLottery = function() {
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;
    $("#lotteryPage").css("width", width + "px");
    $("#lotteryPage").css("height", height + "px");
    
    var memberCount = Lottery.settingData.memberLs.length;
    var colCount = Math.ceil(Math.sqrt(memberCount));
    var rowCount = memberCount <= colCount * (colCount - 1) ? colCount - 1 : colCount;
    
    Lottery.currentMemberLs = [];
    for (var i = 0; i < memberCount; i++) {
        Lottery.currentMemberLs.push({
            "mName": Lottery.settingData.memberLs[i],
            "mWin": false
        });
    }
    Lottery.currentMemberLs = shuffle(Lottery.currentMemberLs);
    
    Lottery.winnersLs = [];
    var lotteryCount = Lottery.settingData.lotteryLs.length;
    for (var i = 0; i < lotteryCount; i++) {
        var lotteryItem = Lottery.settingData.lotteryLs[i];
        for (var j = 0; j < lotteryItem.lCount; j++) {
            Lottery.winnersLs.push({
                "lName": lotteryItem.lName,
                "lCount": lotteryItem.lCount,
                "winner": ""
            });
        }
    }
    Lottery.currentLotteryOrder = 0;
    
    var itemWidth = width / colCount - 4;
    var itemHeight = height / rowCount - 2;
    var lotteryContent = "";
    for (var i = 0; i < rowCount; i++) {
        for (var j = 0; j < colCount; j++) {
            if (i * colCount + j >= memberCount) {
                lotteryContent += "<div class=\"lotteryItem\" ord=\""
                                + (i * colCount + j + "") + "\"><label>&nbsp;</label>"
                                + "<div class=\"lotteryItemMask\"><img src=\"images/ma" + (i * colCount + j + 1 + "")
                                + ".gif\" alt=\" \" width=\"100%\" height=\"100%\"/></div></div>";
            } else {
                lotteryContent += "<div class=\"lotteryItem\" id=\"li_"
                                + Lottery.currentMemberLs[i * colCount + j].mName + "\" ord=\""
                                + (i * colCount + j + "") + "\"><label>"
                                + Lottery.currentMemberLs[i * colCount + j].mName +"</label>"
                                + "<div class=\"lotteryItemMask\"><img src=\"images/ma" + (i * colCount + j + 1 + "")
                                + ".gif\" alt=\" \" width=\"100%\" height=\"100%\"/></div></div>";
            }
        }
    }
    $("#lotteryPage").html(lotteryContent);
    
    $(".lotteryItem").css("width", itemWidth + "px");
    $(".lotteryItem").css("height", itemHeight + "px");
    $(".lotteryItem").css("line-height", itemHeight + "px");
    
    $(".lotteryItemMask").css("top", -itemHeight);
    $(".lotteryItemMask").css("left", 0);
    
    window.sessionStorage.currentState = "standby";
    $("#lotteryPage").show().siblings().hide();
    Lottery.showMessage("开始抽奖");
}

Lottery.showMessage = function(message) {
    $(".thickdiv").css("width", document.body.offsetWidth + "px");
    $(".thickdiv").css("height", document.body.offsetHeight + "px");
    $(".thickdiv").css("line-height", document.body.offsetHeight + "px");
    $(".thickdiv").html(message);
    $(".thickdiv").show();
}

Lottery.hideMessage = function() {
    $(".thickdiv").hide();
}

Lottery.startLottery = function() {
    if (Lottery.currentLotteryOrder >= Lottery.winnersLs.length) {
        Lottery.showMessage("抽奖结束");
        return;
    }
    window.sessionStorage.currentState = "lottery";
    Lottery.doLottery();
    Lottery.hideMessage();
}

Lottery.doLottery = function() {
    if (window.sessionStorage.currentState == "standby") {
        Lottery.highlightCurrentItem();
        
        if (Lottery.settingData.lotteryProperty.lotteryConfirm) {
            window.sessionStorage.currentState = "confirm";
            Lottery.showMessage("是否确认中奖？（Y/N）");
        } else {
            Lottery.confirmLottery();
        }
    } else {
        Lottery.currentOrder = Lottery.nextRandomOrder();
        Lottery.highlightCurrentItem();
        setTimeout("Lottery.doLottery()", 100);
    }
}

Lottery.confirmLottery = function() {
    var currentMember = $(".lotteryItem[ord=\"" + Lottery.currentOrder + "\"]").children("label").html();
    Lottery.winnersLs[Lottery.currentLotteryOrder].winner = currentMember;
    Lottery.showMessage(Lottery.formatWinnerMessage(currentMember));
    Lottery.currentLotteryOrder += 1;
}

Lottery.yesConfirmLottery = function() {
    Lottery.confirmLottery();
    window.sessionStorage.currentState = "standby";
}

Lottery.noConfirmLottery = function() {
    Lottery.startLottery();
}

Lottery.nextRandomOrder = function() {
    var memberCount = Lottery.settingData.memberLs.length;
    var increase = parseInt(Math.random() * (memberCount - 1)) + 1;
    return (Lottery.currentOrder + increase) % memberCount;
}

Lottery.highlightCurrentItem = function() {
    $(".lotteryItem[ord=\"" + Lottery.currentOrder + "\"]").addClass("lotteryItemSelected").siblings().removeClass("lotteryItemSelected");
    $(".lotteryItem").children(".lotteryItemMask").show();
    $(".lotteryItemSelected").children(".lotteryItemMask").hide();
}

Lottery.formatWinnerMessage = function(winnerId) {
    return "第" + winnerId + "桌";
}

Lottery.stopLottery = function() {
    window.sessionStorage.currentState = "standby";
}

function shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

$(document).ready(function() {

    Lottery.initSetting();
    if (window.sessionStorage.currentState != "initial") Lottery.showLottery();

});

$(document).keypress(function(e) {
    switch(e.which){
    case 32: // space
        if (window.sessionStorage.currentState == "initial") {
            window.localStorage.n3rLotteryData ? Lottery.showLottery() : Lottery.showSetting();
        } else if (window.sessionStorage.currentState == "standby") {
            Lottery.startLottery();
        } else if (window.sessionStorage.currentState == "lottery") {
            Lottery.stopLottery();
        }
        break;
    case 13: // enter
        if (window.sessionStorage.currentState == "standby") {
            Lottery.showSetting();
        }
        break;
    case 89:
    case 121: // confirm positive
        if (window.sessionStorage.currentState == "confirm") {
            Lottery.yesConfirmLottery();
        }
        break;
    case 78:
    case 110: // confirm negative
        if (window.sessionStorage.currentState == "confirm") {
            Lottery.noConfirmLottery();
        }
        break;
    }
});
