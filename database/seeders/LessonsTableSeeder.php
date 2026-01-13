<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LessonsTableSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $lessons = [
            // Beginner Python Lessons
            [
                'title' => 'Introduction to Python Programming',
                'content' => "Welcome to Python Programming!\n\nIn this lesson, you'll learn:\n- What is Python and why it's popular\n- How to write your first Python program\n- Basic syntax rules and conventions\n- Variables and how to use them\n- Print statements and user input\n\nLet's start with the classic 'Hello World' program:\n\nprint('Hello, World!')\n\nPython is known for its clean, readable syntax. Unlike other languages, Python uses indentation to define code blocks instead of curly braces.",
                'difficulty' => 'beginner',
                'estimated_duration' => 30,
                'video_url' => 'https://example.com/videos/python-intro',
                'status' => 'active',
                'completion_reward_points' => 100,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python Variables and Data Types',
                'content' => "Understanding Data Types in Python\n\nPython has several built-in data types:\n\n1. Integers (int): Whole numbers\n   age = 25\n   year = 2024\n\n2. Floats (float): Decimal numbers\n   price = 19.99\n   temperature = 36.6\n\n3. Strings (str): Text data\n   name = 'Alice'\n   message = \"Hello, World!\"\n\n4. Booleans (bool): True or False\n   is_active = True\n   is_logged_in = False\n\nVariables in Python are dynamically typed, meaning you don't need to declare their type explicitly. Python figures it out automatically!",
                'difficulty' => 'beginner',
                'estimated_duration' => 25,
                'video_url' => 'https://example.com/videos/python-variables',
                'status' => 'active',
                'completion_reward_points' => 80,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Working with Strings in Python',
                'content' => "String Manipulation in Python\n\nStrings are sequences of characters enclosed in quotes. Python provides many powerful methods for working with strings:\n\n# String concatenation\nfirst_name = 'John'\nlast_name = 'Doe'\nfull_name = first_name + ' ' + last_name\n\n# String methods\ntext = 'hello world'\nprint(text.upper())  # HELLO WORLD\nprint(text.capitalize())  # Hello world\nprint(text.replace('world', 'Python'))  # hello Python\n\n# String formatting\nname = 'Alice'\nage = 25\nprint(f'{name} is {age} years old')  # f-strings (Python 3.6+)\n\n# String slicing\ntext = 'Python Programming'\nprint(text[0:6])  # Python\nprint(text[-11:])  # Programming",
                'difficulty' => 'beginner',
                'estimated_duration' => 35,
                'video_url' => 'https://example.com/videos/python-strings',
                'status' => 'active',
                'completion_reward_points' => 90,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python Lists and Basic Operations',
                'content' => "Introduction to Python Lists\n\nLists are ordered, mutable collections that can hold items of different types:\n\n# Creating lists\nfruits = ['apple', 'banana', 'orange']\nnumbers = [1, 2, 3, 4, 5]\nmixed = [1, 'hello', 3.14, True]\n\n# Accessing elements (zero-indexed)\nprint(fruits[0])  # apple\nprint(fruits[-1])  # orange (last item)\n\n# Modifying lists\nfruits.append('grape')  # Add to end\nfruits.insert(1, 'mango')  # Insert at index\nfruits.remove('banana')  # Remove by value\nfruits.pop()  # Remove last item\n\n# List operations\nprint(len(fruits))  # Length\nprint('apple' in fruits)  # Check membership\nfruits.sort()  # Sort in place\n\n# List slicing\nnumbers = [0, 1, 2, 3, 4, 5]\nprint(numbers[1:4])  # [1, 2, 3]",
                'difficulty' => 'beginner',
                'estimated_duration' => 40,
                'video_url' => 'https://example.com/videos/python-lists',
                'status' => 'active',
                'completion_reward_points' => 100,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python If Statements and Conditions',
                'content' => "Conditional Logic in Python\n\nIf statements allow your program to make decisions:\n\n# Basic if statement\nage = 18\nif age >= 18:\n    print('You are an adult')\n\n# if-else statement\ntemperature = 25\nif temperature > 30:\n    print('It is hot')\nelse:\n    print('It is not hot')\n\n# if-elif-else statement\nscore = 85\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelif score >= 70:\n    grade = 'C'\nelse:\n    grade = 'F'\n\n# Comparison operators\n# == (equal), != (not equal)\n# > (greater), < (less)\n# >= (greater or equal), <= (less or equal)\n\n# Logical operators\n# and, or, not\nage = 25\nis_student = True\nif age >= 18 and is_student:\n    print('Adult student discount available')",
                'difficulty' => 'beginner',
                'estimated_duration' => 30,
                'video_url' => 'https://example.com/videos/python-conditionals',
                'status' => 'active',
                'completion_reward_points' => 90,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // Intermediate Python Lessons
            [
                'title' => 'Python Loops: For and While',
                'content' => "Mastering Loops in Python\n\n# For loops - iterate over sequences\nfruits = ['apple', 'banana', 'orange']\nfor fruit in fruits:\n    print(fruit)\n\n# Range function\nfor i in range(5):  # 0, 1, 2, 3, 4\n    print(i)\n\nfor i in range(1, 6):  # 1, 2, 3, 4, 5\n    print(i)\n\nfor i in range(0, 10, 2):  # 0, 2, 4, 6, 8 (step of 2)\n    print(i)\n\n# While loops - repeat while condition is true\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\n# Loop control statements\nfor i in range(10):\n    if i == 3:\n        continue  # Skip this iteration\n    if i == 7:\n        break  # Exit the loop\n    print(i)\n\n# Nested loops\nfor i in range(3):\n    for j in range(3):\n        print(f'i={i}, j={j}')",
                'difficulty' => 'intermediate',
                'estimated_duration' => 45,
                'video_url' => 'https://example.com/videos/python-loops',
                'status' => 'active',
                'completion_reward_points' => 120,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python Functions and Parameters',
                'content' => "Creating and Using Functions\n\nFunctions are reusable blocks of code that perform specific tasks:\n\n# Basic function\ndef greet():\n    print('Hello!')\n\ngreet()  # Call the function\n\n# Function with parameters\ndef greet_user(name):\n    print(f'Hello, {name}!')\n\ngreet_user('Alice')\n\n# Function with return value\ndef add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(result)  # 8\n\n# Default parameters\ndef greet(name='Guest'):\n    print(f'Hello, {name}!')\n\ngreet()  # Hello, Guest!\ngreet('Bob')  # Hello, Bob!\n\n# Multiple return values\ndef calculate(a, b):\n    sum_result = a + b\n    product = a * b\n    return sum_result, product\n\nsum_val, prod_val = calculate(5, 3)\n\n# Variable scope\nx = 10  # Global variable\n\ndef modify():\n    x = 5  # Local variable\n    print(x)  # 5\n\nmodify()\nprint(x)  # 10 (global unchanged)",
                'difficulty' => 'intermediate',
                'estimated_duration' => 50,
                'video_url' => 'https://example.com/videos/python-functions',
                'status' => 'active',
                'completion_reward_points' => 140,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python Dictionaries and Key-Value Pairs',
                'content' => "Working with Python Dictionaries\n\nDictionaries store data in key-value pairs:\n\n# Creating dictionaries\nperson = {\n    'name': 'Alice',\n    'age': 25,\n    'city': 'New York'\n}\n\n# Accessing values\nprint(person['name'])  # Alice\nprint(person.get('age'))  # 25 (safer method)\n\n# Modifying dictionaries\nperson['age'] = 26  # Update value\nperson['email'] = 'alice@example.com'  # Add new key\ndel person['city']  # Delete key\n\n# Dictionary methods\nprint(person.keys())  # Get all keys\nprint(person.values())  # Get all values\nprint(person.items())  # Get key-value pairs\n\n# Iterating through dictionaries\nfor key, value in person.items():\n    print(f'{key}: {value}')\n\n# Checking if key exists\nif 'name' in person:\n    print('Name exists')\n\n# Nested dictionaries\nusers = {\n    'user1': {'name': 'Alice', 'age': 25},\n    'user2': {'name': 'Bob', 'age': 30}\n}",
                'difficulty' => 'intermediate',
                'estimated_duration' => 40,
                'video_url' => 'https://example.com/videos/python-dictionaries',
                'status' => 'active',
                'completion_reward_points' => 130,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'File Handling in Python',
                'content' => "Reading and Writing Files in Python\n\n# Writing to a file\nwith open('example.txt', 'w') as file:\n    file.write('Hello, World!\\n')\n    file.write('This is a new line.')\n\n# Reading from a file\nwith open('example.txt', 'r') as file:\n    content = file.read()\n    print(content)\n\n# Reading line by line\nwith open('example.txt', 'r') as file:\n    for line in file:\n        print(line.strip())\n\n# Appending to a file\nwith open('example.txt', 'a') as file:\n    file.write('\\nAppended line')\n\n# File modes:\n# 'r' - Read (default)\n# 'w' - Write (overwrites)\n# 'a' - Append\n# 'r+' - Read and write\n\n# Working with paths\nimport os\n\nif os.path.exists('example.txt'):\n    print('File exists')\n\n# Reading all lines into a list\nwith open('example.txt', 'r') as file:\n    lines = file.readlines()\n\nThe 'with' statement ensures the file is properly closed after use.",
                'difficulty' => 'intermediate',
                'estimated_duration' => 35,
                'video_url' => 'https://example.com/videos/python-files',
                'status' => 'active',
                'completion_reward_points' => 150,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Exception Handling with Try-Except',
                'content' => "Handling Errors Gracefully in Python\n\nException handling prevents your program from crashing:\n\n# Basic try-except\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero!')\n\n# Multiple exceptions\ntry:\n    number = int(input('Enter a number: '))\n    result = 10 / number\nexcept ValueError:\n    print('Invalid input! Please enter a number.')\nexcept ZeroDivisionError:\n    print('Cannot divide by zero!')\n\n# Catching any exception\ntry:\n    # risky code\n    result = some_function()\nexcept Exception as e:\n    print(f'An error occurred: {e}')\n\n# Try-except-else-finally\ntry:\n    file = open('data.txt', 'r')\n    content = file.read()\nexcept FileNotFoundError:\n    print('File not found')\nelse:\n    print('File read successfully')\nfinally:\n    file.close()  # Always executes\n\n# Common exceptions:\n# ValueError - Invalid value\n# TypeError - Wrong type\n# KeyError - Key not found in dict\n# IndexError - Index out of range\n# FileNotFoundError - File doesn't exist",
                'difficulty' => 'intermediate',
                'estimated_duration' => 30,
                'video_url' => 'https://example.com/videos/python-exceptions',
                'status' => 'active',
                'completion_reward_points' => 120,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // Advanced Python Lessons
            [
                'title' => 'Python Classes and Object-Oriented Programming',
                'content' => "Introduction to Object-Oriented Programming\n\n# Creating a class\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def greet(self):\n        return f'Hello, I am {self.name}'\n    \n    def have_birthday(self):\n        self.age += 1\n\n# Creating objects (instances)\nperson1 = Person('Alice', 25)\nperson2 = Person('Bob', 30)\n\nprint(person1.greet())  # Hello, I am Alice\nperson1.have_birthday()\nprint(person1.age)  # 26\n\n# Inheritance\nclass Student(Person):\n    def __init__(self, name, age, student_id):\n        super().__init__(name, age)\n        self.student_id = student_id\n    \n    def study(self):\n        return f'{self.name} is studying'\n\nstudent = Student('Charlie', 20, 'S12345')\nprint(student.greet())  # Inherited method\nprint(student.study())  # New method\n\n# Class vs Instance variables\nclass Car:\n    wheels = 4  # Class variable\n    \n    def __init__(self, brand):\n        self.brand = brand  # Instance variable",
                'difficulty' => 'advanced',
                'estimated_duration' => 60,
                'video_url' => 'https://example.com/videos/python-oop',
                'status' => 'active',
                'completion_reward_points' => 200,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Working with Python Modules and Packages',
                'content' => "Using and Creating Python Modules\n\n# Importing built-in modules\nimport math\nprint(math.sqrt(16))  # 4.0\nprint(math.pi)  # 3.141592...\n\n# Import specific functions\nfrom math import sqrt, pi\nprint(sqrt(25))  # 5.0\n\n# Import with alias\nimport datetime as dt\ntoday = dt.date.today()\n\n# Creating your own module\n# File: mymodule.py\ndef greet(name):\n    return f'Hello, {name}!'\n\ndef calculate_area(radius):\n    return 3.14 * radius ** 2\n\nPI = 3.14159\n\n# Using your module\nimport mymodule\nprint(mymodule.greet('Alice'))\nprint(mymodule.PI)\n\n# Popular standard library modules:\n# - os: Operating system operations\n# - sys: System-specific parameters\n# - json: JSON encoding/decoding\n# - random: Random number generation\n# - datetime: Date and time operations\n# - re: Regular expressions\n# - collections: Specialized container datatypes\n\n# Third-party packages (install via pip):\n# pip install requests\n# pip install pandas\n# pip install numpy",
                'difficulty' => 'advanced',
                'estimated_duration' => 45,
                'video_url' => 'https://example.com/videos/python-modules',
                'status' => 'active',
                'completion_reward_points' => 180,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python List Comprehensions and Generators',
                'content' => "Advanced Python Features\n\n# List comprehensions - concise way to create lists\nsquares = [x**2 for x in range(10)]\n# Result: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]\n\n# With condition\neven_squares = [x**2 for x in range(10) if x % 2 == 0]\n# Result: [0, 4, 16, 36, 64]\n\n# Nested comprehensions\nmatrix = [[j for j in range(3)] for i in range(3)]\n# Result: [[0,1,2], [0,1,2], [0,1,2]]\n\n# Dictionary comprehension\nsquares_dict = {x: x**2 for x in range(5)}\n# Result: {0:0, 1:1, 2:4, 3:9, 4:16}\n\n# Set comprehension\nunique_lengths = {len(word) for word in ['hello', 'world', 'hi']}\n# Result: {2, 5}\n\n# Generator expressions (memory efficient)\nsquares_gen = (x**2 for x in range(10))\nfor square in squares_gen:\n    print(square)\n\n# Generator function\ndef count_up_to(n):\n    count = 1\n    while count <= n:\n        yield count\n        count += 1\n\nfor num in count_up_to(5):\n    print(num)\n\nGenerators save memory by generating values on-the-fly instead of storing them all at once.",
                'difficulty' => 'advanced',
                'estimated_duration' => 40,
                'video_url' => 'https://example.com/videos/python-comprehensions',
                'status' => 'active',
                'completion_reward_points' => 170,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python Decorators and Advanced Functions',
                'content' => "Understanding Decorators and Lambda Functions\n\n# Lambda functions (anonymous functions)\nsquare = lambda x: x**2\nprint(square(5))  # 25\n\nadd = lambda x, y: x + y\nprint(add(3, 4))  # 7\n\n# Using lambda with map, filter, reduce\nnumbers = [1, 2, 3, 4, 5]\nsquares = list(map(lambda x: x**2, numbers))\neven = list(filter(lambda x: x % 2 == 0, numbers))\n\n# Basic decorator\ndef my_decorator(func):\n    def wrapper():\n        print('Before function')\n        func()\n        print('After function')\n    return wrapper\n\n@my_decorator\ndef say_hello():\n    print('Hello!')\n\nsay_hello()\n# Output:\n# Before function\n# Hello!\n# After function\n\n# Decorator with arguments\ndef repeat(times):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            for _ in range(times):\n                result = func(*args, **kwargs)\n            return result\n        return wrapper\n    return decorator\n\n@repeat(3)\ndef greet(name):\n    print(f'Hello, {name}!')\n\ngreet('Alice')\n# Prints greeting 3 times\n\n# Common use cases:\n# - Timing functions\n# - Logging\n# - Authentication\n# - Caching",
                'difficulty' => 'advanced',
                'estimated_duration' => 50,
                'video_url' => 'https://example.com/videos/python-decorators',
                'status' => 'active',
                'completion_reward_points' => 190,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Data Analysis with Python and Pandas',
                'content' => "Introduction to Data Analysis with Pandas\n\n# Import pandas\nimport pandas as pd\n\n# Creating a DataFrame\ndata = {\n    'Name': ['Alice', 'Bob', 'Charlie'],\n    'Age': [25, 30, 35],\n    'City': ['New York', 'London', 'Paris']\n}\ndf = pd.DataFrame(data)\n\n# Reading data from CSV\ndf = pd.read_csv('data.csv')\n\n# Basic operations\nprint(df.head())  # First 5 rows\nprint(df.info())  # Data types and info\nprint(df.describe())  # Statistical summary\n\n# Selecting data\nprint(df['Name'])  # Select column\nprint(df[['Name', 'Age']])  # Multiple columns\nprint(df[df['Age'] > 25])  # Filter rows\n\n# Adding/modifying columns\ndf['Salary'] = [50000, 60000, 70000]\ndf['Age_Next_Year'] = df['Age'] + 1\n\n# Grouping and aggregating\ngrouped = df.groupby('City')['Age'].mean()\n\n# Handling missing data\ndf.dropna()  # Remove rows with NaN\ndf.fillna(0)  # Replace NaN with 0\n\n# Sorting\ndf.sort_values('Age', ascending=False)\n\n# Export data\ndf.to_csv('output.csv', index=False)\ndf.to_excel('output.xlsx', index=False)\n\nPandas is essential for data science and analysis in Python!",
                'difficulty' => 'advanced',
                'estimated_duration' => 70,
                'video_url' => 'https://example.com/videos/python-pandas',
                'status' => 'active',
                'completion_reward_points' => 220,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            // Draft/Inactive Lessons
            [
                'title' => 'Python Web Scraping Basics',
                'content' => "Learn to Extract Data from Websites\n\n# Web scraping allows you to automatically extract data from websites\n# We'll use the requests and BeautifulSoup libraries\n\nimport requests\nfrom bs4 import BeautifulSoup\n\n# Make a request\nurl = 'https://example.com'\nresponse = requests.get(url)\nhtml_content = response.text\n\n# Parse HTML\nsoup = BeautifulSoup(html_content, 'html.parser')\n\n# Find elements\ntitle = soup.find('title').text\nheadings = soup.find_all('h1')\n\n# Extract data\nfor heading in headings:\n    print(heading.text)\n\n# Find by class\narticles = soup.find_all('div', class_='article')\n\n# Extract links\nlinks = soup.find_all('a')\nfor link in links:\n    print(link.get('href'))\n\nNote: Always check a website's robots.txt and terms of service before scraping. Respect rate limits and be ethical!",
                'difficulty' => 'intermediate',
                'estimated_duration' => 55,
                'video_url' => null,
                'status' => 'draft',
                'completion_reward_points' => 160,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Python GUI Development with Tkinter',
                'content' => "Creating Desktop Applications with Tkinter\n\n# Tkinter is Python's standard GUI library\nimport tkinter as tk\nfrom tkinter import messagebox\n\n# Create main window\nwindow = tk.Tk()\nwindow.title('My First GUI')\nwindow.geometry('400x300')\n\n# Add label\nlabel = tk.Label(window, text='Hello, Tkinter!', font=('Arial', 16))\nlabel.pack(pady=20)\n\n# Add button\ndef on_button_click():\n    messagebox.showinfo('Message', 'Button clicked!')\n\nbutton = tk.Button(window, text='Click Me', command=on_button_click)\nbutton.pack()\n\n# Add entry (text input)\nentry = tk.Entry(window, width=30)\nentry.pack(pady=10)\n\n# Add text widget\ntext = tk.Text(window, height=5, width=40)\ntext.pack(pady=10)\n\n# Layout managers:\n# - pack(): Stacks widgets vertically/horizontally\n# - grid(): Places widgets in rows and columns\n# - place(): Absolute positioning\n\n# Run the application\nwindow.mainloop()\n\nTkinter allows you to create professional desktop applications with Python!",
                'difficulty' => 'advanced',
                'estimated_duration' => 80,
                'video_url' => 'https://example.com/videos/python-gui',
                'status' => 'inactive',
                'completion_reward_points' => 200,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('lessons')->insert($lessons);
    }
}
