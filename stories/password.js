// ************************************************************
// ************************************************************
// This part is included from another file.

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1 Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 Modified by dave jones
*/
/*
 * Configurable variables. You may need to tweak these to be compatible with
  * the server-side, but the defaults work in most cases.
  */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}
function dec_hmac_sha1(key, data){ return binb2dec(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
    {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (24 - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2dec(binarray)
{
  var hex_tab = hexcase ? "0123456789012345" : "0123456789012345";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}



/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}
// End of included file
// ************************************************************
// ************************************************************

//



function makehash(msg) {
  var hashx = b64_hmac_sha1(document.shahash.key.value,msg);
  hashx = hashx.replace(/(_|-)/g,"")
    hashx = hashx.slice(0,Math.min(8,hashx.length));
  return hashx;

}

function makenumbers(msg) {
  var hashx = dec_hmac_sha1(document.shahash.key.value,msg);
  hashx = hashx.slice(0, Math.min(12, hashx.length));
  return hashx;

}

function makediceware(msg) {
  var hashx = hex_hmac_sha1(document.shahash.key.value,msg);
//  hashx = hashx.slice(0, Math.min(12, hashx.length));
  var ans = "";
  for (var i = 0; i < 5; ++i) {
      var tmp = hashx.slice(i*4, (i+1)*4);

      ans += " " + wordlist[parseInt(tmp, 16) % 8192];
  }
  return ans;

}




function recompute() {
  document.shahash.output.value =
    makehash(document.shahash.msg.value);
  document.shahash.testout.value = makehash("test");
  document.shahash.numbers.value = makenumbers(document.shahash.msg.value);
  document.shahash.diceware.value = makediceware(document.shahash.msg.value);
}

var wordlist = ["a","a&p","a's","a2","a3","a4","a5","a6","a7",
"a8","a9","aa","aaa","aaaa","aaron","ab","aba","ababa",
"aback","abase","abash","abate","abbas","abbe","abbey","abbot","abbott",
"abc","abe","abed","abel","abet","abide","abject","ablaze","able",
"abner","abo","abode","abort","about","above","abrade","abram","absorb",
"abuse","abut","abyss","ac","acadia","accra","accrue","ace","acetic",
"ache","acid","acidic","acm","acme","acorn","acre","acrid","act",
"acton","actor","acts","acuity","acute","ad","ada","adage","adagio",
"adair","adam","adams","adapt","add","added","addict","addis","addle",
"adele","aden","adept","adieu","adjust","adler","admit","admix","ado",
"adobe","adonis","adopt","adore","adorn","adult","advent","advert","advise",
"ae","aegis","aeneid","af","afar","affair","affine","affix","afire",
"afoot","afraid","africa","afro","aft","ag","again","agate","agave",
"age","agee","agenda","agent","agile","aging","agnes","agnew","ago",
"agone","agony","agree","ague","agway","ah","ahead","ahem","ahoy",
"ai","aid","aida","aide","aides","aiken","ail","aile","aim",
"ain't","ainu","air","aires","airman","airway","airy","aisle","aj",
"ajar","ajax","ak","akers","akin","akron","al","ala","alai",
"alamo","alan","alarm","alaska","alb","alba","album","alcoa","alden",
"alder","ale","alec","aleck","aleph","alert","alex","alexei","alga",
"algae","algal","alger","algol","ali","alia","alias","alibi","alice",
"alien","alight","align","alike","alive","all","allah","allan","allay",
"allen","alley","allied","allis","allot","allow","alloy","allure","ally",
"allyl","allyn","alma","almost","aloe","aloft","aloha","alone","along",
"aloof","aloud","alp","alpha","alps","also","alsop","altair","altar",
"alter","alto","alton","alum","alumni","alva","alvin","alway","am",
"ama","amass","amaze","amber","amble","ambush","amen","amend","ames",
"ami","amid","amide","amigo","amino","amiss","amity","amman","ammo",
"amoco","amok","among","amort","amos","amp","ampere","ampex","ample",
"amply","amra","amulet","amuse","amy","an","ana","and","andes",
"andre","andrew","andy","anent","anew","angel","angelo","anger","angie",
"angle","anglo","angola","angry","angst","angus","ani","anion","anise",
"anita","ankle","ann","anna","annal","anne","annex","annie","annoy",
"annul","annuli","annum","anode","ansi","answer","ant","ante","anti",
"antic","anton","anus","anvil","any","anyhow","anyway","ao","aok",
"aorta","ap","apart","apathy","ape","apex","aphid","aplomb","appeal",
"append","apple","apply","april","apron","apse","apt","aq","aqua",
"ar","arab","araby","arc","arcana","arch","archer","arden","ardent",
"are","area","arena","ares","argive","argo","argon","argot","argue",
"argus","arhat","arid","aries","arise","ark","arlen","arlene","arm",
"armco","army","arnold","aroma","arose","arpa","array","arrear","arrow",
"arson","art","artery","arthur","artie","arty","aruba","arum","aryl",
"as","ascend","ash","ashen","asher","ashley","ashy","asia","aside",
"ask","askew","asleep","aspen","aspire","ass","assai","assam","assay",
"asset","assort","assure","aster","astm","astor","astral","at","at&t",
"ate","athens","atlas","atom","atomic","atone","atop","attic","attire",
"au","aubrey","audio","audit","aug","auger","augur","august","auk",
"aunt","aura","aural","auric","austin","auto","autumn","av","avail",
"ave","aver","avert","avery","aviate","avid","avis","aviv","avoid",
"avon","avow","aw","await","awake","award","aware","awash","away",
"awe","awful","awl","awn","awoke","awry","ax","axe","axes",
"axial","axiom","axis","axle","axon","ay","aye","ayers","az",
"aztec","azure","b","b's","b2","b3","b4","b5","b6",
"b7","b8","b9","ba","babe","babel","baby","bach","back",
"backup","bacon","bad","bade","baden","badge","baffle","bag","baggy",
"bah","bahama","bail","baird","bait","bake","baku","bald","baldy",
"bale","bali","balk","balkan","balky","ball","balled","ballot","balm",
"balmy","balsa","bam","bambi","ban","banal","band","bandit","bandy",
"bane","bang","banish","banjo","bank","banks","bantu","bar","barb",
"bard","bare","barfly","barge","bark","barley","barn","barnes","baron",
"barony","barr","barre","barry","barter","barth","barton","basal","base",
"basel","bash","basic","basil","basin","basis","bask","bass","bassi",
"basso","baste","bat","batch","bate","bater","bates","bath","bathe",
"batik","baton","bator","batt","bauble","baud","bauer","bawd","bawdy",
"bawl","baxter","bay","bayda","bayed","bayou","bazaar","bb","bbb",
"bbbb","bc","bcd","bd","be","beach","bead","beady","beak",
"beam","bean","bear","beard","beast","beat","beau","beauty","beaux",
"bebop","becalm","beck","becker","becky","bed","bedim","bee","beebe",
"beech","beef","beefy","been","beep","beer","beet","befall","befit",
"befog","beg","began","beget","beggar","begin","begun","behind","beige",
"being","beirut","bel","bela","belch","belfry","belie","bell","bella",
"belle","belly","below","belt","bema","beman","bemoan","ben","bench",
"bend","bender","benny","bent","benz","berea","bereft","beret","berg",
"berlin","bern","berne","bernet","berra","berry","bert","berth","beryl",
"beset","bess","bessel","best","bestir","bet","beta","betel","beth",
"bethel","betsy","bette","betty","bevel","bevy","beware","bey","bezel",
"bf","bg","bh","bhoy","bi","bias","bib","bibb","bible",
"bicep","biceps","bid","biddy","bide","bien","big","biggs","bigot",
"bile","bilge","bilk","bill","billow","billy","bin","binary","bind",
"bing","binge","bingle","bini","biota","birch","bird","birdie","birth",
"bison","bisque","bit","bitch","bite","bitt","bitten","biz","bizet",
"bj","bk","bl","blab","black","blade","blair","blake","blame",
"blanc","bland","blank","blare","blast","blat","blatz","blaze","bleak",
"bleat","bled","bleed","blend","bless","blest","blew","blimp","blind",
"blink","blinn","blip","bliss","blithe","blitz","bloat","blob","bloc",
"bloch","block","bloke","blond","blonde","blood","bloom","bloop","blot",
"blotch","blow","blown","blue","bluet","bluff","blum","blunt","blur",
"blurt","blush","blvd","blythe","bm","bmw","bn","bo","boa",
"boar","board","boast","boat","bob","bobbin","bobby","bobcat","boca",
"bock","bode","body","bog","bogey","boggy","bogus","bogy","bohr",
"boil","bois","boise","bold","bole","bolo","bolt","bomb","bombay",
"bon","bona","bond","bone","bong","bongo","bonn","bonus","bony",
"bonze","boo","booby","boogie","book","booky","boom","boon","boone",
"boor","boost","boot","booth","booty","booze","bop","borax","border",
"bore","borg","boric","boris","born","borne","borneo","boron","bosch",
"bose","bosom","boson","boss","boston","botch","both","bottle","bough",
"bouncy","bound","bourn","bout","bovine","bow","bowel","bowen","bowie",
"bowl","box","boxy","boy","boyar","boyce","boyd","boyle","bp",
"bq","br","brace","bract","brad","brady","brae","brag","bragg",
"braid","brain","brainy","brake","bran","brand","brandt","brant","brash",
"brass","brassy","braun","brave","bravo","brawl","bray","bread","break",
"bream","breath","bred","breed","breeze","bremen","brent","brest","brett",
"breve","brew","brian","briar","bribe","brice","brick","bride","brief",
"brig","briggs","brim","brine","bring","brink","briny","brisk","broad",
"brock","broil","broke","broken","bronx","brood","brook","brooke","broom",
"broth","brow","brown","browse","bruce","bruit","brunch","bruno","brunt",
"brush","brute","bryan","bryant","bryce","bryn","bs","bstj","bt",
"btl","bu","bub","buck","bud","budd","buddy","budge","buena",
"buenos","buff","bug","buggy","bugle","buick","build","built","bulb",
"bulge","bulk","bulky","bull","bully","bum","bump","bun","bunch",
"bundy","bunk","bunny","bunt","bunyan","buoy","burch","bureau","buret",
"burg","buried","burke","burl","burly","burma","burn","burnt","burp",
"burr","burro","burst","burt","burton","burtt","bury","bus","busch",
"bush","bushel","bushy","buss","bust","busy","but","butane","butch",
"buteo","butt","butte","butyl","buxom","buy","buyer","buzz","buzzy",
"bv","bw","bx","by","bye","byers","bylaw","byline","byrd",
"byrne","byron","byte","byway","byword","bz","c","c's","c2",
"c3","c4","c5","c6","c7","c8","c9","ca","cab",
"cabal","cabin","cable","cabot","cacao","cache","cacm","cacti","caddy",
"cadent","cadet","cadre","cady","cafe","cage","cagey","cahill","caiman",
"cain","caine","cairn","cairo","cake","cal","calder","caleb","calf",
"call","calla","callus","calm","calve","cam","camber","came","camel",
"cameo","camp","can","can't","canal","canary","cancer","candle","candy",
"cane","canis","canna","cannot","canny","canoe","canon","canopy","cant",
"canto","canton","cap","cape","caper","capo","car","carbon","card",
"care","caress","caret","carey","cargo","carib","carl","carla","carlo",
"carne","carob","carol","carp","carpet","carr","carrie","carry","carson",
"cart","carte","caruso","carve","case","casey","cash","cashew","cask",
"casket","cast","caste","cat","catch","cater","cathy","catkin","catsup",
"cauchy","caulk","cause","cave","cavern","cavil","cavort","caw","cayuga",
"cb","cbs","cc","ccc","cccc","cd","cdc","ce","cease",
"cecil","cedar","cede","ceil","celia","cell","census","cent","ceres",
"cern","cetera","cetus","cf","cg","ch","chad","chafe","chaff",
"chai","chain","chair","chalk","champ","chance","chang","chant","chao",
"chaos","chap","chapel","char","chard","charm","chart","chase","chasm",
"chaste","chat","chaw","cheap","cheat","check","cheek","cheeky","cheer",
"chef","chen","chert","cherub","chess","chest","chevy","chew","chi",
"chic","chick","chide","chief","child","chile","chili","chill","chilly",
"chime","chin","china","chine","chink","chip","chirp","chisel","chit",
"chive","chock","choir","choke","chomp","chop","chopin","choral","chord",
"chore","chose","chosen","chou","chow","chris","chub","chuck","chuff",
"chug","chum","chump","chunk","churn","chute","ci","cia","cicada",
"cider","cigar","cilia","cinch","cindy","cipher","circa","circe","cite",
"citrus","city","civet","civic","civil","cj","ck","cl","clad",
"claim","clam","clammy","clamp","clan","clang","clank","clap","clara",
"clare","clark","clarke","clash","clasp","class","claus","clause","claw",
"clay","clean","clear","cleat","cleft","clerk","cliche","click","cliff",
"climb","clime","cling","clink","clint","clio","clip","clive","cloak",
"clock","clod","clog","clomp","clone","close","closet","clot","cloth",
"cloud","clout","clove","clown","cloy","club","cluck","clue","cluj",
"clump","clumsy","clung","clyde","cm","cn","co","coach","coal",
"coast","coat","coax","cobb","cobble","cobol","cobra","coca","cock",
"cockle","cocky","coco","cocoa","cod","coda","coddle","code","codon",
"cody","coed","cog","cogent","cohen","cohn","coil","coin","coke",
"col","cola","colby","cold","cole","colon","colony","colt","colza",
"coma","comb","combat","come","comet","cometh","comic","comma","con",
"conch","cone","coney","congo","conic","conn","conner","conway","cony",
"coo","cook","cooke","cooky","cool","cooley","coon","coop","coors",
"coot","cop","cope","copra","copy","coral","corbel","cord","core",
"corey","cork","corn","corny","corp","corps","corvus","cos","cosec",
"coset","cosh","cost","costa","cosy","cot","cotta","cotty","couch",
"cough","could","count","coup","coupe","court","cousin","cove","coven",
"cover","covet","cow","cowan","cowl","cowman","cowry","cox","coy",
"coyote","coypu","cozen","cozy","cp","cpa","cq","cr","crab",
"crack","craft","crag","craig","cram","cramp","crane","crank","crap",
"crash","crass","crate","crater","crave","craw","crawl","craze","crazy",
"creak","cream","credit","credo","creed","creek","creep","creole","creon",
"crepe","crept","cress","crest","crete","crew","crib","cried","crime",
"crimp","crisp","criss","croak","crock","crocus","croft","croix","crone",
"crony","crook","croon","crop","cross","crow","crowd","crown","crt",
"crud","crude","cruel","crumb","crump","crush","crust","crux","cruz",
"cry","crypt","cs","ct","cu","cub","cuba","cube","cubic",
"cud","cuddle","cue","cuff","cull","culpa","cult","cumin","cuny",
"cup","cupful","cupid","cur","curb","curd","cure","curfew","curia",
"curie","curio","curl","curry","curse","curt","curve","cusp","cut",
"cute","cutlet","cv","cw","cx","cy","cycad","cycle","cynic",
"cyril","cyrus","cyst","cz","czar","czech","d","d'art","d's",
"d2","d3","d4","d5","d6","d7","d8","d9","da",
"dab","dacca","dactyl","dad","dada","daddy","dade","daffy","dahl",
"dahlia","dairy","dais","daisy","dakar","dale","daley","dally","daly",
"dam","dame","damn","damon","damp","damsel","dan","dana","dance",
"dandy","dane","dang","dank","danny","dante","dar","dare","dark",
"darken","darn","darry","dart","dash","data","date","dater","datum",
"daub","daunt","dave","david","davis","davit","davy","dawn","dawson",
"day","daze","db","dc","dd","ddd","dddd","de","deacon",
"dead","deaf","deal","dealt","dean","deane","dear","death","debar",
"debby","debit","debra","debris","debt","debug","debut","dec","decal",
"decay","decca","deck","decker","decor","decree","decry","dee","deed",
"deem","deep","deer","deere","def","defer","deform","deft","defy",
"degas","degum","deify","deign","deity","deja","del","delay","delft",
"delhi","delia","dell","della","delta","delve","demark","demit","demon",
"demur","den","deneb","denial","denny","dense","dent","denton","deny",
"depot","depth","depute","derby","derek","des","desist","desk","detach",
"deter","deuce","deus","devil","devoid","devon","dew","dewar","dewey",
"dewy","dey","df","dg","dh","dhabi","di","dial","diana",
"diane","diary","dibble","dice","dick","dicta","did","dido","die",
"died","diego","diem","diesel","diet","diety","dietz","dig","digit",
"dilate","dill","dim","dime","din","dinah","dine","ding","dingo",
"dingy","dint","diode","dip","dirac","dire","dirge","dirt","dirty",
"dis","disc","dish","disk","disney","ditch","ditto","ditty","diva",
"divan","dive","dixie","dixon","dizzy","dj","dk","dl","dm",
"dn","dna","do","dobbs","dobson","dock","docket","dod","dodd",
"dodge","dodo","doe","doff","dog","doge","dogma","dolan","dolce",
"dole","doll","dolly","dolt","dome","don","don't","done","doneck",
"donna","donor","doom","door","dope","dora","doria","doric","doris",
"dose","dot","dote","double","doubt","douce","doug","dough","dour",
"douse","dove","dow","dowel","down","downs","dowry","doyle","doze",
"dozen","dp","dq","dr","drab","draco","draft","drag","drain",
"drake","dram","drama","drank","drape","draw","drawl","drawn","dread",
"dream","dreamy","dreg","dress","dressy","drew","drib","dried","drier",
"drift","drill","drink","drip","drive","droll","drone","drool","droop",
"drop","dross","drove","drown","drub","drug","druid","drum","drunk",
"drury","dry","dryad","ds","dt","du","dual","duane","dub",
"dubhe","dublin","ducat","duck","duct","dud","due","duel","duet",
"duff","duffy","dug","dugan","duke","dull","dully","dulse","duly",
"duma","dumb","dummy","dump","dumpy","dun","dunce","dune","dung",
"dunham","dunk","dunlop","dunn","dupe","durer","dusk","dusky","dust",
"dusty","dutch","duty","dv","dw","dwarf","dwell","dwelt","dwight",
"dwyer","dx","dy","dyad","dye","dyer","dying","dyke","dylan",
"dyne","dz","e","e'er","e's","e2","e3","e4","e5",
"e6","e7","e8","e9","ea","each","eagan","eager","eagle",
"ear","earl","earn","earth","ease","easel","east","easy","eat",
"eaten","eater","eaton","eave","eb","ebb","eben","ebony","ec",
"echo","eclat","ecole","ed","eddie","eddy","eden","edgar","edge",
"edgy","edict","edify","edit","edith","editor","edna","edt","edwin",
"ee","eee","eeee","eel","eeoc","eerie","ef","efface","effie",
"efg","eft","eg","egan","egg","ego","egress","egret","egypt",
"eh","ei","eider","eight","eire","ej","eject","ek","eke",
"el","elan","elate","elba","elbow","elder","eldon","elect","elegy",
"elena","eleven","elfin","elgin","eli","elide","eliot","elite","elk",
"ell","ella","ellen","ellis","elm","elmer","elope","else","elsie",
"elton","elude","elute","elves","ely","em","embalm","embark","embed",
"ember","emcee","emery","emil","emile","emily","emit","emma","emory",
"empty","en","enact","enamel","end","endow","enemy","eng","engel",
"engle","engulf","enid","enjoy","enmity","enoch","enol","enos","enrico",
"ensue","enter","entrap","entry","envoy","envy","eo","ep","epa",
"epic","epoch","epoxy","epsom","eq","equal","equip","er","era",
"erase","erato","erda","ere","erect","erg","eric","erich","erie",
"erik","ernest","ernie","ernst","erode","eros","err","errand","errol",
"error","erupt","ervin","erwin","es","essay","essen","essex","est",
"ester","estes","estop","et","eta","etc","etch","ethan","ethel",
"ether","ethic","ethos","ethyl","etude","eu","eucre","euler","eureka",
"ev","eva","evade","evans","eve","even","event","every","evict",
"evil","evoke","evolve","ew","ewe","ewing","ex","exact","exalt",
"exam","excel","excess","exert","exile","exist","exit","exodus","expel",
"extant","extent","extol","extra","exude","exult","exxon","ey","eye",
"eyed","ez","ezra","f","f's","f2","f3","f4","f5",
"f6","f7","f8","f9","fa","faa","faber","fable","face",
"facet","facile","fact","facto","fad","fade","faery","fag","fahey",
"fail","fain","faint","fair","fairy","faith","fake","fall","false",
"fame","fan","fancy","fang","fanny","fanout","far","farad","farce",
"fare","fargo","farley","farm","faro","fast","fat","fatal","fate",
"fatty","fault","faun","fauna","faust","fawn","fay","faze","fb",
"fbi","fc","fcc","fd","fda","fe","fear","feast","feat",
"feb","fed","fee","feed","feel","feet","feign","feint","felice",
"felix","fell","felon","felt","femur","fence","fend","fermi","fern",
"ferric","ferry","fest","fetal","fetch","fete","fetid","fetus","feud",
"fever","few","ff","fff","ffff","fg","fgh","fh","fi",
"fiat","fib","fibrin","fiche","fide","fief","field","fiend","fiery",
"fife","fifo","fifth","fifty","fig","fight","filch","file","filet",
"fill","filler","filly","film","filmy","filth","fin","final","finale",
"finch","find","fine","finite","fink","finn","finny","fir","fire",
"firm","first","fish","fishy","fisk","fiske","fist","fit","fitch",
"five","fix","fj","fjord","fk","fl","flack","flag","flail",
"flair","flak","flake","flaky","flam","flame","flank","flap","flare",
"flash","flask","flat","flatus","flaw","flax","flea","fleck","fled",
"flee","fleet","flesh","flew","flex","flick","flier","flinch","fling",
"flint","flip","flirt","flit","flo","float","floc","flock","floe",
"flog","flood","floor","flop","floppy","flora","flour","flout","flow",
"flown","floyd","flu","flub","flue","fluff","fluid","fluke","flung",
"flush","flute","flux","fly","flyer","flynn","fm","fmc","fn",
"fo","foal","foam","foamy","fob","focal","foci","focus","fodder",
"foe","fog","foggy","fogy","foil","foist","fold","foley","folio",
"folk","folly","fond","font","food","fool","foot","foote","fop",
"for","foray","force","ford","fore","forge","forgot","fork","form",
"fort","forte","forth","forty","forum","foss","fossil","foul","found",
"fount","four","fovea","fowl","fox","foxy","foyer","fp","fpc",
"fq","fr","frail","frame","fran","franc","franca","frank","franz",
"frau","fraud","fray","freak","fred","free","freed","freer","frenzy",
"freon","fresh","fret","freud","frey","freya","friar","frick","fried",
"frill","frilly","frisky","fritz","fro","frock","frog","from","front",
"frost","froth","frown","froze","fruit","fry","frye","fs","ft",
"ftc","fu","fuchs","fudge","fuel","fugal","fugue","fuji","full",
"fully","fum","fume","fun","fund","fungal","fungi","funk","funny",
"fur","furl","furry","fury","furze","fuse","fuss","fussy","fusty",
"fuzz","fuzzy","fv","fw","fx","fy","fz","g","g's",
"g2","g3","g4","g5","g6","g7","g8","g9","ga",
"gab","gable","gabon","gad","gadget","gaff","gaffe","gag","gage",
"gail","gain","gait","gal","gala","galaxy","gale","galen","gall",
"gallop","galt","gam","game","gamin","gamma","gamut","gander","gang",
"gao","gap","gape","gar","garb","garish","garner","garry","garth",
"gary","gas","gash","gasp","gassy","gate","gates","gator","gauche",
"gaudy","gauge","gaul","gaunt","gaur","gauss","gauze","gave","gavel",
"gavin","gawk","gawky","gay","gaze","gb","gc","gd","ge",
"gear","gecko","gee","geese","geigy","gel","geld","gem","gemma",
"gene","genie","genii","genoa","genre","gent","gentry","genus","gerbil",
"germ","gerry","get","getty","gf","gg","ggg","gggg","gh",
"ghana","ghent","ghetto","ghi","ghost","ghoul","gi","giant","gibbs",
"gibby","gibe","giddy","gift","gig","gil","gila","gild","giles",
"gill","gilt","gimbal","gimpy","gin","gina","ginn","gino","gird",
"girl","girth","gist","give","given","gj","gk","gl","glad",
"gladdy","glade","glamor","gland","glans","glare","glass","glaze","gleam",
"glean","glee","glen","glenn","glib","glide","glint","gloat","glob",
"globe","glom","gloom","glory","gloss","glove","glow","glue","glued",
"gluey","gluing","glum","glut","glyph","gm","gmt","gn","gnarl",
"gnash","gnat","gnaw","gnome","gnp","gnu","go","goa","goad",
"goal","goat","gob","goer","goes","goff","gog","goggle","gogh",
"gogo","gold","golf","golly","gone","gong","goo","good","goode",
"goody","goof","goofy","goose","gop","gordon","gore","goren","gorge",
"gorky","gorse","gory","gosh","gospel","got","gouda","gouge","gould",
"gourd","gout","gown","gp","gpo","gq","gr","grab","grace",
"grad","grade","grady","graff","graft","grail","grain","grand","grant",
"grape","graph","grasp","grass","grata","grate","grater","grave","gravy",
"gray","graze","great","grebe","greed","greedy","greek","green","greer",
"greet","greg","gregg","greta","grew","grey","grid","grief","grieve",
"grill","grim","grime","grimm","grin","grind","grip","gripe","grist",
"grit","groan","groat","groin","groom","grope","gross","groton","group",
"grout","grove","grow","growl","grown","grub","gruff","grunt","gs",
"gsa","gt","gu","guam","guano","guard","guess","guest","guide",
"guild","guile","guilt","guise","guitar","gules","gulf","gull","gully",
"gulp","gum","gumbo","gummy","gun","gunk","gunky","gunny","gurgle",
"guru","gus","gush","gust","gusto","gusty","gut","gutsy","guy",
"guyana","gv","gw","gwen","gwyn","gx","gy","gym","gyp",
"gypsy","gyro","gz","h","h's","h2","h3","h4","h5",
"h6","h7","h8","h9","ha","haag","haas","habib","habit",
"hack","had","hades","hadron","hagen","hager","hague","hahn","haifa",
"haiku","hail","hair","hairy","haiti","hal","hale","haley","half",
"hall","halma","halo","halt","halvah","halve","ham","hamal","hamlin",
"han","hand","handy","haney","hang","hank","hanna","hanoi","hans",
"hansel","hap","happy","hard","hardy","hare","harem","hark","harley",
"harm","harp","harpy","harry","harsh","hart","harvey","hash","hasp",
"hast","haste","hasty","hat","hatch","hate","hater","hath","hatred",
"haul","haunt","have","haven","havoc","haw","hawk","hay","haydn",
"hayes","hays","hazard","haze","hazel","hazy","hb","hc","hd",
"he","he'd","he'll","head","heady","heal","healy","heap","hear",
"heard","heart","heat","heath","heave","heavy","hebe","hebrew","heck",
"heckle","hedge","heed","heel","heft","hefty","heigh","heine","heinz",
"heir","held","helen","helga","helix","hell","hello","helm","helmut",
"help","hem","hemp","hen","hence","henri","henry","her","hera",
"herb","herd","here","hero","heroic","heron","herr","hertz","hess",
"hesse","hettie","hetty","hew","hewitt","hewn","hex","hey","hf",
"hg","hh","hhh","hhhh","hi","hiatt","hick","hicks","hid",
"hide","high","hij","hike","hill","hilly","hilt","hilum","him",
"hind","hindu","hines","hinge","hint","hip","hippo","hippy","hiram",
"hire","hirsch","his","hiss","hit","hitch","hive","hj","hk",
"hl","hm","hn","ho","hoagy","hoar","hoard","hob","hobbs",
"hobby","hobo","hoc","hock","hodge","hodges","hoe","hoff","hog",
"hogan","hoi","hokan","hold","holdup","hole","holly","holm","holst",
"holt","home","homo","honda","hondo","hone","honey","hong","honk",
"hooch","hood","hoof","hook","hookup","hoop","hoot","hop","hope",
"horde","horn","horny","horse","horus","hose","host","hot","hotbox",
"hotel","hough","hound","hour","house","hove","hovel","hover","how",
"howdy","howe","howl","hoy","hoyt","hp","hq","hr","hs",
"ht","hu","hub","hubbub","hubby","huber","huck","hue","hued",
"huff","hug","huge","hugh","hughes","hugo","huh","hulk","hull",
"hum","human","humid","hump","humus","hun","hunch","hung","hunk",
"hunt","hurd","hurl","huron","hurrah","hurry","hurst","hurt","hurty",
"hush","husky","hut","hutch","hv","hw","hx","hy","hyde",
"hydra","hydro","hyena","hying","hyman","hymen","hymn","hymnal","hz",
"i","i'd","i'll","i'm","i's","i've","i2","i3","i4",
"i5","i6","i7","i8","i9","ia","iambic","ian","ib",
"ibex","ibid","ibis","ibm","ibn","ic","icc","ice","icing",
"icky","icon","icy","id","ida","idaho","idea","ideal","idiom",
"idiot","idle","idol","idyll","ie","ieee","if","iffy","ifni",
"ig","igloo","igor","ih","ii","iii","iiii","ij","ijk",
"ik","ike","il","ileum","iliac","iliad","ill","illume","ilona",
"im","image","imbue","imp","impel","import","impute","in","inane",
"inapt","inc","inca","incest","inch","incur","index","india","indies",
"indy","inept","inert","infect","infer","infima","infix","infra","ingot",
"inhere","injun","ink","inlay","inlet","inman","inn","inner","input",
"insect","inset","insult","intend","inter","into","inure","invoke","io",
"ion","ionic","iota","iowa","ip","ipso","iq","ir","ira",
"iran","iraq","irate","ire","irene","iris","irish","irk","irma",
"iron","irony","irs","irvin","irwin","is","isaac","isabel","ising",
"isis","islam","island","isle","isn't","israel","issue","it","it&t",
"it'd","it'll","italy","itch","item","ito","itt","iu","iv",
"ivan","ive","ivory","ivy","iw","ix","iy","iz","j",
"j's","j2","j3","j4","j5","j6","j7","j8","j9",
"ja","jab","jack","jacky","jacm","jacob","jacobi","jade","jag",
"jail","jaime","jake","jam","james","jan","jane","janet","janos",
"janus","japan","jar","jason","java","jaw","jay","jazz","jazzy",
"jb","jc","jd","je","jean","jed","jeep","jeff","jejune",
"jelly","jenny","jeres","jerk","jerky","jerry","jersey","jess","jesse",
"jest","jesus","jet","jew","jewel","jewett","jewish","jf","jg",
"jh","ji","jibe","jiffy","jig","jill","jilt","jim","jimmy",
"jinx","jive","jj","jjj","jjjj","jk","jkl","jl","jm",
"jn","jo","joan","job","jock","jockey","joe","joel","joey",
"jog","john","johns","join","joint","joke","jolla","jolly","jolt",
"jon","jonas","jones","jorge","jose","josef","joshua","joss","jostle",
"jot","joule","joust","jove","jowl","jowly","joy","joyce","jp",
"jq","jr","js","jt","ju","juan","judas","judd","jude",
"judge","judo","judy","jug","juggle","juice","juicy","juju","juke",
"jukes","julep","jules","julia","julie","julio","july","jumbo","jump",
"jumpy","junco","june","junk","junky","juno","junta","jura","jure",
"juror","jury","just","jut","jute","jv","jw","jx","jy",
"jz","k","k's","k2","k3","k4","k5","k6","k7",
"k8","k9","ka","kabul","kafka","kahn","kajar","kale","kalmia",
"kane","kant","kapok","kappa","karate","karen","karl","karma","karol",
"karp","kate","kathy","katie","katz","kava","kay","kayo","kazoo",
"kb","kc","kd","ke","keats","keel","keen","keep","keg",
"keith","keller","kelly","kelp","kemp","ken","keno","kent","kenya",
"kepler","kept","kern","kerr","kerry","ketch","kevin","key","keyed",
"keyes","keys","kf","kg","kh","khaki","khan","khmer","ki",
"kick","kid","kidde","kidney","kiev","kigali","kill","kim","kin",
"kind","king","kink","kinky","kiosk","kiowa","kirby","kirk","kirov",
"kiss","kit","kite","kitty","kiva","kivu","kiwi","kj","kk",
"kkk","kkkk","kl","klan","klaus","klein","kline","klm","klux",
"km","kn","knack","knapp","knauer","knead","knee","kneel","knelt",
"knew","knick","knife","knit","knob","knock","knoll","knot","knott",
"know","known","knox","knurl","ko","koala","koch","kodak","kola",
"kombu","kong","koran","korea","kp","kq","kr","kraft","krause",
"kraut","krebs","kruse","ks","kt","ku","kudo","kudzu","kuhn",
"kulak","kurd","kurt","kv","kw","kx","ky","kyle","kyoto",
"kz","l","l's","l2","l3","l4","l5","l6","l7",
"l8","l9","la","lab","laban","label","labia","labile","lac",
"lace","lack","lacy","lad","laden","ladle","lady","lag","lager",
"lagoon","lagos","laid","lain","lair","laity","lake","lam","lamar",
"lamb","lame","lamp","lana","lance","land","lane","lang","lange",
"lanka","lanky","lao","laos","lap","lapel","lapse","larch","lard",
"lares","large","lark","larkin","larry","lars","larva","lase","lash",
"lass","lasso","last","latch","late","later","latest","latex","lath",
"lathe","latin","latus","laud","laue","laugh","launch","laura","lava",
"law","lawn","lawson","lax","lay","layup","laze","lazy","lb",
"lc","ld","le","lea","leach","lead","leaf","leafy","leak",
"leaky","lean","leap","leapt","lear","learn","lease","leash","least",
"leave","led","ledge","lee","leech","leeds","leek","leer","leery",
"leeway","left","lefty","leg","legal","leggy","legion","leigh","leila",
"leland","lemma","lemon","len","lena","lend","lenin","lenny","lens",
"lent","leo","leon","leona","leone","leper","leroy","less","lessee",
"lest","let","lethe","lev","levee","level","lever","levi","levin",
"levis","levy","lew","lewd","lewis","leyden","lf","lg","lh",
"li","liar","libel","libido","libya","lice","lick","lid","lie",
"lied","lien","lieu","life","lifo","lift","light","like","liken",
"lila","lilac","lilly","lilt","lily","lima","limb","limbo","lime",
"limit","limp","lin","lind","linda","linden","line","linen","lingo",
"link","lint","linus","lion","lip","lipid","lisa","lise","lisle",
"lisp","list","listen","lit","lithe","litton","live","liven","livid",
"livre","liz","lizzie","lj","lk","ll","lll","llll","lloyd",
"lm","lmn","ln","lo","load","loaf","loam","loamy","loan",
"loath","lob","lobar","lobby","lobe","lobo","local","loci","lock",
"locke","locus","lodge","loeb","loess","loft","lofty","log","logan",
"loge","logic","loin","loire","lois","loiter","loki","lola","loll",
"lolly","lomb","lome","lone","long","look","loom","loon","loop",
"loose","loot","lop","lope","lopez","lord","lore","loren","los",
"lose","loss","lossy","lost","lot","lotte","lotus","lou","loud",
"louis","louise","louse","lousy","louver","love","low","lowe","lower",
"lowry","loy","loyal","lp","lq","lr","ls","lsi","lt",
"ltv","lu","lucas","lucia","lucid","luck","lucky","lucre","lucy",
"lug","luge","luger","luis","luke","lull","lulu","lumbar","lumen",
"lump","lumpy","lunar","lunch","lund","lung","lunge","lura","lurch",
"lure","lurid","lurk","lush","lust","lusty","lute","lutz","lux",
"luxe","luzon","lv","lw","lx","ly","lydia","lye","lying",
"lykes","lyle","lyman","lymph","lynch","lynn","lynx","lyon","lyons",
"lyra","lyric","lz","m","m&m","m's","m2","m3","m4",
"m5","m6","m7","m8","m9","ma","mabel","mac","mace",
"mach","macho","mack","mackey","macon","macro","mad","madam","made",
"madman","madsen","mae","magi","magic","magma","magna","magog","maid",
"maier","mail","maim","main","maine","major","make","malady","malay",
"male","mali","mall","malt","malta","mambo","mamma","mammal","man",
"mana","manama","mane","mange","mania","manic","mann","manna","manor",
"mans","manse","mantle","many","mao","maori","map","maple","mar",
"marc","march","marco","marcy","mardi","mare","margo","maria","marie",
"marin","marine","mario","mark","marks","marlin","marrow","marry","mars",
"marsh","mart","marty","marx","mary","maser","mash","mask","mason",
"masque","mass","mast","mat","match","mate","mateo","mater","math",
"matte","maul","mauve","mavis","maw","mawr","max","maxim","maxima",
"may","maya","maybe","mayer","mayhem","mayo","mayor","mayst","mazda",
"maze","mb","mba","mc","mccoy","mcgee","mckay","mckee","mcleod",
"md","me","mead","meal","mealy","mean","meant","meat","meaty",
"mecca","mecum","medal","medea","media","medic","medley","meek","meet",
"meg","mega","meier","meir","mel","meld","melee","mellow","melon",
"melt","memo","memoir","men","mend","menlo","menu","merck","mercy",
"mere","merge","merit","merle","merry","mesa","mescal","mesh","meson",
"mess","messy","met","metal","mete","meter","metro","mew","meyer",
"meyers","mezzo","mf","mg","mh","mi","miami","mica","mice",
"mickey","micky","micro","mid","midas","midge","midst","mien","miff",
"mig","might","mike","mila","milan","milch","mild","mildew","mile",
"miles","milk","milky","mill","mills","milt","mimi","mimic","mince",
"mind","mine","mini","minim","mink","minnow","minor","minos","minot",
"minsk","mint","minus","mira","mirage","mire","mirth","miser","misery",
"miss","missy","mist","misty","mit","mite","mitre","mitt","mix",
"mixup","mizar","mj","mk","ml","mm","mmm","mmmm","mn",
"mno","mo","moan","moat","mob","mobil","mock","modal","mode",
"model","modem","modish","moe","moen","mohr","moire","moist","molal",
"molar","mold","mole","moll","mollie","molly","molt","molten","mommy",
"mona","monad","mondo","monel","money","monic","monk","mont","monte",
"month","monty","moo","mood","moody","moon","moor","moore","moose",
"moot","mop","moral","morale","moran","more","morel","morn","moron",
"morse","morsel","mort","mosaic","moser","moses","moss","mossy","most",
"mot","motel","motet","moth","mother","motif","motor","motto","mould",
"mound","mount","mourn","mouse","mousy","mouth","move","movie","mow",
"moyer","mp","mph","mq","mr","mrs","ms","mt","mu",
"much","muck","mucus","mud","mudd","muddy","muff","muffin","mug",
"muggy","mugho","muir","mulch","mulct","mule","mull","multi","mum",
"mummy","munch","mung","munson","muon","muong","mural","muriel","murk",
"murky","murre","muse","mush","mushy","music","musk","muslim","must",
"musty","mute","mutt","muzak","muzo","mv","mw","mx","my",
"myel","myers","mylar","mynah","myopia","myra","myron","myrrh","myself",
"myth","mz","n","n's","n2","n3","n4","n5","n6",
"n7","n8","n9","na","naacp","nab","nadir","nag","nagoya",
"nagy","naiad","nail","nair","naive","naked","name","nan","nancy",
"naomi","nap","nary","nasa","nasal","nash","nasty","nat","natal",
"nate","nato","natty","nature","naval","nave","navel","navy","nay",
"nazi","nb","nbc","nbs","nc","ncaa","ncr","nd","ne",
"neal","near","neat","neath","neck","ned","nee","need","needy",
"neff","negate","negro","nehru","neil","nell","nelsen","neon","nepal",
"nero","nerve","ness","nest","net","neuron","neva","neve","new",
"newel","newt","next","nf","ng","nh","ni","nib","nibs",
"nice","nicety","niche","nick","niece","niger","nigh","night","nih",
"nikko","nil","nile","nimbus","nimh","nina","nine","ninth","niobe",
"nip","nit","nitric","nitty","nixon","nj","nk","nl","nm",
"nn","nnn","nnnn","no","noaa","noah","nob","nobel","noble",
"nod","nodal","node","noel","noise","noisy","nolan","noll","nolo",
"nomad","non","nonce","none","nook","noon","noose","nop","nor",
"nora","norm","norma","north","norway","nose","not","notch","note",
"notre","noun","nov","nova","novak","novel","novo","now","np",
"nq","nr","nrc","ns","nsf","nt","ntis","nu","nuance",
"nubia","nuclei","nude","nudge","null","numb","nun","nurse","nut",
"nv","nw","nx","ny","nyc","nylon","nymph","nyu","nz",
"o","o'er","o's","o2","o3","o4","o5","o6","o7",
"o8","o9","oa","oaf","oak","oaken","oakley","oar","oases",
"oasis","oat","oath","ob","obese","obey","objet","oboe","oc",
"occur","ocean","oct","octal","octave","octet","od","odd","ode",
"odin","odium","oe","of","off","offal","offend","offer","oft",
"often","og","ogden","ogle","ogre","oh","ohio","ohm","ohmic",
"oi","oil","oily","oint","oj","ok","okay","ol","olaf",
"olav","old","olden","oldy","olga","olin","olive","olsen","olson",
"om","omaha","oman","omega","omen","omit","on","once","one",
"onion","only","onset","onto","onus","onward","onyx","oo","ooo",
"oooo","ooze","op","opal","opec","opel","open","opera","opium",
"opt","optic","opus","oq","or","oral","orate","orb","orbit",
"orchid","ordain","order","ore","organ","orgy","orin","orion","ornery",
"orono","orr","os","osaka","oscar","osier","oslo","ot","other",
"otis","ott","otter","otto","ou","ouch","ought","ounce","our",
"oust","out","ouvre","ouzel","ouzo","ov","ova","oval","ovary",
"ovate","oven","over","overt","ovid","ow","owe","owens","owing",
"owl","owly","own","ox","oxen","oxeye","oxide","oxnard","oy",
"oz","ozark","ozone","p","p's","p2","p3","p4","p5",
"p6","p7","p8","p9","pa","pablo","pabst","pace","pack",
"packet","pact","pad","paddy","padre","paean","pagan","page","paid",
"pail","pain","paine","paint","pair","pal","pale","pall","palm",
"palo","palsy","pam","pampa","pan","panama","panda","pane","panel",
"pang","panic","pansy","pant","panty","paoli","pap","papa","papal",
"papaw","paper","pappy","papua","par","parch","pardon","pare","pareto",
"paris","park","parke","parks","parr","parry","parse","part","party",
"pascal","pasha","paso","pass","passe","past","paste","pasty","pat",
"patch","pate","pater","path","patio","patsy","patti","patton","patty",
"paul","paula","pauli","paulo","pause","pave","paw","pawn","pax",
"pay","payday","payne","paz","pb","pbs","pc","pd","pe",
"pea","peace","peach","peak","peaky","peal","peale","pear","pearl",
"pease","peat","pebble","pecan","peck","pecos","pedal","pedro","pee",
"peed","peek","peel","peep","peepy","peer","peg","peggy","pelt",
"pen","penal","pence","pencil","pend","penh","penn","penna","penny",
"pent","peony","pep","peppy","pepsi","per","perch","percy","perez",
"peril","perk","perky","perle","perry","persia","pert","perth","peru",
"peruse","pest","peste","pet","petal","pete","peter","petit","petri",
"petty","pew","pewee","pf","pg","ph","ph.d","phage","phase",
"phd","phenol","phi","phil","phlox","phon","phone","phony","photo",
"phyla","physic","pi","piano","pica","pick","pickup","picky","pie",
"piece","pier","pierce","piety","pig","piggy","pike","pile","pill",
"pilot","pimp","pin","pinch","pine","ping","pinion","pink","pint",
"pinto","pion","piotr","pious","pip","pipe","piper","pique","pit",
"pitch","pith","pithy","pitney","pitt","pity","pius","pivot","pixel",
"pixy","pizza","pj","pk","pl","place","plague","plaid","plain",
"plan","plane","plank","plant","plasm","plat","plate","plato","play",
"playa","plaza","plea","plead","pleat","pledge","pliny","plod","plop",
"plot","plow","pluck","plug","plum","plumb","plume","plump","plunk",
"plus","plush","plushy","pluto","ply","pm","pn","po","poach",
"pobox","pod","podge","podia","poe","poem","poesy","poet","poetry",
"pogo","poi","point","poise","poke","pol","polar","pole","police",
"polio","polis","polk","polka","poll","polo","pomona","pomp","ponce",
"pond","pong","pont","pony","pooch","pooh","pool","poole","poop",
"poor","pop","pope","poppy","porch","pore","pork","porous","port",
"porte","portia","porto","pose","posey","posh","posit","posse","post",
"posy","pot","potts","pouch","pound","pour","pout","pow","powder",
"power","pp","ppm","ppp","pppp","pq","pqr","pr","prado",
"pram","prank","pratt","pray","preen","prefix","prep","press","prexy",
"prey","priam","price","prick","pride","prig","prim","prima","prime",
"primp","prince","print","prior","prism","prissy","privy","prize","pro",
"probe","prod","prof","prom","prone","prong","proof","prop","propyl",
"prose","proud","prove","prow","prowl","proxy","prune","pry","ps",
"psalm","psi","psych","pt","pta","pu","pub","puck","puddly",
"puerto","puff","puffy","pug","pugh","puke","pull","pulp","pulse",
"puma","pump","pun","punch","punic","punish","punk","punky","punt",
"puny","pup","pupal","pupil","puppy","pure","purge","purl","purr",
"purse","pus","pusan","pusey","push","pussy","put","putt","putty",
"pv","pvc","pw","px","py","pygmy","pyle","pyre","pyrex",
"pyrite","pz","q","q's","q2","q3","q4","q5","q6",
"q7","q8","q9","qa","qatar","qb","qc","qd","qe",
"qed","qf","qg","qh","qi","qj","qk","ql","qm",
"qn","qo","qp","qq","qqq","qqqq","qr","qrs","qs",
"qt","qu","qua","quack","quad","quaff","quail","quake","qualm",
"quark","quarry","quart","quash","quasi","quay","queasy","queen","queer",
"quell","query","quest","queue","quick","quid","quiet","quill","quilt",
"quinn","quint","quip","quirk","quirt","quit","quite","quito","quiz",
"quo","quod","quota","quote","qv","qw","qx","qy","qz",
"r","r&d","r's","r2","r3","r4","r5","r6","r7",
"r8","r9","ra","rabat","rabbi","rabbit","rabid","rabin","race",
"rack","racy","radar","radii","radio","radium","radix","radon","rae",
"rafael","raft","rag","rage","raid","rail","rain","rainy","raise",
"raj","rajah","rake","rally","ralph","ram","raman","ramo","ramp",
"ramsey","ran","ranch","rand","randy","rang","range","rangy","rank",
"rant","raoul","rap","rape","rapid","rapt","rare","rasa","rascal",
"rash","rasp","rat","rata","rate","rater","ratio","rattle","raul",
"rave","ravel","raven","raw","ray","raze","razor","rb","rc",
"rca","rd","re","reach","read","ready","reagan","real","realm",
"ream","reap","rear","reave","reb","rebel","rebut","recipe","reck",
"recur","red","redeem","reduce","reed","reedy","reef","reek","reel",
"reese","reeve","refer","regal","regina","regis","reich","reid","reign",
"rein","relax","relay","relic","reman","remedy","remit","remus","rena",
"renal","rend","rene","renown","rent","rep","repel","repent","resin",
"resort","rest","ret","retch","return","reub","rev","reveal","revel",
"rever","revet","revved","rex","rf","rg","rh","rhea","rheum",
"rhine","rhino","rho","rhoda","rhode","rhyme","ri","rib","rica",
"rice","rich","rick","rico","rid","ride","ridge","rifle","rift",
"rig","riga","rigel","riggs","right","rigid","riley","rill","rilly",
"rim","rime","rimy","ring","rink","rinse","rio","riot","rip",
"ripe","ripen","ripley","rise","risen","risk","risky","rite","ritz",
"rival","riven","river","rivet","riyadh","rj","rk","rl","rm",
"rn","ro","roach","road","roam","roar","roast","rob","robe",
"robin","robot","rock","rocket","rocky","rod","rode","rodeo","roe",
"roger","rogue","roil","role","roll","roman","rome","romeo","romp",
"ron","rondo","rood","roof","rook","rookie","rooky","room","roomy",
"roost","root","rope","rosa","rose","rosen","ross","rosy","rot",
"rotc","roth","rotor","rouge","rough","round","rouse","rout","route",
"rove","row","rowdy","rowe","roy","royal","royce","rp","rpm",
"rq","rr","rrr","rrrr","rs","rst","rsvp","rt","ru",
"ruanda","rub","rube","ruben","rubin","rubric","ruby","ruddy","rude",
"rudy","rue","rufus","rug","ruin","rule","rum","rumen","rummy",
"rump","rumpus","run","rune","rung","runge","runic","runt","runty",
"rupee","rural","ruse","rush","rusk","russ","russo","rust","rusty",
"rut","ruth","rutty","rv","rw","rx","ry","ryan","ryder",
"rye","rz","s","s's","s2","s3","s4","s5","s6",
"s7","s8","s9","sa","sabine","sable","sabra","sac","sachs",
"sack","sad","saddle","sadie","safari","safe","sag","saga","sage",
"sago","said","sail","saint","sake","sal","salad","sale","salem",
"saline","salk","salle","sally","salon","salt","salty","salve","salvo",
"sam","samba","same","sammy","samoa","samuel","san","sana","sand",
"sandal","sandy","sane","sang","sank","sans","santa","santo","sao",
"sap","sappy","sara","sarah","saran","sari","sash","sat","satan",
"satin","satyr","sauce","saucy","saud","saudi","saul","sault","saute",
"save","savoy","savvy","saw","sawyer","sax","saxon","say","sb",
"sc","scab","scala","scald","scale","scalp","scam","scamp","scan",
"scant","scar","scare","scarf","scary","scat","scaup","scene","scent",
"school","scion","scm","scoff","scold","scoop","scoot","scope","scops",
"score","scoria","scorn","scot","scott","scour","scout","scowl","scram",
"scrap","scrape","screw","scrim","scrub","scuba","scud","scuff","scull",
"scum","scurry","sd","se","sea","seal","seam","seamy","sean",
"sear","sears","season","seat","sec","secant","sect","sedan","seder",
"sedge","see","seed","seedy","seek","seem","seen","seep","seethe",
"seize","self","sell","selma","semi","sen","send","seneca","senor",
"sense","sent","sentry","seoul","sepal","sepia","sepoy","sept","septa",
"sequin","sera","serf","serge","serif","serum","serve","servo","set",
"seth","seton","setup","seven","sever","severe","sew","sewn","sex",
"sexy","sf","sg","sh","shack","shad","shade","shady","shafer",
"shaft","shag","shah","shake","shaken","shako","shaky","shale","shall",
"sham","shame","shank","shape","shard","share","shari","shark","sharp",
"shave","shaw","shawl","shay","she","she'd","shea","sheaf","shear",
"sheath","shed","sheen","sheep","sheer","sheet","sheik","shelf","shell",
"shied","shift","shill","shim","shin","shine","shinto","shiny","ship",
"shire","shirk","shirt","shish","shiv","shoal","shock","shod","shoe",
"shoji","shone","shoo","shook","shoot","shop","shore","short","shot",
"shout","shove","show","shown","showy","shrank","shred","shrew","shrike",
"shrub","shrug","shu","shuck","shun","shunt","shut","shy","si",
"sial","siam","sian","sib","sibley","sibyl","sic","sick","side",
"sidle","siege","siena","sieve","sift","sigh","sight","sigma","sign",
"signal","signor","silas","silk","silky","sill","silly","silo","silt",
"silty","sima","simon","simons","sims","sin","sinai","since","sine",
"sinew","sing","singe","sinh","sink","sinus","sioux","sip","sir",
"sire","siren","sis","sisal","sit","site","situ","situs","siva",
"six","sixgun","sixth","sixty","size","sj","sk","skat","skate",
"skeet","skew","ski","skid","skied","skiff","skill","skim","skimp",
"skimpy","skin","skip","skirt","skit","skulk","skull","skunk","sky",
"skye","sl","slab","slack","slag","slain","slake","slam","slang",
"slant","slap","slash","slat","slate","slater","slav","slave","slay",
"sled","sleek","sleep","sleet","slept","slew","slice","slick","slid",
"slide","slim","slime","slimy","sling","slip","slit","sliver","sloan",
"slob","sloe","slog","sloop","slop","slope","slosh","slot","sloth",
"slow","slug","sluice","slum","slump","slung","slur","slurp","sly",
"sm","smack","small","smart","smash","smear","smell","smelt","smile",
"smirk","smith","smithy","smog","smoke","smoky","smug","smut","sn",
"snack","snafu","snag","snail","snake","snap","snare","snark","snarl",
"snatch","sneak","sneer","snell","snick","sniff","snip","snipe","snob",
"snook","snoop","snore","snort","snout","snow","snowy","snub","snuff",
"snug","so","soak","soap","soapy","soar","sob","sober","social",
"sock","sod","soda","sofa","sofia","soft","soften","soggy","soil",
"sol","solar","sold","sole","solemn","solid","solo","solon","solve",
"soma","somal","some","son","sonar","song","sonic","sonny","sonora",
"sony","soon","soot","sooth","sop","sora","sorb","sore","sorry",
"sort","sos","sou","sough","soul","sound","soup","sour","source",
"sousa","south","sow","sown","soy","soya","sp","spa","space",
"spade","spain","span","spar","spare","sparge","spark","spasm","spat",
"spate","spawn","spay","speak","spear","spec","speck","sped","speed",
"spell","spend","spent","sperm","sperry","spew","spica","spice","spicy",
"spike","spiky","spill","spilt","spin","spine","spiny","spire","spiro",
"spit","spite","spitz","splat","splay","spline","split","spoil","spoke",
"spoof","spook","spooky","spool","spoon","spore","sport","spot","spout",
"sprain","spray","spree","sprig","spruce","sprue","spud","spume","spun",
"spunk","spur","spurn","spurt","spy","sq","squad","squat","squaw",
"squibb","squid","squint","sr","sri","ss","sss","ssss","sst",
"st","st.","stab","stack","stacy","staff","stag","stage","stagy",
"stahl","staid","stain","stair","stake","stale","stalk","stall","stamp",
"stan","stance","stand","stank","staph","star","stare","stark","starr",
"start","stash","state","statue","stave","stay","stead","steak","steal",
"steam","steed","steel","steele","steen","steep","steer","stein","stella",
"stem","step","stern","steve","stew","stick","stiff","stile","still",
"stilt","sting","stingy","stink","stint","stir","stock","stoic","stoke",
"stole","stomp","stone","stony","stood","stool","stoop","stop","store",
"storey","stork","storm","story","stout","stove","stow","strafe","strap",
"straw","stray","strewn","strip","stroll","strom","strop","strum","strut",
"stu","stuart","stub","stuck","stud","study","stuff","stuffy","stump",
"stun","stung","stunk","stunt","sturm","style","styli","styx","su",
"suave","sub","subtly","such","suck","sud","sudan","suds","sue",
"suey","suez","sugar","suit","suite","sulfa","sulk","sulky","sully",
"sultry","sum","sumac","summon","sun","sung","sunk","sunny","sunset",
"suny","sup","super","supra","sure","surf","surge","sus","susan",
"sushi","susie","sutton","sv","sw","swab","swag","swain","swam",
"swami","swamp","swampy","swan","swank","swap","swarm","swart","swat",
"swath","sway","swear","sweat","sweaty","swede","sweep","sweet","swell",
"swelt","swept","swift","swig","swim","swine","swing","swipe","swirl",
"swish","swiss","swoop","sword","swore","sworn","swum","swung","sx",
"sy","sybil","sykes","sylow","sylvan","synge","synod","syria","syrup",
"sz","t","t's","t2","t3","t4","t5","t6","t7",
"t8","t9","ta","tab","table","taboo","tabu","tabula","tacit",
"tack","tacky","tacoma","tact","tad","taffy","taft","tag","tahoe",
"tail","taint","take","taken","talc","tale","talk","talky","tall",
"tallow","tally","talon","talus","tam","tame","tamp","tampa","tan",
"tang","tango","tangy","tanh","tank","tansy","tanya","tao","taos",
"tap","tapa","tape","taper","tapir","tapis","tappa","tar","tara",
"tardy","tariff","tarry","tart","task","tass","taste","tasty","tat",
"tate","tater","tattle","tatty","tau","taunt","taut","tavern","tawny",
"tax","taxi","tb","tc","td","te","tea","teach","teal",
"team","tear","tease","teat","tech","tecum","ted","teddy","tee",
"teem","teen","teensy","teet","teeth","telex","tell","tempo","tempt",
"ten","tend","tenet","tenney","tenon","tenor","tense","tensor","tent",
"tenth","tepee","tepid","term","tern","terra","terre","terry","terse",
"tess","test","testy","tete","texan","texas","text","tf","tg",
"th","thai","than","thank","that","thaw","the","thea","thee",
"theft","their","them","theme","then","there","these","theta","they",
"thick","thief","thigh","thin","thine","thing","think","third","this",
"thong","thor","thorn","thorny","those","thou","thread","three","threw",
"throb","throes","throw","thrum","thud","thug","thule","thumb","thump",
"thus","thy","thyme","ti","tiber","tibet","tibia","tic","tick",
"ticket","tid","tidal","tidbit","tide","tidy","tie","tied","tier",
"tift","tiger","tight","til","tilde","tile","till","tilt","tilth",
"tim","time","timex","timid","timon","tin","tina","tine","tinge",
"tint","tiny","tioga","tip","tipoff","tippy","tipsy","tire","tit",
"titan","tithe","title","titus","tj","tk","tl","tm","tn",
"tnt","to","toad","toady","toast","toby","today","todd","toe",
"tofu","tog","togo","togs","toil","toilet","token","tokyo","told",
"toll","tom","tomb","tome","tommy","ton","tonal","tone","tong",
"toni","tonic","tonk","tonsil","tony","too","took","tool","toot",
"tooth","top","topaz","topic","topple","topsy","tor","torah","torch",
"tore","tori","torn","torr","torso","tort","torus","tory","toss",
"tot","total","tote","totem","touch","tough","tour","tout","tow",
"towel","tower","town","toxic","toxin","toy","tp","tq","tr",
"trace","track","tract","tracy","trade","trag","trail","train","trait",
"tram","tramp","trap","trash","trawl","tray","tread","treat","treble",
"tree","trek","trench","trend","tress","triad","trial","tribe","trick",
"tried","trig","trill","trim","trio","trip","tripe","trite","triton",
"trod","troll","troop","trot","trout","troy","truce","truck","trudge",
"trudy","true","truly","trump","trunk","truss","trust","truth","trw",
"try","ts","tsar","tt","ttl","ttt","tttt","tty","tu",
"tub","tuba","tube","tuck","tudor","tuff","tuft","tug","tulane",
"tulip","tulle","tulsa","tum","tun","tuna","tune","tung","tunic",
"tunis","tunnel","tuple","turf","turin","turk","turn","turvy","tusk",
"tussle","tutor","tutu","tuv","tv","tva","tw","twa","twain",
"tweak","tweed","twice","twig","twill","twin","twine","twirl","twist",
"twisty","twit","two","twx","tx","ty","tyburn","tying","tyler",
"type","typic","typo","tyson","tz","u","u's","u2","u3",
"u4","u5","u6","u7","u8","u9","ua","ub","uc",
"ucla","ud","ue","uf","ug","ugh","ugly","uh","ui",
"uj","uk","ul","ulan","ulcer","ultra","um","umber","umbra",
"umpire","un","unary","uncle","under","unify","union","unit","unite",
"unity","unix","until","uo","up","upend","uphold","upon","upper",
"uproar","upset","uptake","upton","uq","ur","urban","urbane","urea",
"urge","uri","urine","uris","urn","ursa","us","usa","usaf",
"usage","usc","usda","use","useful","usgs","usher","usia","usn",
"usps","ussr","usual","usurp","usury","ut","utah","utica","utile",
"utmost","utter","uu","uuu","uuuu","uv","uvw","uw","ux",
"uy","uz","v","v's","v2","v3","v4","v5","v6",
"v7","v8","v9","va","vacua","vacuo","vade","vaduz","vague",
"vail","vain","vale","valet","valeur","valid","value","valve","vamp",
"van","vance","vane","vary","vase","vast","vat","vault","vb",
"vc","vd","ve","veal","veda","vee","veer","veery","vega",
"veil","vein","velar","veldt","vella","vellum","venal","vend","venial",
"venom","vent","venus","vera","verb","verde","verdi","verge","verity",
"verna","verne","versa","verse","verve","very","vessel","vest","vet",
"vetch","veto","vex","vf","vg","vh","vi","via","vial",
"vicar","vice","vichy","vicky","vida","video","vie","viet","view",
"vigil","vii","viii","vile","villa","vine","vinyl","viola","violet",
"virgil","virgo","virus","vis","visa","vise","visit","visor","vista",
"vita","vitae","vital","vito","vitro","viva","vivian","vivid","vivo",
"vixen","viz","vj","vk","vl","vm","vn","vo","vocal",
"vogel","vogue","voice","void","volt","volta","volvo","vomit","von",
"voss","vote","vouch","vow","vowel","vp","vq","vr","vs",
"vt","vu","vulcan","vv","vvv","vvvv","vw","vx","vy",
"vying","vz","w","w's","w2","w3","w4","w5","w6",
"w7","w8","w9","wa","waals","wac","wack","wacke","wacky",
"waco","wad","wade","wadi","wafer","wag","wage","waggle","wah",
"wahl","wail","waist","wait","waite","waive","wake","waken","waldo",
"wale","walk","walkie","wall","walls","wally","walsh","walt","walton",
"waltz","wan","wand","wane","wang","want","war","ward","ware",
"warm","warmth","warn","warp","warren","wart","warty","wary","was",
"wash","washy","wasp","wast","waste","watch","water","watt","watts",
"wave","wavy","wax","waxen","waxy","way","wayne","wb","wc",
"wd","we","we'd","we'll","we're","we've","weak","weal","wealth",
"wean","wear","weary","weave","web","webb","weber","weco","wed",
"wedge","wee","weed","weedy","week","weeks","weep","wehr","wei",
"weigh","weir","weird","weiss","welch","weld","well","wells","welsh",
"welt","wendy","went","wept","were","wert","west","wet","wf",
"wg","wh","whack","whale","wham","wharf","what","wheat","whee",
"wheel","whelk","whelm","whelp","when","where","whet","which","whiff",
"whig","while","whim","whine","whinny","whip","whir","whirl","whisk",
"whit","white","whiz","who","who'd","whoa","whole","whom","whoop",
"whoosh","whop","whose","whup","why","wi","wick","wide","widen",
"widow","width","wield","wier","wife","wig","wild","wile","wiley",
"wilkes","will","willa","wills","wilma","wilt","wily","win","wince",
"winch","wind","windy","wine","wing","wink","winnie","wino","winter",
"winy","wipe","wire","wiry","wise","wish","wishy","wisp","wispy",
"wit","witch","with","withe","withy","witt","witty","wive","wj",
"wk","wl","wm","wn","wo","woe","wok","woke","wold",
"wolf","wolfe","wolff","wolve","woman","womb","women","won","won't",
"wonder","wong","wont","woo","wood","woods","woody","wool","woozy",
"word","wordy","wore","work","world","worm","wormy","worn","worry",
"worse","worst","worth","wotan","would","wound","wove","woven","wow",
"wp","wq","wr","wrack","wrap","wrath","wreak","wreck","wrest",
"wring","wrist","writ","write","writhe","wrong","wrote","wry","ws",
"wt","wu","wuhan","wv","ww","www","wwww","wx","wxy",
"wy","wyatt","wyeth","wylie","wyman","wyner","wynn","wz","x",
"x's","x2","x3","x4","x5","x6","x7","x8","x9",
"xa","xb","xc","xd","xe","xenon","xerox","xf","xg",
"xh","xi","xj","xk","xl","xm","xn","xo","xp",
"xq","xr","xs","xt","xu","xv","xw","xx","xxx",
"xxxx","xy","xylem","xyz","xz","y","y's","y2","y3",
"y4","y5","y6","y7","y8","y9","ya","yacht","yah",
"yak","yale","yalta","yam","yamaha","yang","yank","yap","yaqui",
"yard","yarn","yates","yaw","yawl","yawn","yb","yc","yd",
"ye","yea","yeah","year","yearn","yeast","yeasty","yeats","yell",
"yelp","yemen","yen","yet","yf","yg","yh","yi","yield",
"yin","yip","yj","yk","yl","ym","ymca","yn","yo",
"yodel","yoder","yoga","yogi","yoke","yokel","yolk","yon","yond",
"yore","york","yost","you","you'd","young","your","youth","yow",
"yp","yq","yr","ys","yt","yu","yucca","yuck","yuh",
"yuki","yukon","yule","yv","yves","yw","ywca","yx","yy",
"yyy","yyyy","yz","z","z's","z2","z3","z4","z5",
"z6","z7","z8","z9","za","zag","zaire","zan","zap",
"zazen","zb","zc","zd","ze","zeal","zealot","zebra","zeiss",
"zen","zero","zest","zesty","zeta","zeus","zf","zg","zh",
"zi","zig","zilch","zinc","zing","zion","zip","zj","zk",
"zl","zloty","zm","zn","zo","zoe","zomba","zone","zoo",
"zoom","zorn","zp","zq","zr","zs","zt","zu","zurich",
"zv","zw","zx","zy","zz","zzz","zzzz","!","!!",
'"""""',"#","##","$","$$","%","%%","&","(",
"()",")","*","**","+","-","0","1","10",
"100","1000","100th","101","101st","10th","11","111","1111",
"11th","12","123","1234","12th","13","13th","14","1492",
"14th","15","1500","15th","16","1600","16th","17","1700",
"1776","17th","18","1800","1812","18th","19","1900","1910",
"1920","1925","1930","1935","1940","1945","1950","1955","1960",
"1965","1970","1975","1980","1985","1990","1991","1992","1993",
"1994","1995","1996","1997","19th","1st","2","20","200",
"2000","2001","2020","20th","21","21st","22","222","2222",
"22nd","23","234","2345","23rd","24","2468","24th","25",
"25th","26","26th","27","27th","28","28th","29","29th",
"2a","2b","2c","2d","2e","2f","2g","2h","2i",
"2j","2k","2l","2m","2n","2nd","2o","2p","2q",
"2r","2s","2t","2u","2v","2w","2x","2y","2z",
"3","30","300","3000","30th","31","31st","32","32nd",
"33","333","3333","33rd","34","345","3456","34th","35",
"35th","36","36th","37","37th","38","38th","39","39th",
"3a","3b","3c","3d","3e","3f","3g","3h","3i",
"3j","3k","3l","3m","3n","3o","3p","3q","3r",
"3rd","3s","3t","3u","3v","3w","3x","3y","3z",
"4","40","400","4000","40th","41","41st","42","42nd",
"43","4321","43rd","44","444","4444","44th","45","456",
"4567","45th","46","46th","47","47th","48","48th","49",
"49th","4a","4b","4c","4d","4e","4f","4g","4h",
"4i","4j","4k","4l","4m","4n","4o","4p","4q",
"4r","4s","4t","4th","4u","4v","4w","4x","4y",
"4z","5","50","500","5000","50th","51","51st","52",
"52nd","53","53rd","54","54th","55","555","5555","55th",
"56","567","5678","56th","57","57th","58","58th","59",
"59th","5a","5b","5c","5d","5e","5f","5g","5h",
"5i","5j","5k","5l","5m","5n","5o","5p","5q",
"5r","5s","5t","5th","5u","5v","5w","5x","5y",
"5z","6","60","600","6000","60th","61","61st","62",
"62nd","63","63rd","64","65","65th","66","666","6666",
"66th","67","678","6789","67th","68","68th","69","69th",
"6a","6b","6c","6d","6e","6f","6g","6h","6i",
"6j","6k","6l","6m","6n","6o","6p","6q","6r",
"6s","6t","6th","6u","6v","6w","6x","6y","6z",
"7","70","700","7000","70th","71","71st","72","72nd",
"73","73rd","74","74th","75","75th","76","76th","77",
"777","7777","77th","78","789","78th","79","79th","7a",
"7b","7c","7d","7e","7f","7g","7h","7i","7j",
"7k","7l","7m","7n","7o","7p","7q","7r","7s",
"7t","7th","7u","7v","7w","7x","7y","7z","8",
"80","800","8000","80th","81","81st","82","82nd","83",
"83rd","84","84th","85","85th","86","86th","87","87th",
"88","888","8888","88th","89","89th","8a","8b","8c",
"8d","8e","8f","8g","8h","8i","8j","8k","8l",
"8m","8n","8o","8p","8q","8r","8s","8t","8th",
"8u","8v","8w","8x","8y","8z","9","90","900",
"9000","90th","91","91st","92","92nd","93","93rd","94",
"94th","95","95th","96","96th","97","97th","98","9876",
"98th","99","999","9999","99th","9a","9b","9c","9d",
"9e","9f","9g","9h","9i","9j","9k","9l","9m",
"9n","9o","9p","9q","9r","9s","9t","9th","9u","9v",
"9w","9x","9y","9z",":",";","=","?","??","@"];
