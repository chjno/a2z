var penn = {
    "cc": "Coordinating conjunction",
    // "cd": "Cardinal number",
    // "dt": "Determiner",
    // "ex": "Existential there",
    // "fw": "Foreign word",
    "in": "Preposition or subordinating conjunction",
    "jj": "Adjective",
    "jjr": "Adjective, comparative",
    "jjs": "Adjective, superlative",
    // "ls": "List item marker",
    // "md": "Modal",
    "nn": "Noun, singular or mass",
    "nns": "Noun, plural",
    "nnp": "Proper noun, singular",
    "nnps": "Proper noun, plural",
    "pdt": "Predeterminer",
    // "pos": "Possessive ending",
    "prp": "Personal pronoun",
    "prp$": "Possessive pronoun",
    "rb": "Adverb",
    "rbr": "Adverb, comparative",
    "rbs": "Adverb, superlative",
    // "rp": "Particle",
    // "sym": "Symbol",
    // "to": "to",
    // "uh": "Interjection",
    "vb": "Verb, base form",
    "vbd": "Verb, past tense",
    "vbg": "Verb, gerund or present participle",
    "vbn": "Verb, past participle",
    "vbp": "Verb, non-3rd person singular present",
    "vbz": "Verb, 3rd person singular present",
    // "wdt": "Wh-determiner",
    // "wp": "Wh-pronoun",
    // "wp$": "Possessive wh-pronoun",
    // "wrb": "Wh-adverb"
}

var options = {
    'Conjunctions': ['cc','in'],
    'Adjectives': ['jj','jjr','jjs'],
    'Nouns': ['nn','nns','nnp','nnps'],
    // 'Predeterminers': ['pdt'],
    'Pronouns': ['prp','prp$'],
    'Adverbs': ['rb','rbr','rbs'],
    // 'Interjections': ['uh'],
    'Verbs': ['vb','vbd','vbg','vbn','vbp','vbz']
}

var onTags = [];

function loadJSON(callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'creds.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
        callback(xobj.responseText);
        }
    };
    xobj.send(null);  
}

var textBox;
var text;
var submit;
var original;
var syns = {};

function whenPageLoads() {
    for (var property in options) {
        if (options.hasOwnProperty(property)) {
            $(document.body).prepend('<label><input type="checkbox" id=' + property + '>' + property + '</label><br>');
        }
    }
    $(document.body).prepend('<p>In which ways would you like to sound smarter?</p>');
    $(document.body).prepend('<h2>Me Sound Smart takes your text and makes you sound smarter.</h2>');
    textBox = document.getElementById('textBox');
    submit = document.getElementById('button');
    original = document.getElementById('original');
    text = document.getElementById('text')
    submit.addEventListener('click', smartify);
    document.getElementById('textBox').focus();
}

function getData(url, dumbWord, index, smartText, spans) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function() {
        var data = JSON.parse(this.responseText);
        if (data.length > 0) {
            syns[dumbWord] = JSON.parse(this.responseText)[0].words.sort(function(a, b){return b.length - a.length;});
            smartText[index] = syns[dumbWord][0];
            spans[index] = "<span id=\"" + dumbWord + "\" class=\"smart\">" + smartText[index] + '</span>';
            // spans[index] = "<span id=\"" + index.toString() + "\" class=\"smart\">" + smartText[index] + '</span>';
        } else {
            syns[dumbWord] = [];
            smartText[index] = dumbWord;
            spans[index] = "<span>" + smartText[index] + '</span>';
            // spans[index] = "<span id=\"" + index.toString() + "\">" + smartText[index] + '</span>';
        }
        text.innerHTML = spans.join('');
    });
    oReq.open('GET', url);
    oReq.send();
}

function smartify() {
    document.getElementById('textBox').focus();   
    // var dumbText = document.getElementById('textBox').value.replace(/\s+/g, ' ').split(' ');
    // console.log(dumbText);

    var dumbText = document.getElementById('textBox').value.trim().match(/(?=\S*['-])([a-zA-Z'-]+)|\w+|\W/g);
    // console.log(dumbText);


    // console.log(RiTa.getPosTags(dumbText));
    var dumbTags = RiTa.getPosTags(dumbText);
    var spans = [];

    // text.innerHTML = 'Optimizing smart...';

    loadJSON(function(response) {
        text.innerHTML = '';
        var key = JSON.parse(response).wordnikKey;
        var smartText = [];
        for (var i = 0; i < dumbText.length; i++) {
            if (dumbText[i].match(/\w/)) {
                // if (dumbTags[i] == 'nn' || 'vbn') {
                if (onTags.indexOf(dumbTags[i]) != -1) {
                    if (syns.hasOwnProperty(dumbText[i])) {
                        // console.log(dumbText[i] + ' already in syns');
                        if (syns[dumbText[i]].length == 0) {
                            smartText[i] = dumbText[i];
                            spans[i] = "<span>" + smartText[i] + '</span>';
                        } else {
                            smartText[i] = syns[dumbText[i]][0];
                            spans[i] = "<span id=\"" + dumbText[i] + "\" class=\"smart\">" + smartText[i] + '</span>';
                        }
                    } else {
                        // console.log('looking up ' + dumbText[i]);
                        var url = 'http://api.wordnik.com:80/v4/word.json/' + dumbText[i] + '/relatedWords?useCanonical=false&relationshipTypes=synonym&limitPerRelationshipType=30&api_key=' + key;
                        getData(url, dumbText[i], i, smartText, spans);
                    }
                } else {
                    smartText[i] = dumbText[i];
                    spans[i] = "<span>" + smartText[i] + '</span>';
                }
            } else {
                smartText[i] = dumbText[i];
                spans[i] = "<span>" + smartText[i] + '</span>';
            }
        }
        text.innerHTML = spans.join('');
    });
}

$(document).on('click', 'span', function() {
    // console.log($(this).text() + ' - ' + penn[RiTa.getPosTags($(this).text())]);

    if ($(this).attr('class') == 'smart') {
        var thisWord = $(this).text();
        var thisSyns = syns[$(this).attr('id')];
        console.log(thisSyns);
        var thisIndex = thisSyns.indexOf(thisWord);
        if (thisIndex + 1 < thisSyns.length) {
            $(this).text(thisSyns[thisIndex + 1]);
        } else {
            $(this).text(thisSyns[0]);
        }
    }

    // if (syns.hasOwnProperty(k)) {
    //     if ($(this).text() == k) {
    //         // console.log(syns[k]);
    //     }
    //     // smartText[]
    //     // span id == spans index
    // }
});

$(document).on('change', 'input:checkbox',
    function(){
        if ($(this).is(':checked')) {
            for (var i = 0; i < options[this.id].length; i++) {
                onTags.push(options[this.id][i]);
            }
        } else {
            for (var j = 0; j < options[this.id].length; j++) {
                onTags.splice(onTags.indexOf(options[this.id][j]), 1);
            }
        }
        // console.log(onTags);
        if (document.getElementById('textBox').value != '') {
            smartify();
        }
    }
);

window.addEventListener('load', whenPageLoads);