import type { Chapter } from '../types';

export const chapter03: Chapter = {
  id: 'chapter-03',
  act: 1,
  title: '连环计',
  storyIntro:
    '王允设下连环计，要用貂蝉离间董卓和吕布。关键是判断——面对不同的人，说不同的话。' +
    '这就是if/else的精髓！',
  pythonConcept: 'if/elif/else 条件判断',
  difficulty: 3,
  interactionMode: 'fill',
  challenges: [
    {
      id: 'ch03-c1',
      type: 'fill_blank',
      prompt: '判断说话对象！貂蝉要对董卓说好话，在空白处填入正确的人名。',
      codeTemplate:
        'person = "董卓"\n\nif person == "___":\n    print("貂蝉对董卓说：太师英武盖世！")',
      correctAnswer:
        'person = "董卓"\n\nif person == "董卓":\n    print("貂蝉对董卓说：太师英武盖世！")',
      testCases: [
        {
          expectedOutput: '貂蝉对董卓说：太师英武盖世！\n',
          description: '应该输出貂蝉对董卓说的话',
        },
      ],
      hints: [
        '要判断person是不是某个人，==两边应该一样哦',
        'person的值是"董卓"，所以要和"董卓"做比较',
        '填入"董卓"，让if条件成立',
      ],
      qiReward: 30,
      choices: ['董卓', '吕布', '貂蝉'],
    },
    {
      id: 'ch03-c2',
      type: 'fill_blank',
      prompt: '两种情况！如果不是董卓，就说另一番话。在空白处填入正确的关键词。',
      codeTemplate:
        'person = "吕布"\n\nif person == "董卓":\n    print("太师英武盖世！")\n___:\n    print("将军才是真英雄！")',
      correctAnswer:
        'person = "吕布"\n\nif person == "董卓":\n    print("太师英武盖世！")\nelse:\n    print("将军才是真英雄！")',
      testCases: [
        {
          expectedOutput: '将军才是真英雄！\n',
          description: '应该输出"将军才是真英雄！"',
        },
      ],
      hints: [
        '当if条件不成立时，应该走另一条路',
        'Python中"否则"用英文怎么说？',
        '填入"else"——表示"否则"',
      ],
      qiReward: 30,
      choices: ['else', 'elif', 'if'],
    },
    {
      id: 'ch03-c3',
      type: 'fill_blank',
      prompt: '完整的连环计！面对三种不同的人，说三种不同的话。在空白处填入正确的关键词。',
      codeTemplate:
        'person = "王允"\n\nif person == "董卓":\n    print("太师英武盖世！")\nelif person == "吕布":\n    print("将军才是真英雄！")\n___:\n    print("司徒大人，计策已成！")',
      correctAnswer:
        'person = "王允"\n\nif person == "董卓":\n    print("太师英武盖世！")\nelif person == "吕布":\n    print("将军才是真英雄！")\nelse:\n    print("司徒大人，计策已成！")',
      testCases: [
        {
          expectedOutput: '司徒大人，计策已成！\n',
          description: '应该输出"司徒大人，计策已成！"',
        },
      ],
      hints: [
        '前两种情况都判断过了，剩下的所有情况用什么表示？',
        '已经有了if和elif，最后兜底的是什么？',
        '填入"else"——不是董卓也不是吕布，就走else这条路',
      ],
      qiReward: 40,
      choices: ['else', 'elif person == "王允"', 'if'],
    },
  ],
  battle: {
    playerGeneral: 'liu-bei',
    playerSkill: '连环计',
    bgScene: '/assets/scenes/peach-garden.png',
  },
  rewards: {
    xp: 200,
    unlockGenerals: ['diao-chan'],
    quote: '连环计成，天下将变',
  },
};
