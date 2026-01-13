<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\ForumPostLike;
use App\Models\ForumReplyLike;
use App\Models\ForumFavorite;
use Illuminate\Support\Facades\DB;

class ForumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 获取管理员和学生用户
        $admin = User::where('role', 'admin')->first();
        $students = User::where('role', 'student')->take(10)->get();

        if (!$admin || $students->isEmpty()) {
            $this->command->warn('Please create users first before running ForumSeeder');
            $this->command->warn('Need: 1 admin and at least 10 students');
            return;
        }

        $this->command->info('Creating forum posts...');

        // ==================== 管理员公告 ====================
        $announcements = [
            [
                'title' => '🎉 Welcome to PyLearn Forum!',
                'content' => '<p>Welcome to the PyLearn community forum! This is a place where students can:</p>
                <ul>
                    <li>Ask questions and get help from peers and instructors</li>
                    <li>Share your projects and achievements</li>
                    <li>Discuss Python programming topics</li>
                    <li>Share learning resources and tips</li>
                </ul>
                <p><strong>Community Guidelines:</strong></p>
                <ol>
                    <li>Be respectful and constructive</li>
                    <li>Stay on topic</li>
                    <li>Search before posting</li>
                    <li>Help others when you can</li>
                </ol>
                <p>Happy learning! 🚀</p>',
                'category' => 'announcements',
                'is_pinned' => true,
            ],
            [
                'title' => '📢 New Python Course Released: Advanced OOP',
                'content' => '<p>We are excited to announce a new advanced course on Object-Oriented Programming in Python!</p>
                <p><strong>Course Highlights:</strong></p>
                <ul>
                    <li>Design Patterns in Python</li>
                    <li>SOLID Principles</li>
                    <li>Abstract Classes and Interfaces</li>
                    <li>Metaclasses and Descriptors</li>
                </ul>
                <p>Enroll now and take your Python skills to the next level!</p>',
                'category' => 'announcements',
                'is_pinned' => true,
            ],
        ];

        foreach ($announcements as $data) {
            $post = ForumPost::create(array_merge($data, [
                'user_id' => $admin->user_Id ?? $admin->id,
                'views' => rand(100, 500),
            ]));

            // 添加一些回复
            for ($i = 0; $i < rand(3, 8); $i++) {
                $student = $students->random();
                ForumReply::create([
                    'post_id' => $post->post_id,
                    'user_id' => $student->user_Id ?? $student->id,
                    'content' => $this->getRandomReplyContent(),
                ]);
            }

            // 添加点赞
            $this->addRandomLikes($post, $students);
        }

        // ==================== Help 类别 ====================
        $helpPosts = [
            [
                'title' => 'How do I fix "IndentationError" in Python?',
                'content' => '<p>I keep getting this error when running my code:</p>
                <code>IndentationError: expected an indented block</code>
                <p>Here is my code:</p>
                <pre>
def greet():
print("Hello")
                </pre>
                <p>What am I doing wrong? Please help!</p>',
                'category' => 'help',
            ],
            [
                'title' => 'Understanding List Comprehensions',
                'content' => '<p>Can someone explain list comprehensions in simple terms?</p>
                <p>I understand for loops, but list comprehensions confuse me.</p>
                <p>For example, what does this do?</p>
                <code>squares = [x**2 for x in range(10)]</code>',
                'category' => 'help',
            ],
            [
                'title' => 'Best way to read files in Python?',
                'content' => '<p>I need to read a large CSV file in Python. What is the best approach?</p>
                <p>Should I use:</p>
                <ul>
                    <li>Built-in open() function</li>
                    <li>pandas library</li>
                    <li>csv module</li>
                </ul>
                <p>Which is most efficient for large files?</p>',
                'category' => 'help',
            ],
        ];

        foreach ($helpPosts as $data) {
            $student = $students->random();
            $post = ForumPost::create(array_merge($data, [
                'user_id' => $student->user_Id ?? $student->id,
                'views' => rand(50, 200),
            ]));

            // 添加有用的回复
            $helpfulReplies = [
                '<p>The issue is with indentation. In Python, you need to indent the code inside functions:</p>
                <pre>
def greet():
    print("Hello")  # Add 4 spaces or 1 tab
                </pre>',
                '<p>List comprehensions are just a shorter way to create lists. This:</p>
                <code>squares = [x**2 for x in range(10)]</code>
                <p>is the same as:</p>
                <pre>
squares = []
for x in range(10):
    squares.append(x**2)
                </pre>',
                '<p>For large CSV files, I recommend using pandas:</p>
                <pre>
import pandas as pd
df = pd.read_csv("file.csv", chunksize=1000)
                </pre>
                <p>The chunksize parameter helps process large files efficiently.</p>',
            ];

            foreach ($helpfulReplies as $index => $content) {
                $replier = $students->where('user_Id', '!=', ($student->user_Id ?? $student->id))->random();
                $reply = ForumReply::create([
                    'post_id' => $post->post_id,
                    'user_id' => $replier->user_Id ?? $replier->id,
                    'content' => $content,
                ]);

                // 第一个回复标记为最佳答案
                if ($index === 0) {
                    $reply->markAsSolution();
                }

                // 添加点赞
                $this->addRandomReplyLikes($reply, $students);
            }

            $this->addRandomLikes($post, $students);
        }

        // ==================== Showcase 类别 ====================
        $showcasePosts = [
            [
                'title' => '🎨 My First Python Game - Snake!',
                'content' => '<p>I just finished building a Snake game using Pygame! 🐍</p>
                <p><strong>Features:</strong></p>
                <ul>
                    <li>Smooth controls</li>
                    <li>Score tracking</li>
                    <li>Increasing difficulty</li>
                    <li>Game over screen</li>
                </ul>
                <p>It took me 2 weeks but I learned so much about game loops and collision detection!</p>
                <p>What should I build next?</p>',
                'category' => 'showcase',
            ],
            [
                'title' => '📊 Weather Dashboard with Python & Flask',
                'content' => '<p>Created a weather dashboard that shows real-time weather data!</p>
                <p><strong>Tech Stack:</strong></p>
                <ul>
                    <li>Flask for backend</li>
                    <li>OpenWeather API</li>
                    <li>Chart.js for visualizations</li>
                    <li>Bootstrap for UI</li>
                </ul>
                <p>Check out the features:</p>
                <ul>
                    <li>Current weather conditions</li>
                    <li>5-day forecast</li>
                    <li>Temperature graphs</li>
                    <li>Multiple city support</li>
                </ul>',
                'category' => 'showcase',
            ],
        ];

        foreach ($showcasePosts as $data) {
            $student = $students->random();
            $post = ForumPost::create(array_merge($data, [
                'user_id' => $student->user_Id ?? $student->id,
                'views' => rand(100, 300),
            ]));

            // 添加鼓励性回复
            $encouragingReplies = [
                '<p>This is amazing! Great work! 🎉</p>',
                '<p>Wow, this looks professional! How long did it take you?</p>',
                '<p>Love it! Can you share the source code?</p>',
                '<p>This inspired me to build something similar. Thanks for sharing!</p>',
            ];

            for ($i = 0; $i < rand(3, 6); $i++) {
                $replier = $students->where('user_Id', '!=', ($student->user_Id ?? $student->id))->random();
                ForumReply::create([
                    'post_id' => $post->post_id,
                    'user_id' => $replier->user_Id ?? $replier->id,
                    'content' => $encouragingReplies[array_rand($encouragingReplies)],
                ]);
            }

            $this->addRandomLikes($post, $students);
        }

        // ==================== Resources 类别 ====================
        $resourcePosts = [
            [
                'title' => '📚 Best Python Learning Resources',
                'content' => '<p>Here are some great resources I found helpful:</p>
                <p><strong>Free Resources:</strong></p>
                <ul>
                    <li>Python.org Official Tutorial</li>
                    <li>Real Python (website)</li>
                    <li>Automate the Boring Stuff with Python (book)</li>
                    <li>Corey Schafer YouTube Channel</li>
                </ul>
                <p><strong>Practice Platforms:</strong></p>
                <ul>
                    <li>LeetCode</li>
                    <li>HackerRank</li>
                    <li>Codewars</li>
                    <li>Project Euler</li>
                </ul>',
                'category' => 'resources',
            ],
            [
                'title' => '🛠️ Essential Python Libraries Every Developer Should Know',
                'content' => '<p>Here is my curated list of must-know Python libraries:</p>
                <p><strong>Data Science:</strong></p>
                <ul>
                    <li>NumPy - Numerical computing</li>
                    <li>Pandas - Data manipulation</li>
                    <li>Matplotlib - Data visualization</li>
                    <li>Scikit-learn - Machine learning</li>
                </ul>
                <p><strong>Web Development:</strong></p>
                <ul>
                    <li>Django - Full-stack framework</li>
                    <li>Flask - Micro framework</li>
                    <li>FastAPI - Modern API framework</li>
                    <li>Requests - HTTP library</li>
                </ul>',
                'category' => 'resources',
            ],
        ];

        foreach ($resourcePosts as $data) {
            $student = $students->random();
            $post = ForumPost::create(array_merge($data, [
                'user_id' => $student->user_Id ?? $student->id,
                'views' => rand(150, 400),
            ]));

            // 添加感谢回复
            for ($i = 0; $i < rand(5, 10); $i++) {
                $replier = $students->where('user_Id', '!=', ($student->user_Id ?? $student->id))->random();
                ForumReply::create([
                    'post_id' => $post->post_id,
                    'user_id' => $replier->user_Id ?? $replier->id,
                    'content' => '<p>Thanks for sharing! This is really helpful! 🙏</p>',
                ]);
            }

            $this->addRandomLikes($post, $students);
            $this->addRandomFavorites($post, $students);
        }

        // ==================== General 类别 ====================
        $generalPosts = [
            [
                'title' => '💬 What motivated you to learn Python?',
                'content' => '<p>I am curious about what brought everyone here!</p>
                <p>For me, it was wanting to automate boring tasks at work. What about you?</p>',
                'category' => 'general',
            ],
            [
                'title' => '🎯 What are your Python learning goals for this month?',
                'content' => '<p>Let\'s share our goals and keep each other accountable!</p>
                <p>My goals:</p>
                <ul>
                    <li>Complete the OOP course</li>
                    <li>Build a small web app with Flask</li>
                    <li>Practice algorithms on LeetCode</li>
                </ul>',
                'category' => 'general',
            ],
        ];

        foreach ($generalPosts as $data) {
            $student = $students->random();
            $post = ForumPost::create(array_merge($data, [
                'user_id' => $student->user_Id ?? $student->id,
                'views' => rand(80, 250),
            ]));

            // 添加各种回复
            for ($i = 0; $i < rand(4, 8); $i++) {
                $replier = $students->where('user_Id', '!=', ($student->user_Id ?? $student->id))->random();
                ForumReply::create([
                    'post_id' => $post->post_id,
                    'user_id' => $replier->user_Id ?? $replier->id,
                    'content' => $this->getRandomGeneralReply(),
                ]);
            }

            $this->addRandomLikes($post, $students);
        }

        // ==================== Feedback 类别 ====================
        $feedbackPost = ForumPost::create([
            'user_id' => $students->random()->user_Id ?? $students->random()->id,
            'title' => '💡 Suggestion: Add Dark Mode to the Platform',
            'content' => '<p>Would it be possible to add a dark mode option to the learning platform?</p>
            <p>It would be easier on the eyes during night study sessions. 🌙</p>
            <p>What do you all think?</p>',
            'category' => 'feedback',
            'views' => rand(100, 200),
        ]);

        // 添加反馈回复
        ForumReply::create([
            'post_id' => $feedbackPost->post_id,
            'user_id' => $admin->user_Id ?? $admin->id,
            'content' => '<p>Great suggestion! We are actually working on this feature. It should be available next month! 👍</p>',
        ]);

        $this->addRandomLikes($feedbackPost, $students);

        $this->command->info('Forum seeder completed successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . ForumPost::count() . ' posts');
        $this->command->info('- ' . ForumReply::count() . ' replies');
        $this->command->info('- ' . ForumPostLike::count() . ' post likes');
        $this->command->info('- ' . ForumReplyLike::count() . ' reply likes');
        $this->command->info('- ' . ForumFavorite::count() . ' favorites');
    }

    /**
     * 添加随机点赞到帖子
     */
    private function addRandomLikes($post, $students)
    {
        $likeCount = rand(5, 15);
        $likers = $students->random(min($likeCount, $students->count()));

        foreach ($likers as $liker) {
            ForumPostLike::create([
                'user_id' => $liker->user_Id ?? $liker->id,
                'post_id' => $post->post_id,
            ]);
        }
    }

    /**
     * 添加随机点赞到回复
     */
    private function addRandomReplyLikes($reply, $students)
    {
        $likeCount = rand(2, 8);
        $likers = $students->random(min($likeCount, $students->count()));

        foreach ($likers as $liker) {
            ForumReplyLike::create([
                'user_id' => $liker->user_Id ?? $liker->id,
                'reply_id' => $reply->reply_id,
            ]);
        }
    }

    /**
     * 添加随机收藏
     */
    private function addRandomFavorites($post, $students)
    {
        $favoriteCount = rand(3, 8);
        $favoriters = $students->random(min($favoriteCount, $students->count()));

        foreach ($favoriters as $favoriter) {
            ForumFavorite::create([
                'user_id' => $favoriter->user_Id ?? $favoriter->id,
                'post_id' => $post->post_id,
            ]);
        }
    }

    /**
     * 获取随机回复内容
     */
    private function getRandomReplyContent()
    {
        $replies = [
            '<p>Thanks for sharing this! Very helpful! 👍</p>',
            '<p>Great post! I learned something new today.</p>',
            '<p>This is exactly what I was looking for!</p>',
            '<p>Awesome! Keep up the great work!</p>',
            '<p>Very informative. Thank you!</p>',
            '<p>I agree with this completely!</p>',
            '<p>Good point! I never thought about it that way.</p>',
        ];

        return $replies[array_rand($replies)];
    }

    /**
     * 获取随机通用回复
     */
    private function getRandomGeneralReply()
    {
        $replies = [
            '<p>I wanted to learn Python for data science!</p>',
            '<p>My goal is to become a full-stack developer.</p>',
            '<p>I am learning Python to automate my workflow.</p>',
            '<p>Python seems like a great first programming language!</p>',
            '<p>I want to build web applications with Django.</p>',
            '<p>Machine learning brought me to Python!</p>',
            '<p>I am transitioning from JavaScript to Python.</p>',
        ];

        return $replies[array_rand($replies)];
    }
}
