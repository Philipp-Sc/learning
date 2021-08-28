const getLichessUrlForImport = async(player_pgn_db) => {
   const requestOptions = {
        method: 'POST', 
        headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' },
        body: "pgn="+player_pgn_db[player_pgn_db.length-1] 
    }; 
    const response = await fetch('https://lichess.org/api/import', requestOptions);
    const data = await response.json();
    if(response.ok){
      return data.url;
    }else{
      return "https://lichess.org";
    }
}

export const exportToLichess = (player_pgn_db) => {
  var windowReference = window.open();
  getLichessUrlForImport(player_pgn_db).then(function(url) {
     windowReference.location = url;
  });
}