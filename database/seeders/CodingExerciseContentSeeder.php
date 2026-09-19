<?php

namespace Database\Seeders;

use App\Models\InteractiveExercise;
use Illuminate\Database\Seeder;

/**
 * Real content for the coding exercises that shipped as placeholders.
 *
 * Fourteen of them carried the same stub — titled "Practice Exercise", asking
 * the student to "Apply concepts from the lesson", with "Solution will vary" in
 * place of an answer and no test cases. An exercise with no test cases cannot be
 * passed: the grader runs nothing, so the score is 0 and the completion flag
 * never turns true. Each one below gets a task, starter code, a reference
 * solution and test cases that grade it.
 *
 * Every exercise reads its input from stdin and prints its answer, because that
 * is the only contract Judge0 grades on. Four topics — pandas, web scraping,
 * Tkinter and multi-file packages — cannot run in the sandbox at all (no
 * third-party packages, no network, no display, one file), so those practise
 * the same idea in plain Python over data supplied on stdin.
 *
 * Matched by exercise id, which is what the lesson seeders create. Each listed
 * id is rewritten outright: exercise 7 already had test cases and was still
 * broken, so their presence is not a sign that an exercise was authored well.
 * Ids absent from the listing are never touched.
 */
class CodingExerciseContentSeeder extends Seeder
{
    public function run(): void
    {
        $updated = 0;

        foreach ($this->exercises() as $lessonId => $spec) {
            // Keyed by lesson rather than by exercise id: the exercise seeder
            // creates these in a loop, so their ids shift whenever a lesson is
            // added, while the lesson a task belongs to does not change.
            $exercise = InteractiveExercise::where('lesson_id', $lessonId)
                ->where('exercise_type', 'coding')
                ->orderBy('exercise_id')
                ->first();

            if (! $exercise) {
                continue;
            }

            $exercise->update([
                'title' => $spec['title'],
                'description' => $spec['description'],
                'starter_code' => $spec['starter_code'],
                'solution' => $spec['solution'],
                'test_cases' => $spec['test_cases'],
                'content' => [
                    'language' => 'python',
                    'starter_code' => $spec['starter_code'],
                    'instructions' => $spec['instructions'],
                ],
            ]);

            $updated++;
        }

        $this->command?->info("Coding exercises authored: {$updated} of ".count($this->exercises()).' listed.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function exercises(): array
    {
        return [
            // ---- Lesson 1: first program ----
            // Authored with its test case inside content rather than in the
            // column the grader reads, so it too ran zero tests.
            1 => [
                'title' => 'Hello World Challenge',
                'description' => 'Write your first Python program.',
                'instructions' => implode("\n", [
                    'Print exactly this line:',
                    '',
                    'Hello, World!',
                    '',
                    'Mind the comma and the exclamation mark — the output must match',
                    'character for character.',
                ]),
                'starter_code' => "# Print the greeting below.\n",
                'solution' => "print('Hello, World!')\n",
                'test_cases' => [
                    ['input' => '', 'expected' => 'Hello, World!', 'description' => 'The greeting prints exactly'],
                ],
            ],

            // ---- Lesson 3: string methods ----
            // This one shipped with test cases, but they carry a "method" key
            // the grader has no notion of, and the reference solution computed
            // three values without printing any of them — so it produced no
            // output and failed its own tests. Rewritten to print its results.
            3 => [
                'title' => 'String Methods Practice',
                'description' => 'Transform a line of text with three string methods.',
                'instructions' => implode("\n", [
                    'A line of text is given on standard input.',
                    '',
                    'Print three lines:',
                    '1. the text in upper case',
                    '2. the text with the word "world" replaced by "Python"',
                    '3. the text with only its first letter capitalised',
                    '',
                    'Example — input "hello world" gives:',
                    'HELLO WORLD',
                    'hello Python',
                    'Hello world',
                ]),
                'starter_code' => "text = input()\n\n# Print the upper-cased text, then the replacement, then the capitalised form.\n",
                'solution' => "text = input()\n\nprint(text.upper())\nprint(text.replace('world', 'Python'))\nprint(text.capitalize())\n",
                'test_cases' => [
                    ['input' => 'hello world', 'expected' => "HELLO WORLD\nhello Python\nHello world", 'description' => 'The worked example'],
                    ['input' => 'goodbye world', 'expected' => "GOODBYE WORLD\ngoodbye Python\nGoodbye world", 'description' => 'A different sentence'],
                    ['input' => 'python rocks', 'expected' => "PYTHON ROCKS\npython rocks\nPython rocks", 'description' => 'Nothing to replace'],
                ],
            ],

            // ---- Lesson 2: variables and data types ----
            2 => [
                'title' => 'Variable Declaration Practice',
                'description' => 'Declare variables of four different types and print them.',
                'instructions' => implode("\n", [
                    'Create four variables and print each one on its own line, in this order:',
                    '',
                    '1. age — the integer 25',
                    '2. price — the float 19.99',
                    '3. name — the string Python',
                    '4. is_active — the boolean True',
                    '',
                    'This exercise takes no input. Expected output:',
                    '25',
                    '19.99',
                    'Python',
                    'True',
                ]),
                'starter_code' => "# Create the four variables described in the instructions,\n# then print each one on its own line.\n",
                'solution' => "age = 25\nprice = 19.99\nname = 'Python'\nis_active = True\n\nprint(age)\nprint(price)\nprint(name)\nprint(is_active)\n",
                'test_cases' => [
                    [
                        'input' => '',
                        'expected' => "25\n19.99\nPython\nTrue",
                        'description' => 'All four variables print in order',
                    ],
                ],
            ],

            // ---- Lesson 4: lists ----
            4 => [
                'title' => 'List Statistics',
                'description' => 'Read a list of numbers and report its size, total and largest value.',
                'instructions' => implode("\n", [
                    'A single line of space-separated integers is given on standard input.',
                    '',
                    'Print three lines:',
                    '1. how many numbers there are',
                    '2. their sum',
                    '3. the largest of them',
                    '',
                    'Example — input "4 8 15 16" gives:',
                    '4',
                    '43',
                    '16',
                ]),
                'starter_code' => "numbers = [int(n) for n in input().split()]\n\n# Print the count, the sum and the largest value.\n",
                'solution' => "numbers = [int(n) for n in input().split()]\n\nprint(len(numbers))\nprint(sum(numbers))\nprint(max(numbers))\n",
                'test_cases' => [
                    ['input' => '4 8 15 16', 'expected' => "4\n43\n16", 'description' => 'Four values'],
                    ['input' => '7', 'expected' => "1\n7\n7", 'description' => 'A single value'],
                    ['input' => '-5 -2 -9', 'expected' => "3\n-16\n-2", 'description' => 'Negative numbers'],
                ],
            ],

            // ---- Lesson 5: conditionals ----
            5 => [
                'title' => 'Grade Classifier',
                'description' => 'Turn a numeric score into a letter grade.',
                'instructions' => implode("\n", [
                    'A single integer score between 0 and 100 is given on standard input.',
                    'Print the matching letter grade:',
                    '',
                    '90 and above  -> A',
                    '80 to 89      -> B',
                    '70 to 79      -> C',
                    '60 to 69      -> D',
                    'below 60      -> F',
                    '',
                    'Print the letter only, with nothing else.',
                ]),
                'starter_code' => "score = int(input())\n\n# Print the letter grade for this score.\n",
                'solution' => "score = int(input())\n\nif score >= 90:\n    print('A')\nelif score >= 80:\n    print('B')\nelif score >= 70:\n    print('C')\nelif score >= 60:\n    print('D')\nelse:\n    print('F')\n",
                'test_cases' => [
                    ['input' => '95', 'expected' => 'A', 'description' => 'Top of the range'],
                    ['input' => '80', 'expected' => 'B', 'description' => 'On a boundary'],
                    ['input' => '73', 'expected' => 'C', 'description' => 'Mid range'],
                    ['input' => '42', 'expected' => 'F', 'description' => 'Below the pass mark'],
                ],
            ],

            // ---- Lesson 6: loops ----
            6 => [
                'title' => 'FizzBuzz',
                'description' => 'Loop from 1 to n, replacing multiples of 3 and 5.',
                'instructions' => implode("\n", [
                    'An integer n is given on standard input.',
                    '',
                    'Print every number from 1 to n, one per line, except that:',
                    '- multiples of 3 print Fizz',
                    '- multiples of 5 print Buzz',
                    '- multiples of both print FizzBuzz',
                    '',
                    'Example — input 5 gives:',
                    '1',
                    '2',
                    'Fizz',
                    '4',
                    'Buzz',
                ]),
                'starter_code' => "n = int(input())\n\n# Print 1 to n, substituting Fizz, Buzz and FizzBuzz.\n",
                'solution' => "n = int(input())\n\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print('FizzBuzz')\n    elif i % 3 == 0:\n        print('Fizz')\n    elif i % 5 == 0:\n        print('Buzz')\n    else:\n        print(i)\n",
                'test_cases' => [
                    ['input' => '5', 'expected' => "1\n2\nFizz\n4\nBuzz", 'description' => 'Up to 5'],
                    ['input' => '15', 'expected' => "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", 'description' => 'Reaches FizzBuzz'],
                    ['input' => '1', 'expected' => '1', 'description' => 'Smallest input'],
                ],
            ],

            // ---- Lesson 7: functions ----
            7 => [
                'title' => 'Write a Reusable Function',
                'description' => 'Define a function with a default parameter and call it.',
                'instructions' => implode("\n", [
                    'Define a function called greet(name, greeting="Hello") that RETURNS',
                    'the string "<greeting>, <name>!" — it should not print anything itself.',
                    '',
                    'Two lines are given on standard input: a name, then a greeting.',
                    'If the greeting line is empty, call greet with the name only so the',
                    'default applies.',
                    '',
                    'Print the returned string.',
                    '',
                    'Example — input "Ada" then "Welcome" gives: Welcome, Ada!',
                ]),
                'starter_code' => "def greet(name, greeting='Hello'):\n    # Return the greeting instead of printing it.\n    pass\n\n\nname = input()\ngreeting = input()\n\n# Call greet and print what it returns.\n",
                'solution' => "def greet(name, greeting='Hello'):\n    return f'{greeting}, {name}!'\n\n\nname = input()\ngreeting = input()\n\nif greeting == 'default':\n    print(greet(name))\nelse:\n    print(greet(name, greeting))\n",
                'test_cases' => [
                    ['input' => "Ada\nWelcome", 'expected' => 'Welcome, Ada!', 'description' => 'Both arguments given'],
                    ['input' => "Ada\ndefault", 'expected' => 'Hello, Ada!', 'description' => 'Default greeting applies'],
                    ['input' => "Grace\nHi", 'expected' => 'Hi, Grace!', 'description' => 'A different greeting'],
                ],
            ],

            // ---- Lesson 8: dictionaries ----
            8 => [
                'title' => 'Count the Words',
                'description' => 'Build a dictionary of word counts and report the most common word.',
                'instructions' => implode("\n", [
                    'A line of lowercase words separated by spaces is given on standard input.',
                    '',
                    'Count how many times each word appears, then print the most common word',
                    'and its count separated by a space.',
                    '',
                    'If several words tie, print whichever appeared first in the line.',
                    '',
                    'Example — input "a b a c a b" gives: a 3',
                ]),
                'starter_code' => "words = input().split()\n\n# Count the words, then print the most common one and its count.\n",
                'solution' => "words = input().split()\n\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\n\nbest = max(counts, key=lambda w: (counts[w], -words.index(w)))\nprint(best, counts[best])\n",
                'test_cases' => [
                    ['input' => 'a b a c a b', 'expected' => 'a 3', 'description' => 'A clear winner'],
                    ['input' => 'red blue red blue green', 'expected' => 'red 2', 'description' => 'A tie goes to the first seen'],
                    ['input' => 'solo', 'expected' => 'solo 1', 'description' => 'One word'],
                ],
            ],

            // ---- Lesson 9: file handling ----
            9 => [
                'title' => 'Write and Read a File',
                'description' => 'Write lines to a file, read them back and report on them.',
                'instructions' => implode("\n", [
                    'A line of space-separated words is given on standard input.',
                    '',
                    'Write each word to a file called words.txt, one per line, then read the',
                    'file back and print:',
                    '1. how many lines it contains',
                    '2. the longest word in it',
                    '',
                    'Use a with-block so the file is closed for you.',
                    '',
                    'Example — input "pear fig banana" gives:',
                    '3',
                    'banana',
                ]),
                'starter_code' => "words = input().split()\n\n# Write the words to words.txt, one per line.\n\n# Read them back and print the line count and the longest word.\n",
                'solution' => "words = input().split()\n\nwith open('words.txt', 'w') as f:\n    for word in words:\n        f.write(word + '\\n')\n\nwith open('words.txt') as f:\n    lines = [line.strip() for line in f if line.strip()]\n\nprint(len(lines))\nprint(max(lines, key=len))\n",
                'test_cases' => [
                    ['input' => 'pear fig banana', 'expected' => "3\nbanana", 'description' => 'Three words'],
                    ['input' => 'one', 'expected' => "1\none", 'description' => 'A single word'],
                ],
            ],

            // ---- Lesson 10: exceptions ----
            10 => [
                'title' => 'Safe Division',
                'description' => 'Catch the errors that bad input can raise.',
                'instructions' => implode("\n", [
                    'Two lines are given on standard input and should be divided, the first',
                    'by the second.',
                    '',
                    'Print the result, but handle what can go wrong:',
                    '- dividing by zero          -> print "Cannot divide by zero"',
                    '- either line not a number  -> print "Invalid input"',
                    '',
                    'Print the division result with one decimal place, e.g. 3.5',
                ]),
                'starter_code' => "a = input()\nb = input()\n\n# Divide a by b, handling both error cases.\n",
                'solution' => "a = input()\nb = input()\n\ntry:\n    result = int(a) / int(b)\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')\nexcept ValueError:\n    print('Invalid input')\nelse:\n    print(f'{result:.1f}')\n",
                'test_cases' => [
                    ['input' => "7\n2", 'expected' => '3.5', 'description' => 'A normal division'],
                    ['input' => "5\n0", 'expected' => 'Cannot divide by zero', 'description' => 'Division by zero'],
                    ['input' => "abc\n2", 'expected' => 'Invalid input', 'description' => 'Not a number'],
                ],
            ],

            // ---- Lesson 11: classes ----
            11 => [
                'title' => 'Build a Class',
                'description' => 'Write a class with an initialiser, a method and a __str__.',
                'instructions' => implode("\n", [
                    'Write a class BankAccount that:',
                    '',
                    '- takes an owner name and an opening balance in __init__',
                    '- has a deposit(amount) method that adds to the balance',
                    '- has a withdraw(amount) method that subtracts, but prints',
                    '  "Insufficient funds" and changes nothing if the amount is too large',
                    '- returns "<owner>: <balance>" from __str__',
                    '',
                    'Standard input gives an owner, an opening balance, an amount to deposit',
                    'and an amount to withdraw, one per line. Print the account afterwards.',
                    '',
                    'Example — Ada / 100 / 50 / 30 gives: Ada: 120',
                ]),
                'starter_code' => "class BankAccount:\n    def __init__(self, owner, balance):\n        pass\n\n    def deposit(self, amount):\n        pass\n\n    def withdraw(self, amount):\n        pass\n\n    def __str__(self):\n        pass\n\n\nowner = input()\nbalance = int(input())\naccount = BankAccount(owner, balance)\naccount.deposit(int(input()))\naccount.withdraw(int(input()))\nprint(account)\n",
                'solution' => "class BankAccount:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            print('Insufficient funds')\n            return\n        self.balance -= amount\n\n    def __str__(self):\n        return f'{self.owner}: {self.balance}'\n\n\nowner = input()\nbalance = int(input())\naccount = BankAccount(owner, balance)\naccount.deposit(int(input()))\naccount.withdraw(int(input()))\nprint(account)\n",
                'test_cases' => [
                    ['input' => "Ada\n100\n50\n30", 'expected' => 'Ada: 120', 'description' => 'Deposit then withdraw'],
                    ['input' => "Grace\n50\n0\n80", 'expected' => "Insufficient funds\nGrace: 50", 'description' => 'Withdrawal is refused'],
                ],
            ],

            // ---- Lesson 12: modules and packages ----
            // Judge0 runs one file with no third-party packages, so this
            // practises the standard library rather than importing across files.
            12 => [
                'title' => 'Use the Standard Library',
                'description' => 'Import from the standard library instead of writing it yourself.',
                'instructions' => implode("\n", [
                    'A line of space-separated integers is given on standard input.',
                    '',
                    'Using imports rather than your own loops, print:',
                    '1. their total, using math.fsum, with one decimal place',
                    '2. the two largest, space-separated, using heapq.nlargest',
                    '3. how many distinct values there are, using collections.Counter',
                    '',
                    'Example — input "4 8 15 8" gives:',
                    '35.0',
                    '15 8',
                    '3',
                ]),
                'starter_code' => "import collections\nimport heapq\nimport math\n\nnumbers = [int(n) for n in input().split()]\n\n# Use the three modules above rather than writing the logic yourself.\n",
                'solution' => "import collections\nimport heapq\nimport math\n\nnumbers = [int(n) for n in input().split()]\n\nprint(f'{math.fsum(numbers):.1f}')\nprint(*heapq.nlargest(2, numbers))\nprint(len(collections.Counter(numbers)))\n",
                'test_cases' => [
                    ['input' => '4 8 15 8', 'expected' => "35.0\n15 8\n3", 'description' => 'Repeated values'],
                    ['input' => '1 2', 'expected' => "3.0\n2 1\n2", 'description' => 'Exactly two values'],
                ],
            ],

            // ---- Lesson 13: comprehensions and generators ----
            13 => [
                'title' => 'Comprehensions and Generators',
                'description' => 'Replace loops with a comprehension and a generator expression.',
                'instructions' => implode("\n", [
                    'A line of space-separated integers is given on standard input.',
                    '',
                    'Print three lines:',
                    '1. the squares of the even numbers, space-separated, from a list comprehension',
                    '2. the sum of all the squares, from a generator expression',
                    '3. the numbers above the average, space-separated',
                    '',
                    'Keep the original order. If a line has no numbers to show, print an empty line.',
                    '',
                    'Example — input "1 2 3 4" gives:',
                    '4 16',
                    '30',
                    '3 4',
                ]),
                'starter_code' => "numbers = [int(n) for n in input().split()]\n\n# 1. squares of the even numbers, via a list comprehension\n# 2. sum of every square, via a generator expression\n# 3. the numbers above the average\n",
                'solution' => "numbers = [int(n) for n in input().split()]\n\neven_squares = [n * n for n in numbers if n % 2 == 0]\nprint(*even_squares)\n\nprint(sum(n * n for n in numbers))\n\naverage = sum(numbers) / len(numbers)\nprint(*[n for n in numbers if n > average])\n",
                'test_cases' => [
                    ['input' => '1 2 3 4', 'expected' => "4 16\n30\n3 4", 'description' => 'A mixed list'],
                    ['input' => '1 3 5', 'expected' => "\n35\n5", 'description' => 'No even numbers'],
                ],
            ],

            // ---- Lesson 14: decorators ----
            14 => [
                'title' => 'Write a Decorator',
                'description' => 'Wrap a function so it reports each call.',
                'instructions' => implode("\n", [
                    'Write a decorator called logged that wraps a function so that, on every',
                    'call, it first prints "Calling <name>" and then returns the result',
                    'unchanged. Use the wrapped function\'s __name__.',
                    '',
                    'Apply it to add(a, b), which returns a + b.',
                    '',
                    'Two integers are given on standard input, one per line. Call add and',
                    'print the result.',
                    '',
                    'Example — input 2 then 3 gives:',
                    'Calling add',
                    '5',
                ]),
                'starter_code' => "def logged(func):\n    # Return a wrapper that announces the call, then delegates.\n    pass\n\n\n@logged\ndef add(a, b):\n    return a + b\n\n\na = int(input())\nb = int(input())\nprint(add(a, b))\n",
                'solution' => "def logged(func):\n    def wrapper(*args, **kwargs):\n        print(f'Calling {func.__name__}')\n        return func(*args, **kwargs)\n\n    return wrapper\n\n\n@logged\ndef add(a, b):\n    return a + b\n\n\na = int(input())\nb = int(input())\nprint(add(a, b))\n",
                'test_cases' => [
                    ['input' => "2\n3", 'expected' => "Calling add\n5", 'description' => 'The wrapper announces the call'],
                    ['input' => "-4\n10", 'expected' => "Calling add\n6", 'description' => 'Negative input'],
                ],
            ],

            // ---- Lesson 15: data analysis ----
            // pandas is not installed in the sandbox, so this does the same
            // group-and-aggregate work with the standard library.
            15 => [
                'title' => 'Group and Summarise Data',
                'description' => 'Aggregate rows by category, the way a dataframe would.',
                'instructions' => implode("\n", [
                    'Standard input gives a number of rows, then that many lines of',
                    '"<category> <amount>".',
                    '',
                    'Print one line per category, sorted alphabetically, as',
                    '"<category> <total> <average>", with the average to one decimal place.',
                    '',
                    'Example — 3 rows of "food 10", "tech 30", "food 20" gives:',
                    'food 30 15.0',
                    'tech 30 30.0',
                ]),
                'starter_code' => "rows = int(input())\nrecords = [input().split() for _ in range(rows)]\n\n# Group the amounts by category, then print each total and average.\n",
                'solution' => "rows = int(input())\nrecords = [input().split() for _ in range(rows)]\n\ntotals = {}\nfor category, amount in records:\n    totals.setdefault(category, []).append(int(amount))\n\nfor category in sorted(totals):\n    amounts = totals[category]\n    total = sum(amounts)\n    print(f'{category} {total} {total / len(amounts):.1f}')\n",
                'test_cases' => [
                    ['input' => "3\nfood 10\ntech 30\nfood 20", 'expected' => "food 30 15.0\ntech 30 30.0", 'description' => 'Two categories'],
                    ['input' => "1\nbooks 7", 'expected' => 'books 7 7.0', 'description' => 'A single row'],
                ],
            ],

            // ---- Lesson 16: web scraping ----
            // The sandbox has no network and no bs4, so the markup is supplied
            // on stdin and parsed with the standard library's html.parser.
            16 => [
                'title' => 'Parse HTML for Links',
                'description' => 'Pull the links out of a page with the standard library parser.',
                'instructions' => implode("\n", [
                    'A single line of HTML is given on standard input.',
                    '',
                    'Using html.parser from the standard library, print the href of every',
                    '<a> tag, one per line, in the order they appear. Then print how many',
                    'there were.',
                    '',
                    'Example — input \'<a href="/a">A</a><a href="/b">B</a>\' gives:',
                    '/a',
                    '/b',
                    '2',
                ]),
                'starter_code' => "from html.parser import HTMLParser\n\nmarkup = input()\n\n# Subclass HTMLParser, collect every href, then print them and the count.\n",
                'solution' => "from html.parser import HTMLParser\n\n\nclass LinkCollector(HTMLParser):\n    def __init__(self):\n        super().__init__()\n        self.links = []\n\n    def handle_starttag(self, tag, attrs):\n        if tag == 'a':\n            for name, value in attrs:\n                if name == 'href':\n                    self.links.append(value)\n\n\nmarkup = input()\n\nparser = LinkCollector()\nparser.feed(markup)\n\nfor link in parser.links:\n    print(link)\n\nprint(len(parser.links))\n",
                'test_cases' => [
                    ['input' => '<a href="/a">A</a><a href="/b">B</a>', 'expected' => "/a\n/b\n2", 'description' => 'Two links'],
                    ['input' => '<p>No links here</p>', 'expected' => '0', 'description' => 'No links at all'],
                ],
            ],

            // ---- Lesson 17: GUI development ----
            // Tkinter needs a display, and a GUI has no stdout to grade, so this
            // builds the same widget tree as a data structure instead.
            17 => [
                'title' => 'Describe a Widget Layout',
                'description' => 'Model a window and its widgets, then render the tree as text.',
                'instructions' => implode("\n", [
                    'A GUI is a tree of widgets. Build that tree as data and print it.',
                    '',
                    'Standard input gives a window title, then a number of widgets, then',
                    'that many lines of "<type> <label>".',
                    '',
                    'Print the title, then each widget indented by two spaces as',
                    '"<type>: <label>", then "Widgets: <count>".',
                    '',
                    'Example — "Login" / 2 / "Label Username" / "Button Submit" gives:',
                    'Login',
                    '  Label: Username',
                    '  Button: Submit',
                    'Widgets: 2',
                ]),
                'starter_code' => "title = input()\ncount = int(input())\nwidgets = [input().split(maxsplit=1) for _ in range(count)]\n\n# Print the title, each widget indented by two spaces, then the count.\n",
                'solution' => "title = input()\ncount = int(input())\nwidgets = [input().split(maxsplit=1) for _ in range(count)]\n\nprint(title)\nfor widget_type, label in widgets:\n    print(f'  {widget_type}: {label}')\nprint(f'Widgets: {count}')\n",
                'test_cases' => [
                    ['input' => "Login\n2\nLabel Username\nButton Submit", 'expected' => "Login\n  Label: Username\n  Button: Submit\nWidgets: 2", 'description' => 'Two widgets'],
                    ['input' => "Empty\n0", 'expected' => "Empty\nWidgets: 0", 'description' => 'A window with no widgets'],
                ],
            ],
        ];
    }
}
