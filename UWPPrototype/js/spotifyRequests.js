
$(function(){
  console.log('Ready!');
  //duration of the journey in ms
  var refreshToken = refresh_token;
  var accessToken = access_token;
  console.log(access_token);
  console.log(refresh_token);
  console.log(time);
  console.log(id);
  var currentTime = new Date();
  currentTime = currentTime.getUTCHours() + "-" + currentTime.getMinutes() + "-" + currentTime.getSeconds();
  currentTime = currentTime.split("-");
  time = time.split("-");
  console.log(time);
  console.log(currentTime);

  if(timeCompare(time, currentTime)){
    window.location.replace("/refresh_token?refreshToken="+refresh_token+"="+id);
  }
  //request users playlists from spotify api
  $.ajax({
    type:"GET",
    url:"https://api.spotify.com/v1/users/"+id+"/playlists",
    headers: { 'Authorization': 'Bearer ' + access_token },
    success: function(data) {
        //$('.vertical-container-item').html(data.items);
        console.log(data);
        data.items.forEach((item, i) => {
          //try to get seperate CSS file to work + build a good looking css
          var imageURL;
          if(item.images.length == 0){
            imageURL = "../record.jpg";
          }
          else{
            imageURL = item.images[0].url;
          }
          //create the divs to format the json
          var div = $('<div>').addClass('vertical-container-item');
          var title = $('<div>').html(item.name + "</br>\n").addClass('title').css({"margin-top":"5px"});
          var description = $('<div>').html( item.description + "</br>").css({"font-size":"15px","margin-top":"10px"});
          var idPrefix = $('<div>').html("Playlist ID: ").css({"display" : "none"});
          var id = $('<div id="playlistID">').html(item.id).css({"display": "inline-block", "display" : "none"});
          var link = $('<a href='+item.external_urls.spotify+'> '+item.name+' on Spotify </a> </br>').css({"margin-top":"10px", "font-size":"15px"});
          var checkbox = $('<input name="checkbox" type="checkbox" id = "choosePlaylist"> <label for="choosePlaylist">Add to playlist/queue generator</label>').css({"font-size":"15px","margin-top":"10px"});
          var image = $('<img id="img" src='+imageURL+'>').css({"height": "150px", "width": "150px", "margin-right" : "1rem",});

          //stick all of them together
          image.appendTo(div);
          title.appendTo(div);
          description.appendTo(title);
          id.appendTo(idPrefix);
          idPrefix.appendTo(title);
          link.appendTo(title);
          checkbox.appendTo(title);


          div.appendTo('.playlist-items-container');
          //console.log(item.description + " " + item.href);
        });
    }
  });
});

//compares the currentTime with the time that the access token was generated + 1 hour
//this returns true if the currentTime has gone past the accessToken creation time + 1 hour
function timeCompare(time, currentTime) {
    if(time[0] == 24){
      time[0] == 0;
    }
    //console.log(time[0] * 3600 + time[1] * 60 + time[2]);
    console.log(currentTime[0] * 3600 + currentTime[1] * 60 + currentTime[2]);
    if(time[0] * 3600 + 3600 + time[1] * 60 + time[2] <= currentTime[0] * 3600 + currentTime[1] * 60 + currentTime[2]){
      return true;
    }
    return false;
}

//shuffles songs for playlist
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements array[i] and array[j]
    // we use "destructuring assignment" syntax to achieve that
    // you'll find more details about that syntax in later chapters
    // same can be written as:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [array[i], array[j]] = [array[j], array[i]];
  }
}

//returns an array of songs of a playlist
function ajaxRequest(playlists){
  let songs = [];
  $(playlists).each(function(){
    $.ajax({
      type:"GET",
      async:false,
      url:"https://api.spotify.com/v1/playlists/"+$(this).find("#playlistID").html()+"/tracks",
      headers: { 'Authorization': 'Bearer ' + access_token },
      data: {
        offset : 0
      },
      success: function(data){
        //console.log(data);
        $(data.items).each(function(){
          songs.push(this);
        });
        shuffle(songs);
        console.log(songs);
      }
    });
  });
  return songs;
}

//Generates a playlists from selected playlists and map time and displays it
$("#generatePlaylist").click(function(){
  var playlists = [];
  //var limit = 3240000; REPLACED by variable spotifyRequestTime in map.ja
  $('input[name=checkbox]').each(function(object){
    if($(this).prop('checked')){
      //console.log(this);
      let p = $(this).parent();

      //console.log($(this).parent());
      playlists.push(p);
    }
  });
  console.log(playlists);
  var songs = [];
  var finalPlaylist = [];
  songs = ajaxRequest(playlists);
  console.log(songs[0]);
  let time = 0;
  let index = 0;
  while(time < spotifyRequestTime){
    //console.log(songs[index].track.duration_ms);
    time += songs[index].track.duration_ms;
    finalPlaylist.push(songs[index]);
    //console.log(songs[index].track.album.images[0].url);
    index++;
  }
  console.log(finalPlaylist);
  console.log((time/1000)/60);
  $('.generated-playlist-container').empty();
  $('.generated-playlist-container').html('<br><hr>')
  finalPlaylist.forEach((item, i) => {
    var imageURL;
    //when there is no image thumbnail
    if(item.track.album.images.length == 0){
      imageURL = "../record.jpg";
    }
    else{
      imageURL = item.track.album.images[0].url;
    }
    //structure the generated playlist to show the user
    let div = $('<div>').addClass('vertical-container-item');
    let title = $('<div>').html(item.track.name + "</br>\n").addClass('title').css({"text-align" : "left", "margin-top":"5px"});
    let artists = $('<div>').html("Artists: ").css({"font-size":"15px","margin-top":"10px"});
    item.track.artists.forEach((item, i) => {
      let artist = $('<div>').html(" - "+item.name).css({"margin-left": "10px"});
      artist.appendTo(artists);
    });
    let previewURL = item.track.preview_url;
    let play = $('<a href='+previewURL+' target="_blank"> '+item.track.name+' preview </a> </br>').css({"margin-top":"10px", "font-size":"15px"});
    let preview = $('<button onclick=playAudio(this,"'+previewURL+'")>Play</button>');
    let album = $('<div>').html(item.track.album.name).css({"font-size":"15px","margin-top":"10px"});
    let image = $('<img id="img" src='+imageURL+'>').css({"height": "150px", "width": "150px", "margin-right" : "1rem",});
    let link = $('<div class="songURI">').html(item.track.uri).css({"display" : "none"});

    image.appendTo(div);
    title.appendTo(div);
    artists.appendTo(title);
    album.appendTo(title);
    link.appendTo(title);
    play.appendTo(title);
    preview.appendTo(title);
    div.appendTo('.generated-playlist-container');

  });
    let createPlaylist = $('<a>').addClass('funkyButton generatePlaylistButton').html('Create Playlist').attr('id', 'createPlaylist').css({"grid-area": "1 / 6 / 2 / 5"});
    let createQueue = $('<a>').addClass('funkyButton generatePlaylistButton').html('Add to Queue').attr('id', 'createQueue').css({"grid-area": "1 / 6 / 2 / 6"});

    createPlaylist.appendTo('.inline-container');
    createQueue.appendTo('.inline-container');

});

//Plays a 30 second song preview from selected song
//Not all Spotify songs have preview urls so yeah they won't work (eg. WonderWall and Seven Nation Army)
function playAudio(elem, url){
  if($(elem).html() == "Play"){
    //var audio = $('#previewSong');
    var audio = document.getElementById("previewSong");
    //var source = document.getElementById("previewSongSource");
    audio.src = url;
    console.log(audio);

    audio.play();
    $(elem).html("Pause");
  }else{
    var audio = document.getElementById("previewSong");
    //var audio = $('#previewSong');
    console.log(audio);
    audio.pause();
    $(elem).html("Play");
  }
}

//Adds generated playlist to song queue
$(document).on("click", "#createQueue", function(){
  $(".songURI").each(function(object){
    //console.log($(this).html());
    let uri = $(this).html();

    $.ajax({
      type:"POST",
      url:"https://api.spotify.com/v1/me/player/queue?uri="+uri,
      headers: { 'Authorization': 'Bearer ' + access_token },
      error: function(xhr, status, error) {
        var err = eval("(" + xhr.responseText + ")");
        console.log(err);
      },
      success: function(){
        console.log("Songs added to queue");
      }
    });
  });
});

//Adds the generated playlist on the users Spotify account
$(document).on("click", "#createPlaylist", function(){
  var playlistID = "";
  $.ajax({
    type:"POST",
    dataType: 'json',
    url: "https://api.spotify.com/v1/users/"+id+"/playlists",
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
     name: "Your Travel Tracks playlist",
     public: false,
     description: "Enjoy your tunes, brought to you by... well you!"
    }),
    success: function(data){
      playlistID = data.id;
      console.log(playlistID);
      var uris = [];
      $(".songURI").each(function(elements){
        uris.push($(this).html());
        console.log(uris.length);
        if(uris.length == 100){
          console.log('Reached request limit. Starting a new one...');
          $.ajax({
            type:'POST',
            dataType: 'json',
            url: 'https://api.spotify.com/v1/playlists/'+playlistID+'/tracks',
            headers: {
              'Authorization': 'Bearer ' + access_token,
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({
              uris: uris
            }),
            success: function(data){
              console.log('Success!');
            },
            error: function(xhr, status, error) {
              var err = eval("(" + xhr.responseText + ")");
              console.log(err);
            }
          });
          uris = [];
        }
      });
      $.ajax({
        type:'POST',
        dataType: 'json',
        url: 'https://api.spotify.com/v1/playlists/'+playlistID+'/tracks',
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          uris: uris
        }),
        success: function(data){
          console.log('Success!');
        },
        error: function(xhr, status, error) {
          var err = eval("(" + xhr.responseText + ")");
          console.log(err);
        }
      });
    },
    error: function(xhr, status, error) {
      var err = eval("(" + xhr.responseText + ")");
      console.log(err);
    }
  });
});
