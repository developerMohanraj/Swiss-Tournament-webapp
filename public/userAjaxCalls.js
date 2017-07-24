$(document).ready(function() {

    $('#registerUser').on('click',function() {

        var firstName=$('#firstname').val();
        var lastName =$('#lastname').val();
        var email    =$('#email').val();
        var password =$('#password').val();
        var address  =$('#addr').val();
        var mobile   =$('#mob').val();
        if(firstName&&lastName&&email&&password&&address&&mobile) {
            if($.isNumeric( mobile) &&mobile.length==10 ){
                $.ajax({
                    url         :'/register/createprofile',
                    method      :'post',
                    data        : {'firstname':firstName,'lastName':lastName,'email':email,'password':password,'address':address,'mobile':mobile},
                    success     :function(res) {
                        if(res.status=="success") {
                            $('#modalHeader').html('');
                            $('#modalBody').html('');
                            $('#modalHeader').append("Success");
                            $('#modalBody').append(`<h4 class="text-center class="alert alert-success"">Registered successfully!! <a href="/login"> LOGIN NOW</a></h4>`)
                            $('#myModal').modal('show');
                        }
                        else if(res.status=="fail") {
                            $('body').notify('Something went wrong')
                        }
                        else if(res.status=="exist") {
                            $('#emailError').notify('Email already registered with SwissyMent')
                        }
                    },
                    error: function(err) {
                        $('#commonErr').notify('Could not connect. Please check your connection.')
                    }
                })
            }
            else {
                $('#mobEr').notify('Please enter valid number')
            }
        }
        else{
           if(firstName=='') {
                $('#firstnameEr').notify('first name is mandatory');
            }
            if(lastName=='') {
                $('#lastnameEr').notify('last name is mandatory');
            }
            if(email=='') {
                $('#emailError').notify('email is mandatory');
            }
            if(password=='') {
                $('#passwordEr').notify('password is mandatory');
            }
            if(address=='') {
                $('#addrEr').notify('address is mandatory');
            }
            if(mobile=='') {
                $('#mobEr').notify('mobile number is mandatory');
            }
        }
    })
    $('#login').click(function(){
        var email=$('#email').val();
        var password=$('#password').val();
        if(email&&password) {
            $.ajax({
                url     :'/user',
                method  :'post',
                data    :{'email':email,'password':password},
                success :function(res) {
                    if(res.status=="success"){
                        window.location.replace("/dashboard")
                    }
                    else if(res.status=="invalid") {
                        $('#password').notify("invalid password")
                    }
                    else if(res.status=="register") {
                        $('#email').notify("email is not registered with SwissyMent")
                    }

                },
                error: function(err) {
                    $.notify('Could not connect. Please check your connection.')
                }
            })
        }
        else{
            if(email=='') {
                $('#email').notify('email is mandatory');
            }
            if(password=='') {
                $('#password').notify('password is mandatory');
            }
        }
    })
    $('#createtournament').click(function(){
        var tourney=$('#tourney').val();
        if(tourney) {
            $.ajax({
                url     :'/createtournament',
                method  :'post',
                data    :{'tourney':tourney},
                success :function(res) {
                    if(res.status=="success"){
                        window.location.replace("/dashboard")
                    }
                    else if(res.status=="exist") {
                        $('#tourney').notify("This tournament already created.Please create with new name")
                    }
                    else if(res.status=="userError") {
                        $('#tourney').notify("something went wrong.. please try again")
                    }
                    else if(res.status=="tournamentError") {
                        $('#tourney').notify("something went wrong.. please try again")
                    }
                },
                error: function(err) {
                    $.notify('Could not connect. Please check your connection.')
                }
            })
        }
        else{
            $('#tourney').notify("tournament name is mandatory")
        }
    })
    $('#logout').click(function(){
        $.ajax({
            url:'/logout',
            method:'get',
            success:function() {
                window.location.replace("/login")
            },
            error:function(err) {
                 $.notify('Something went wrong. Please check your connection.')
            }
        })
    })

})
