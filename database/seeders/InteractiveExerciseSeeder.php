<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InteractiveExercise;

class InteractiveExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            // 课程1: Python 基础变量 - 拖拽游戏
            [
                'lesson_id' => 1,
                'title' => '变量类型配对游戏',
                'description' => '将变量拖拽到正确的数据类型区域',
                'exercise_type' => 'drag_drop',
                'max_score' => 100,
                'time_limit_sec' => 300,
                'is_active' => true,
                'content' => [
                    'game_type' => 'drag_drop',
                    'instructions' => '拖拽下面的变量到正确的数据类型区域',
                    'items' => [
                        ['id' => 1, 'text' => 'name = "Alice"', 'correct_zone' => 'string'],
                        ['id' => 2, 'text' => 'age = 25', 'correct_zone' => 'number'],
                        ['id' => 3, 'text' => 'is_student = True', 'correct_zone' => 'boolean'],
                        ['id' => 4, 'text' => 'height = 5.8', 'correct_zone' => 'number'],
                        ['id' => 5, 'text' => 'city = "Kuala Lumpur"', 'correct_zone' => 'string'],
                    ],
                    'drop_zones' => [
                        ['id' => 'string', 'name' => '字符串 (String)', 'color' => '#3B82F6'],
                        ['id' => 'number', 'name' => '数字 (Number)', 'color' => '#10B981'],
                        ['id' => 'boolean', 'name' => '布尔值 (Boolean)', 'color' => '#F59E0B'],
                    ],
                    'feedback' => [
                        'correct' => '太棒了！你答对了！',
                        'incorrect' => '再试试看，想想这个值是什么类型的数据？',
                    ]
                ]
            ],

            // 课程2: 条件语句 - 选择冒险游戏
            [
                'lesson_id' => 2,
                'title' => 'if-else 冒险岛',
                'description' => '帮助小猫通过正确的条件判断找到宝藏',
                'exercise_type' => 'adventure_game',
                'max_score' => 150,
                'time_limit_sec' => 600,
                'is_active' => true,
                'content' => [
                    'game_type' => 'adventure',
                    'story' => '小猫咪咪迷路了，需要你的帮助找到回家的路！',
                    'scenarios' => [
                        [
                            'id' => 1,
                            'situation' => '小猫来到一个分岔路口，左边是森林，右边是河流。',
                            'question' => '如果天气晴朗，应该走哪条路？',
                            'code_template' => 'weather = "sunny"\nif weather == "sunny":\n    # 你的选择\nelse:\n    # 另一个选择',
                            'choices' => [
                                ['text' => '走左边森林（print("走森林")）', 'code' => 'print("走森林")', 'correct' => true],
                                ['text' => '走右边河流（print("走河流")）', 'code' => 'print("走河流")', 'correct' => false],
                            ],
                            'explanation' => '晴朗的天气适合走森林小径，可以享受阳光！'
                        ],
                        [
                            'id' => 2,
                            'situation' => '小猫在森林里发现了一个宝箱，但需要密码。',
                            'question' => '如果猫咪的年龄大于5岁，密码是多少？',
                            'code_template' => 'cat_age = 7\nif cat_age > 5:\n    password = ?\nelse:\n    password = ?',
                            'choices' => [
                                ['text' => 'password = "MEOW"', 'code' => 'password = "MEOW"', 'correct' => true],
                                ['text' => 'password = "WOOF"', 'code' => 'password = "WOOF"', 'correct' => false],
                            ],
                            'explanation' => '大猫咪用"MEOW"作密码，小猫咪用"mew"！'
                        ]
                    ]
                ]
            ],

            // 课程3: 循环 - 迷宫游戏
            [
                'lesson_id' => 3,
                'title' => '循环迷宫挑战',
                'description' => '使用 for 循环控制机器人走出迷宫',
                'exercise_type' => 'maze_game',
                'max_score' => 200,
                'time_limit_sec' => 900,
                'is_active' => true,
                'starter_code' => '# 控制机器人的函数\ndef move_robot():\n    # 在这里写你的循环代码\n    pass',
                'solution' => 'def move_robot():\n    for i in range(5):\n        robot.move_forward()\n    robot.turn_right()\n    for i in range(3):\n        robot.move_forward()',
                'content' => [
                    'game_type' => 'maze',
                    'maze_size' => [8, 8],
                    'start_position' => [0, 0],
                    'end_position' => [7, 7],
                    'obstacles' => [
                        [2, 2],
                        [2, 3],
                        [3, 2],
                        [5, 4],
                        [5, 5],
                        [6, 5]
                    ],
                    'robot_commands' => [
                        'robot.move_forward()',
                        'robot.turn_left()',
                        'robot.turn_right()',
                        'robot.pick_treasure()'
                    ],
                    'instructions' => '使用 for 循环让机器人找到宝藏！记住，重复的动作可以用循环简化。',
                    'hints' => [
                        '提示1: range(5) 表示重复5次',
                        '提示2: 可以用多个 for 循环来分段移动',
                        '提示3: 先向右走5步，再向上走3步试试看'
                    ]
                ]
            ],

            // 课程4: 函数 - 拼图游戏
            [
                'lesson_id' => 4,
                'title' => '函数积木拼装',
                'description' => '将函数的各个部分拼装成完整的函数',
                'exercise_type' => 'puzzle_game',
                'max_score' => 120,
                'time_limit_sec' => 450,
                'is_active' => true,
                'content' => [
                    'game_type' => 'code_puzzle',
                    'target_function' => 'greeting',
                    'description' => '创建一个问候函数，输入姓名，输出问候语',
                    'puzzle_pieces' => [
                        ['id' => 1, 'text' => 'def greeting(name):', 'type' => 'function_header', 'order' => 1],
                        ['id' => 2, 'text' => '    return f"Hello, {name}!"', 'type' => 'return_statement', 'order' => 3],
                        ['id' => 3, 'text' => '    message = f"Hello, {name}!"', 'type' => 'variable_assignment', 'order' => 2],
                        ['id' => 4, 'text' => '# 调用函数测试', 'type' => 'comment', 'order' => 4],
                        ['id' => 5, 'text' => 'print(greeting("Alice"))', 'type' => 'function_call', 'order' => 5],
                    ],
                    'expected_output' => 'Hello, Alice!',
                    'explanation' => '函数由三部分组成：定义(def)、处理、返回(return)'
                ]
            ],

            // 课程5: 列表操作 - 收集游戏
            [
                'lesson_id' => 5,
                'title' => '水果收集大师',
                'description' => '帮助小熊收集和整理水果篮',
                'exercise_type' => 'collection_game',
                'max_score' => 180,
                'time_limit_sec' => 720,
                'is_active' => true,
                'content' => [
                    'game_type' => 'collection',
                    'story' => '小熊要为冬天储存食物，帮它收集和整理水果吧！',
                    'initial_basket' => ['apple', 'banana'],
                    'available_fruits' => [
                        ['name' => 'orange', 'points' => 10],
                        ['name' => 'grape', 'points' => 15],
                        ['name' => 'mango', 'points' => 20],
                        ['name' => 'strawberry', 'points' => 12],
                    ],
                    'tasks' => [
                        [
                            'id' => 1,
                            'instruction' => '向篮子添加一个橙子',
                            'code' => 'fruits.append("orange")',
                            'expected_result' => ['apple', 'banana', 'orange'],
                            'points' => 20
                        ],
                        [
                            'id' => 2,
                            'instruction' => '检查篮子里有多少个水果',
                            'code' => 'len(fruits)',
                            'expected_result' => 3,
                            'points' => 15
                        ],
                        [
                            'id' => 3,
                            'instruction' => '移除第一个水果',
                            'code' => 'fruits.pop(0)',
                            'expected_result' => ['banana', 'orange'],
                            'points' => 25
                        ]
                    ],
                    'bonus_challenge' => '使用循环给篮子里的每个水果加上"新鲜的"前缀'
                ]
            ]
        ];

        foreach ($exercises as $exercise) {
            InteractiveExercise::create($exercise);
        }
    }
}
