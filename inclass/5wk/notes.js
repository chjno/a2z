/*
  twitter doesn't allow searching by regex
    search to narrow down, then regex on results
*/

/*
  save json results to file instead of console logging for easier analysis
    JSON.stringify
    example 3 from class "I feel like"
*/

// sort takes a function
  array.sort(function(a, b) {
    if (counts[a] < counts[b]) {
      return 1;
    } else {
      return -1;
    }
  });
  
/*
  TF-IDF

    if looking at wikipedia articles (documents),
      for common words (terms)
        term freq and doc freq will be high
      for words specific to one article
        term freq will be high, doc freq will be low
*/