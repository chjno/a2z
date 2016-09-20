

/*
    split vs. match/replace
*/

    s.split(/(\W+)/);

    if (!/\W+/.test(words[i]))


    s.match(/\w+/g);





    function replacer(match) {
        console.log(match);
        return 'ze';
    }

    s.replace(/\b\w{3}\b/g), replacer);


/*
    closures - need them when
    1) something happens later
    2) callback needs an argument
*/

    // also don't define a function in a loop
    for (var i = 0; i < 10; i++) {
        setTimeout(count, i*1000);
        function count() {
            createP(i);
        }
    }

    // instead
    function countIt(value, when) {
        setTimeout(count, when);
        function count() {
            createP(value);
        }
    }

    for (var i = 0; i < 10; i++) {
        countIt(i, i*500);
    }


// any html tag
    <h2 contenteditable></h2>


/*
    persistence
        google doc
        database as service
            mongolabs
            firebase
        your own database
            node + server side programming
*/
