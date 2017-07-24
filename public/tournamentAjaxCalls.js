
$(document).ready(function() {

    function start() {
        var tourney = $('#tourneyName').val();
        updateCurrentStanding();
        $.ajax({
            url     :'/dashboard/tournament/getDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                var tournament=JSON.parse(res);
                console.log(tournament)
                if(tournament.matches.length>0) {
                    $('#startTournament').click();
                    updateCurrentStanding();
                }
                if(tournament.players.length>0) {
                    $('#playerTableContent').html('');
                    var players=tournament.players;
                    players.forEach(function(player) {
                    $('#playerTableContent').append(
                        '<tr>'+'<td class="text-center">'+player.name+'</td>'+'</tr>')
                    })

                }
                console.log("tourneyname " ,tournament.tournament_name)
                if(tournament.matches.length>0 && tournament.matches[tournament.matches.length-1].winner){
                    showWinner();
                    updateCurrentStanding();
                    $('#startTournament').click();
                }
            }
        })
    }
    start();

    function showWinner() {
        var tourney=$('#tourneyName').val()
        $.ajax({
            url     :'/dashboard/tournament/getDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                var tournament=JSON.parse(res);
                var round=tournament.matches[tournament.matches.length-1].round
                if(Math.log2(tournament.players.length)==round&&tournament.matches[tournament.matches.length-1].winner!=null) {
                    $.ajax({
                        url: '/dashboard/tournament/points?tName='+tourney,
                        success: function(res) {
                            $('#currentStanding').html('');
                            var currentStanding=JSON.parse(res)
                            var winner=currentStanding[0];
                            $('#modalHeader').html('');
                            $('#modalBody').html('');
                            $('#modalBody').append(`<h2 class="text-center"><kbd>`+winner._player.name+`</kbd></h2>`);
                            $('#modalHeader').append(`<h2 class="text-center">Winner Annonuncement</h2>`);
                            $('#myModal').modal('show');
                        }
                    })
                }
            }
        })
    }

    function updateCurrentStanding() {
        var tourney=$('#tourneyName').val()
        $.ajax({
            url: '/dashboard/tournament/points?tName='+tourney,
            success: function(res) {
                $('#currentStanding').html('');
                var currentStanding=JSON.parse(res)
                currentStanding.forEach(function(player) {
                    $('#currentStanding').append(
                        '<tr>'+'<td class="text-center">'+player._player.name+'</td>'+'<td class="text-center">'+player._point+'</td>'+'</tr>')
                })

            }
        })
    }
    $('#addplayer').click(function() {
        var tourney=$('#tourneyName').val()
        var player=$('#playername').val();
        $.ajax({
            url     :'/dashboard/tournament/getDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                var tournament=JSON.parse(res);
                if(tournament.status=="NOTSTARTED") {
                    if(player){
                        $.ajax({
                            url     :'/addplayer',
                            method  : 'POST',
                            data    : {'playername':player,'tourney':tourney},
                            success : function(res) {
                                if(res.status){
                                    if(res.status=="exist"){
                                        $('#playername').notify("Player already added in this tournament")
                                    }
                                    if(res.status=="dbError"){
                                        $('#playername').notify("something went wrong. Please try again")
                                    }
                                }
                                else{
                                    $('#playerTableContent').html('');
                                    var tournament=JSON.parse(res);
                                    updateCurrentStanding();
                                    var players=tournament.players;
                                    players.forEach(function(player) {
                                         $('#playerTableContent').append(
                                        '<tr>'+'<td class="text-center">'+player.name+'</td>'+'</tr>')
                                    })
                                    updateCurrentStanding();
                                }
                            }
                        })
                    }
                    else {
                        $('#playername').notify("player name is mandatory")
                    }

                }
                else{

                    $('#modalHeader').html('');
                    $('#modalBody').html('');
                    $('#modalHeader').append("ERROR");
                    $('#modalBody').append(`<h4 class="text-center">Tournament `+tournament.tournament_name+` already started</h4>`)
                    $('#myModal').modal('show');
                }
            }
        })

    })

    function pairNow()  {
        var tourney=$('#tourneyName').val();
        $.ajax({
            url     :'/dashboard/tournament/getDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(tourn) {
                var tournament=JSON.parse(tourn);

                $.ajax({
                    url     :'/dashboard/tournament/status/pair',
                    method  :'POST',
                    data    : {'tourney':tourney},
                    success : function(res) {

                        $('#startTournament').click();
                    }
                })

            }
        })
    }
    $('#startTournament').click(function() {
        var round   =0;
        var tourney = $('#tourneyName').val();
        $.ajax({
            url     :'/dashboard/tournament/getDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                var tournament=JSON.parse(res);
                if(tournament.players.length>1&&Number.isInteger(Math.log2(tournament.players.length))){
                    if(tournament.matches.length>0){
                        var round=tournament.matches[tournament.matches.length-1].round
                        if(Math.log2(tournament.players.length)>=round){
                            $("#startTournament").html('');
                            $("#startTournament").prop('disabled', true).removeClass('glyphicon-play-circle').addClass('glyphicon glyphicon-pause');
                            $("#startTournament").append('Running');
                            $('#addplayer').prop('disabled',true)
                            if(Math.log2(tournament.players.length)==round&&tournament.matches[tournament.matches.length-1].winner!=null) {
                                $("#startTournament").html('');
                                $("#startTournament").removeClass('glyphicon glyphicon-pause').addClass('glyphicon glyphicon-stop');
                                $("#startTournament").append('Completed');
                                $('#addplayer').prop('disabled',true)
                            }
                        }
                    }
                    var tab=$('#statusBoard');
                    tab.html('');
                    if(tournament.matches.length>0) {

                        var lastRound=tournament.matches[tournament.matches.length-1].round;
                        var rows=Math.log2(tournament.players.length);
                        var roundStatus= tournament.matches[tournament.matches.length-1].winner;
                        for(var i=1;i<=rows;i++) {
                            if(i<lastRound ) {
                                if(roundStatus!=null) {
                                    tab.append(
                                        '<tr>'+
                                        '<td class="text-center">'+i+'</td>'+
                                        '<td class="text-center">'+'Completed'+'</td>'+
                                        '<td class="text-center">'+
                                        '<button type="submit" id="thisRoundDetails" class="btn btn-info btn-sm">Details</button>'+'</td>'+
                                        '<td class="text-center">'+
                                        'Result Declared'+'</td>'+
                                        '</tr>');
                                    updateCurrentStanding();
                                }
                                else{
                                    tab.append(
                                        '<tr>'+
                                        '<td class="text-center">'+i+'</td>'+
                                        '<td class="text-center">'+'Completed'+'</td>'+
                                        '<td class="text-center">'+
                                        '<button type="submit" id="thisRoundDetails" class="btn btn-info btn-sm">Report</button>'+'</td>'+
                                        '<td class="text-center">'+'Result Declared'+'</td>'+'</tr>')
                                }
                            }

                            else if(i==lastRound) {
                                if(roundStatus==null) {
                                    tab.append(
                                        '<tr>'+
                                        '<td class="text-center" id="thisRound">'+lastRound+'</td>'+
                                        '<td class="text-center">'+'Yet to report result'+'</td>'+
                                        '<td class="text-center">'+'<button type="submit" id="thisRoundDetails" class="btn btn-info btn-sm">Details</button>'+'</td>'
                                        +'</td>'+
                                        '<td class="text-center">'+
                                        '<button id="thisRoundReport" class="btn btn-info btn-sm">Declare result</button>'+'</td>'
                                        +'</tr>')

                                }
                                else{

                                    tab.append(
                                        '<tr>'+
                                        '<td class="text-center" id="round">'+lastRound+'</td>'+
                                        '<td class="text-center">'+'Completed'+'</td>'+
                                        '<td class="text-center">'+
                                        '<button type="submit" id="thisRoundDetails" class="btn btn-info btn-sm">Details</button>'+'</td>'+
                                        '<td class="text-center">'+
                                        'Result Declared'+'</td>'+
                                        '</tr>');
                                }
                            }
                            else if(i>lastRound) {
                                tab.append(
                                    '<tr>'+
                                    '<td class="text-center">'+i+'</td>'+
                                    '<td class="text-center">'+'<button type="submit" id="pairNow" class="btn btn-info btn-sm" >pair</button>'+'</td>'+
                                    '<td class="text-center">'+'Yet to be Paired'+'</td>'
                                    +'</td>'+
                                    '<td class="text-center">'+'Yet to be Paired'+'</td>'
                                    +'</tr>')
                                $('#thisRoundDetails').prop('disabled',false)
                            }
                        }
                    }
                    else{
                        $('#addplayer').prop('disabled',true)
                    tab.append(
                        '<tr>'+
                            '<td class="text-center">'+1+'</td>'+
                            '<td class="text-center">'+'<button type="submit" id="pairNow" class="btn btn-info btn-sm">pair</button>'+'</td>'+
                            '<td class="text-center">'+'Yet to be Paired'+'</td>'
                            +'</td>'+
                            '<td class="text-center">'+'Yet to be Paired'+'</td>'
                        +'</tr>')
                    }
                }
                else {
                    $('#addplayer').prop('disabled',false)
                    $('#modalHeader').html('');
                    $('#modalBody').html('');
                    $('#modalHeader').append("ERROR");
                    $('#modalBody').append(`<h4 class="text-center">Tournament `+tournament.tournament_name+` should have 2^n players only</h4>`)
                    $('#myModal').modal('show');
                }

            }
        })
    })


    $('body').on('click','#pairNow',function() {
        pairNow() ;

    })

    $('body').on('click','#thisRoundReport',function() {
        var tourney = $('#tourneyName').val();
        $.ajax({
            url     :'/dashboard/tournament/getReport',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                $('#modalHeader').html('');
                $('#modalBody').html(res);
                $('#modalHeader').append("Declare Result");
                $('#myModal').modal('show');

            }
        })
    })

    $('body').on('click','#thisRoundDetails',function() {
        var tourney = $('#tourneyName').val();
        $.ajax({
            url     :'/dashboard/tournament/matchDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                $('#modalHeader').html('');
                $('#modalBody').html(res);
                console.log(res)
                $('#modalHeader').append("Match Details");
                $('#myModal').modal('show');
            }
        })
    })

    $('body').on('click','#modalClose',function() {

        var tourney = $('#tourneyName').val();
        $.ajax({
            url     :'/dashboard/tournament/getDetails',
            method  :'GET',
            data    : {'tName':tourney},
            success : function(res) {
                var tournament=JSON.parse(res);
                if(tournament.matches.length>0 && tournament.matches[tournament.matches.length-1].winner){
                    updateCurrentStanding();
                }
            }
        })
    })
    $('body').on('click','#submitWinner',function() {
        var tourney = $('#tourneyName').val();
        var winner;
        $('#modalBodyTable select').each(function(index) {
              if($(this).val().length!=0) {
                winner=$(this).val();
            }
        })
        $.ajax({
            url     :'/declarewinner',
            method  :'POST',
            data    : {'tName':tourney,'winner':winner},
            success : function(result) {
                winner=null;
                $('#modalBodyTable select').each(function(index) {
                    if($(this).val().length!=0) {
                        $(this).parent().parent().parent().remove();
                    }
                })
                updateCurrentStanding();
                showWinner();$('#startTournament').click();
            }
        })
    })
})
