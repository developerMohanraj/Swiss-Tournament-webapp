$(document).ready(function() {

    function allTourney() {
        $.ajax({
            url: '/dashboard/alltourn',
            success: function(res) {
                var table=$('.tournyTable')
                table.removeClass("hidden")
                $('#tournyBody').html('');
                var tournaments=JSON.parse(res)
                console.log(tournaments)
                tournaments.forEach(function(tourney) {
                    $('#tournyBody').append(
                        '<tr>'+'<td class="text-center">'+`<a href="/dashboard/tournament/status?tName=`+tourney.tournament_name+`"><h4 class="well well-sm">`+tourney.tournament_name+'</h4></td>'+'<td class="text-center"><h4 class="well well-sm">'+tourney.status+'</h4></td>'+'</tr>')
                })
            }
        })
    }
    allTourney();
})
