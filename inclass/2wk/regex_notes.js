RegEx

  var re = /regex/flag
    flags go after
      g = global
      i = case insensitive
      m = multiline

  meta characters

    \d = digit
    \w = word (A-Z a-z 0-9)
    \b = word boundary
    \s = whitespace
    . = any character except line break (\n)

    [abc] / [a-c] = character class - match any a, b or c
      [^abc] = not a, b or c

  quantifiers

    * = 0 or more
      *? = not greedy
          <h1>hello</h1>
          vs
          <h1>

    + = 1 or more
    ? = optional / 0 or 1

    {}
      \d{3} = 3 digits
      {2,3} = 2 or 3
  


  capturing

    917-555-1234

    \d{3}-\d{3}
      group 0 = 917-555
    
    (\d{3})-\d{3}
      group 1 = 917

    (\d{3})-(\d{3})
      group 2 = 555

    replace (\d{3})-(\d{3}) w/ $1-XXX
      > 917-XXX

    suphey hey hey what
      (\w+)\s+\1 = double words
        > second hey hey
      \b(\w+)\s+\1
        > first hey hey


  randexp.js creates random text from regex's