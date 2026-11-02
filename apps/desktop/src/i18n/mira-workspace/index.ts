import type { BundledLocale } from '../types'

import type { MiraWorkspaceCopy } from './type'

export const miraWorkspaceCopy: Record<BundledLocale, MiraWorkspaceCopy> = {
  en: {
    eyebrow: 'MIRA AGENT · PERSONAL WORKSPACE',
    title: 'Bring ideas to life, ',
    accent: 'starting now.',
    description: 'Hi, what can Mira help you accomplish today?',
    tasksHeading: 'Meet Mira',
    tasksHint: 'From an idea to a finished result, work alongside an agent that can plan, use tools and create files.',
    tryTask: 'Try this task',
    tasks: {
      code: {
        label: 'Code development',
        detail:
          'Turn a bug or an idea into working code. Mira reads your project, makes changes and checks the result.',
        prompt: 'Help me write or improve this code:'
      },
      files: {
        label: 'File analysis',
        detail:
          'Bring documents and references together. Extract key information, compare sources and get a useful summary.',
        prompt: 'Please help me analyze this file:'
      },
      table: {
        label: 'Create a table',
        detail:
          'Turn raw data into a structured spreadsheet, with calculations and clear results you can keep working with.',
        prompt: 'Organize this data and create a table:'
      },
      research: {
        label: 'Deep research',
        detail: 'Explore a question across sources, compare the evidence and turn findings into a report you can use.',
        prompt: 'Please research this topic in depth:'
      },
      automate: {
        label: 'Automation',
        detail:
          'Describe a recurring workflow. Mira can break it into steps and help you set up tasks to run on a schedule.',
        prompt: 'Help me design a workflow that can run automatically:'
      },
      create: {
        label: 'Content creation',
        detail:
          'Develop an outline into a document, presentation or other deliverable, and refine it through conversation.',
        prompt: 'Organize this content and create a presentation:'
      }
    },
    workspaceLabel: 'Workspace',
    floatComposer: 'Collapse to floating composer',
    dockComposer: 'Restore full composer',
    composerHeading: 'New task',
    composerHint: 'Describe your goal. Mira will plan and execute.',
    capabilitiesHeading: 'Agent capabilities',
    viewAll: 'View all',
    recentHeading: 'Recent artifacts',
    allArtifacts: 'All artifacts',
    recentEmpty: 'Your latest five generated files appear here after your first task.',
    tipLabel: 'MIRA TIP · WORK SMARTER',
    tipTitle: 'Let Mira break down complex goals',
    tipBody:
      'Describe the result you want. Mira will plan the steps, select tools, and keep you informed as the work progresses.',
    footer: 'Mira Agent · Your workspace, one prompt away.',
    capabilities: {
      terminal: {
        label: 'Code & terminal',
        detail: 'Read and write files · Run commands'
      },
      browser: {
        label: 'Browser operations',
        detail: 'Visit websites · Find information'
      },
      files: {
        label: 'File processing',
        detail: 'Parse documents · Generate content'
      },
      skills: {
        label: 'Skills & tools',
        detail: 'Task-specific extensions'
      }
    }
  },
  zh: {
    eyebrow: 'MIRA AGENT · 个人工作台',
    title: '让想法落地，',
    accent: '从现在开始。',
    description: '你好，今天有什么任务需要 Mira 帮你完成？',
    tasksHeading: '认识 Mira',
    tasksHint: '从一个想法到一份成果，Mira 陪你规划、执行，把工作一步步推进。',
    tryTask: '试试这个任务',
    tasks: {
      code: {
        label: '代码开发',
        detail: '从一个想法或报错开始，Mira 会阅读项目、编写和修改代码，并检查结果，帮你把方案变成可用的功能。',
        prompt: '帮我编写或优化这段代码：'
      },
      files: {
        label: '文件分析',
        detail: '把文档与资料交给 Mira，提取关键信息、对比不同内容、整理结论，让零散的信息变得清晰可用。',
        prompt: '请帮我分析这个文件：'
      },
      table: {
        label: '创建表格',
        detail: '把原始数据整理成结构化工作表，完成计算、统计与分析，生成可以继续编辑和使用的表格文件。',
        prompt: '帮我整理这些数据并生成表格：'
      },
      research: {
        label: '深度研究',
        detail: '围绕你的问题检索资料、交叉验证信息，把发现和依据整理成一份可追溯的研究报告。',
        prompt: '请围绕这个主题进行深度研究：'
      },
      automate: {
        label: '自动化任务',
        detail: '描述需要重复完成的工作，Mira 会拆解步骤、调用工具，帮你建立流程，也能配置定时任务。',
        prompt: '请帮我设计一个可以自动执行的工作流程：'
      },
      create: {
        label: '内容创作',
        detail: '从提纲、素材或一句想法出发，协助撰写文档、制作演示文稿，在对话中持续打磨最终成果。',
        prompt: '请帮我整理以下内容并生成一份演示文稿：'
      }
    },
    workspaceLabel: '工作空间',
    floatComposer: '收起为浮动输入框',
    dockComposer: '还原完整输入框',
    composerHeading: '新建任务',
    composerHint: '描述目标，Mira 将规划并执行',
    capabilitiesHeading: 'Agent 能力',
    viewAll: '查看全部',
    recentHeading: '最近产物',
    allArtifacts: '全部产物',
    recentEmpty: '完成第一个任务后，这里会显示最近生成的 5 个文件。',
    tipLabel: 'MIRA TIP · 使用技巧',
    tipTitle: '把复杂目标交给 Mira 拆解',
    tipBody: '直接描述最终想要的结果，Mira 会规划步骤、选择工具，并在执行过程中向你反馈进度。',
    footer: 'Mira Agent · 你的工作空间，一句话开启。',
    capabilities: {
      terminal: {
        label: '代码与终端',
        detail: '读写文件 · 执行命令'
      },
      browser: {
        label: '浏览器操作',
        detail: '网页访问 · 信息检索'
      },
      files: {
        label: '文件处理',
        detail: '文档解析 · 内容生成'
      },
      skills: {
        label: '技能与工具',
        detail: '按任务调用扩展能力'
      }
    }
  },
  'zh-hant': {
    eyebrow: 'MIRA AGENT · 個人工作台',
    title: '讓想法落地，',
    accent: '從現在開始。',
    description: '你好，今天有什麼任務需要 Mira 幫你完成？',
    tasksHeading: '認識 Mira',
    tasksHint: '從一個想法到一份成果，Mira 陪你規劃、執行，逐步推進工作。',
    tryTask: '試試這個任務',
    tasks: {
      code: {
        label: '程式開發',
        detail: '從想法或錯誤開始，閱讀專案、撰寫與修改程式，並檢查結果，將方案變成可用的功能。',
        prompt: '幫我撰寫或最佳化這段程式碼：'
      },
      files: {
        label: '檔案分析',
        detail: '閱讀文件、擷取重點、比較資料，將零散的資訊整理成清楚可用的結論。',
        prompt: '請幫我分析這個檔案：'
      },
      table: {
        label: '建立表格',
        detail: '整理原始資料，完成計算與統計，產生可繼續編輯和使用的試算表。',
        prompt: '幫我整理這些資料並產生表格：'
      },
      research: {
        label: '深度研究',
        detail: '搜尋並交叉驗證資料，將發現和依據整理成可追溯的研究報告。',
        prompt: '請針對這個主題進行深度研究：'
      },
      automate: {
        label: '自動化任務',
        detail: '拆解重複工作的步驟、呼叫工具，協助建立流程與設定排程任務。',
        prompt: '請幫我設計一個可以自動執行的工作流程：'
      },
      create: {
        label: '內容創作',
        detail: '從提綱或素材出發，協助撰寫文件、製作簡報，並在對話中持續完善成果。',
        prompt: '請幫我整理以下內容並產生一份簡報：'
      }
    },
    workspaceLabel: '工作空間',
    floatComposer: '收合為浮動輸入框',
    dockComposer: '還原完整輸入框',
    composerHeading: '新增任務',
    composerHint: '描述目標，Mira 將規劃並執行',
    capabilitiesHeading: 'Agent 能力',
    viewAll: '查看全部',
    recentHeading: '最近產物',
    allArtifacts: '全部產物',
    recentEmpty: '完成第一個任務後，這裡會顯示最近產生的 5 個檔案。',
    tipLabel: 'MIRA TIP · 使用技巧',
    tipTitle: '把複雜目標交給 Mira 拆解',
    tipBody: '直接描述最終想要的結果，Mira 會規劃步驟、選擇工具，並在執行過程中回報進度。',
    footer: 'Mira Agent · 你的工作空間，一句話開啟。',
    capabilities: {
      terminal: {
        label: '程式與終端機',
        detail: '讀寫檔案 · 執行指令'
      },
      browser: {
        label: '瀏覽器操作',
        detail: '網頁存取 · 資訊檢索'
      },
      files: {
        label: '檔案處理',
        detail: '文件解析 · 內容產生'
      },
      skills: {
        label: '技能與工具',
        detail: '依任務呼叫擴充功能'
      }
    }
  },
  ja: {
    eyebrow: 'MIRA AGENT · パーソナルワークスペース',
    title: 'アイデアを形に、',
    accent: '今ここから。',
    description: 'こんにちは。今日はどんなことを Mira と進めますか？',
    tasksHeading: 'Mira について',
    tasksHint: 'アイデアから成果物まで、計画・ツール操作・ファイル作成を一緒に進めます。',
    tryTask: 'このタスクを試す',
    tasks: {
      code: {
        label: 'コード開発',
        detail: 'プロジェクトを読み、コードを書き、修正と検証を通じてアイデアを実装します。',
        prompt: 'このコードの作成または改善を手伝ってください：'
      },
      files: {
        label: 'ファイル分析',
        detail: '文書から重要な情報を抽出し、資料を比較して使いやすい要約に整理します。',
        prompt: 'このファイルを分析してください：'
      },
      table: {
        label: '表を作成',
        detail: 'データを整理して計算・集計し、編集を続けられる表計算ファイルを作成します。',
        prompt: 'このデータを整理して表を作成してください：'
      },
      research: {
        label: '詳細な調査',
        detail: '複数の情報源を調べて根拠を比較し、調査結果をレポートにまとめます。',
        prompt: 'このテーマを詳しく調査してください：'
      },
      automate: {
        label: '自動化',
        detail: '繰り返す仕事を手順に分け、ツールを使ったワークフローや定期タスクの設定を支援します。',
        prompt: '自動実行できるワークフローを設計してください：'
      },
      create: {
        label: 'コンテンツ作成',
        detail: '構成や素材を文書やプレゼンテーションに仕上げ、対話しながら改善します。',
        prompt: 'この内容を整理してプレゼンテーションを作成してください：'
      }
    },
    workspaceLabel: 'ワークスペース',
    floatComposer: 'フローティング入力に縮小',
    dockComposer: '入力欄を元に戻す',
    composerHeading: '新しいタスク',
    composerHint: '目標を伝えると、Mira が計画して実行します',
    capabilitiesHeading: 'Agent の機能',
    viewAll: 'すべて見る',
    recentHeading: '最近の成果物',
    allArtifacts: 'すべての成果物',
    recentEmpty: '最初のタスクが完了すると、直近に生成した5つのファイルを表示します。',
    tipLabel: 'MIRA TIP · 使い方のヒント',
    tipTitle: '複雑な目標の整理は Mira に',
    tipBody: '実現したい結果を伝えてください。Mira が手順を計画し、ツールを選び、進捗をお知らせします。',
    footer: 'Mira Agent · ひと言から始まるワークスペース。',
    capabilities: {
      terminal: {
        label: 'コードとターミナル',
        detail: 'ファイルの読み書き · コマンド実行'
      },
      browser: {
        label: 'ブラウザ操作',
        detail: 'Web 閲覧 · 情報検索'
      },
      files: {
        label: 'ファイル処理',
        detail: '文書の解析 · コンテンツ生成'
      },
      skills: {
        label: 'スキルとツール',
        detail: 'タスクに応じた拡張機能'
      }
    }
  },
  de: {
    eyebrow: 'MIRA AGENT · PERSÖNLICHER ARBEITSPLATZ',
    title: 'Ideen verwirklichen, ',
    accent: 'ab jetzt.',
    description: 'Hallo, wobei kann Mira dir heute helfen?',
    tasksHeading: 'Mira kennenlernen',
    tasksHint: 'Von der Idee zum Ergebnis: Mira plant mit dir, nutzt Werkzeuge und erstellt Dateien.',
    tryTask: 'Diese Aufgabe starten',
    tasks: {
      code: {
        label: 'Entwicklung',
        detail: 'Mira liest dein Projekt, schreibt und verbessert Code und prüft das Ergebnis.',
        prompt: 'Hilf mir, diesen Code zu schreiben oder zu verbessern:'
      },
      files: {
        label: 'Dateianalyse',
        detail: 'Dokumente lesen, wichtige Informationen vergleichen und verständlich zusammenfassen.',
        prompt: 'Bitte analysiere diese Datei:'
      },
      table: {
        label: 'Tabelle erstellen',
        detail: 'Rohdaten strukturieren, berechnen und als bearbeitbare Tabelle aufbereiten.',
        prompt: 'Ordne diese Daten und erstelle eine Tabelle:'
      },
      research: {
        label: 'Recherche',
        detail: 'Quellen recherchieren, Belege vergleichen und Ergebnisse in einem Bericht festhalten.',
        prompt: 'Recherchiere dieses Thema ausführlich:'
      },
      automate: {
        label: 'Automatisierung',
        detail: 'Wiederkehrende Arbeit in Schritte zerlegen und Abläufe sowie geplante Aufgaben einrichten.',
        prompt: 'Hilf mir, einen automatisch ausführbaren Ablauf zu entwerfen:'
      },
      create: {
        label: 'Inhalte erstellen',
        detail: 'Aus Entwürfen Dokumente und Präsentationen erstellen und im Gespräch weiterentwickeln.',
        prompt: 'Ordne diese Inhalte und erstelle eine Präsentation:'
      }
    },
    workspaceLabel: 'Arbeitsplatz',
    floatComposer: 'Zur schwebenden Eingabe verkleinern',
    dockComposer: 'Vollständige Eingabe wiederherstellen',
    composerHeading: 'Neue Aufgabe',
    composerHint: 'Beschreibe dein Ziel. Mira plant und führt es aus.',
    capabilitiesHeading: 'Agent-Funktionen',
    viewAll: 'Alle ansehen',
    recentHeading: 'Letzte Artefakte',
    allArtifacts: 'Alle Artefakte',
    recentEmpty:
      'Zuletzt angesehene Artefakte erscheinen hier. Den vollständigen Verlauf findest du unter Alle Artefakte.',
    tipLabel: 'MIRA TIPP · BESSER ARBEITEN',
    tipTitle: 'Komplexe Ziele in Schritte zerlegen',
    tipBody:
      'Beschreibe dein gewünschtes Ergebnis. Mira plant die Schritte, wählt Werkzeuge und hält dich über den Fortschritt auf dem Laufenden.',
    footer: 'Mira Agent · Dein Arbeitsplatz beginnt mit einer Eingabe.',
    capabilities: {
      terminal: {
        label: 'Code und Terminal',
        detail: 'Dateien bearbeiten · Befehle ausführen'
      },
      browser: {
        label: 'Browser-Steuerung',
        detail: 'Webseiten besuchen · Informationen suchen'
      },
      files: {
        label: 'Dateiverarbeitung',
        detail: 'Dokumente analysieren · Inhalte erzeugen'
      },
      skills: {
        label: 'Skills und Werkzeuge',
        detail: 'Passende Erweiterungen für jede Aufgabe'
      }
    }
  },
  fr: {
    eyebrow: 'MIRA AGENT · ESPACE PERSONNEL',
    title: 'Donnez vie à vos idées, ',
    accent: 'dès maintenant.',
    description: 'Bonjour, que peut faire Mira pour vous aujourd’hui ?',
    tasksHeading: 'Découvrir Mira',
    tasksHint: 'De l’idée au résultat, Mira planifie avec vous, utilise des outils et crée des fichiers.',
    tryTask: 'Essayer cette tâche',
    tasks: {
      code: {
        label: 'Développement',
        detail: 'Mira lit votre projet, écrit et améliore le code, puis vérifie le résultat.',
        prompt: 'Aide-moi à écrire ou améliorer ce code :'
      },
      files: {
        label: 'Analyse de fichiers',
        detail: 'Extraire les informations clés de vos documents, comparer les sources et résumer les conclusions.',
        prompt: 'Analyse ce fichier :'
      },
      table: {
        label: 'Créer un tableau',
        detail: 'Structurer les données, effectuer des calculs et créer un tableur modifiable.',
        prompt: 'Organise ces données et crée un tableau :'
      },
      research: {
        label: 'Recherche approfondie',
        detail: 'Explorer plusieurs sources, comparer les preuves et rassembler les résultats dans un rapport.',
        prompt: 'Fais une recherche approfondie sur ce sujet :'
      },
      automate: {
        label: 'Automatisation',
        detail: 'Décomposer le travail récurrent et vous aider à configurer des processus et des tâches planifiées.',
        prompt: 'Aide-moi à concevoir un processus automatisé :'
      },
      create: {
        label: 'Création de contenu',
        detail: 'Transformer vos idées en documents ou présentations et les affiner au fil de la conversation.',
        prompt: 'Organise ce contenu et crée une présentation :'
      }
    },
    workspaceLabel: 'Espace de travail',
    floatComposer: 'Réduire en saisie flottante',
    dockComposer: 'Restaurer la saisie complète',
    composerHeading: 'Nouvelle tâche',
    composerHint: 'Décrivez votre objectif. Mira planifie et exécute.',
    capabilitiesHeading: 'Capacités de l’agent',
    viewAll: 'Tout voir',
    recentHeading: 'Créations récentes',
    allArtifacts: 'Toutes les créations',
    recentEmpty:
      'Les créations récemment consultées apparaissent ici. Consultez la page des créations pour tout l’historique.',
    tipLabel: 'CONSEIL MIRA · BIEN TRAVAILLER',
    tipTitle: 'Confiez vos objectifs complexes à Mira',
    tipBody:
      'Décrivez le résultat souhaité. Mira planifie les étapes, choisit les outils et vous informe de l’avancement.',
    footer: 'Mira Agent · Votre espace de travail commence par une demande.',
    capabilities: {
      terminal: {
        label: 'Code et terminal',
        detail: 'Lire et écrire des fichiers · Exécuter des commandes'
      },
      browser: {
        label: 'Navigation web',
        detail: 'Visiter des sites · Rechercher des informations'
      },
      files: {
        label: 'Traitement de fichiers',
        detail: 'Analyser des documents · Générer du contenu'
      },
      skills: {
        label: 'Compétences et outils',
        detail: 'Des extensions adaptées à chaque tâche'
      }
    }
  },
  es: {
    eyebrow: 'MIRA AGENT · ESPACIO PERSONAL',
    title: 'Haz realidad tus ideas, ',
    accent: 'desde ahora.',
    description: 'Hola, ¿en qué puede ayudarte Mira hoy?',
    tasksHeading: 'Conoce a Mira',
    tasksHint: 'De la idea al resultado, Mira planifica contigo, utiliza herramientas y crea archivos.',
    tryTask: 'Probar esta tarea',
    tasks: {
      code: {
        label: 'Desarrollo',
        detail: 'Mira lee tu proyecto, escribe y mejora el código y comprueba el resultado.',
        prompt: 'Ayúdame a escribir o mejorar este código:'
      },
      files: {
        label: 'Análisis de archivos',
        detail: 'Extrae información clave de documentos, compara fuentes y organiza las conclusiones.',
        prompt: 'Analiza este archivo:'
      },
      table: {
        label: 'Crear una tabla',
        detail: 'Organiza datos, realiza cálculos y crea hojas de cálculo que puedes seguir editando.',
        prompt: 'Organiza estos datos y crea una tabla:'
      },
      research: {
        label: 'Investigación',
        detail: 'Investiga varias fuentes, contrasta las pruebas y reúne los hallazgos en un informe.',
        prompt: 'Investiga este tema en profundidad:'
      },
      automate: {
        label: 'Automatización',
        detail: 'Divide el trabajo recurrente en pasos y ayuda a configurar flujos y tareas programadas.',
        prompt: 'Ayúdame a diseñar un flujo de trabajo automático:'
      },
      create: {
        label: 'Crear contenido',
        detail: 'Convierte ideas en documentos y presentaciones y mejora el resultado mediante la conversación.',
        prompt: 'Organiza este contenido y crea una presentación:'
      }
    },
    workspaceLabel: 'Espacio de trabajo',
    floatComposer: 'Reducir a entrada flotante',
    dockComposer: 'Restaurar entrada completa',
    composerHeading: 'Nueva tarea',
    composerHint: 'Describe tu objetivo. Mira lo planificará y ejecutará.',
    capabilitiesHeading: 'Capacidades del agente',
    viewAll: 'Ver todo',
    recentHeading: 'Resultados recientes',
    allArtifacts: 'Todos los resultados',
    recentEmpty:
      'Aquí aparecen los resultados vistos recientemente. Consulta la página de resultados para ver todo el historial.',
    tipLabel: 'CONSEJO MIRA · TRABAJA MEJOR',
    tipTitle: 'Deja que Mira divida los objetivos complejos',
    tipBody:
      'Describe el resultado que buscas. Mira planificará los pasos, elegirá herramientas y te informará del progreso.',
    footer: 'Mira Agent · Tu espacio de trabajo empieza con una petición.',
    capabilities: {
      terminal: {
        label: 'Código y terminal',
        detail: 'Leer y escribir archivos · Ejecutar comandos'
      },
      browser: {
        label: 'Navegación web',
        detail: 'Visitar sitios · Buscar información'
      },
      files: {
        label: 'Procesar archivos',
        detail: 'Analizar documentos · Generar contenido'
      },
      skills: {
        label: 'Habilidades y herramientas',
        detail: 'Extensiones adaptadas a cada tarea'
      }
    }
  },
  ru: {
    eyebrow: 'MIRA AGENT · ЛИЧНОЕ ПРОСТРАНСТВО',
    title: 'Воплощайте идеи, ',
    accent: 'начиная сейчас.',
    description: 'Привет! С какой задачей Mira может помочь сегодня?',
    tasksHeading: 'Знакомьтесь: Mira',
    tasksHint: 'От идеи до результата: Mira планирует вместе с вами, использует инструменты и создаёт файлы.',
    tryTask: 'جرّب هذه المهمة',
    tasks: {
      code: {
        label: 'Разработка',
        detail: 'Mira читает проект, пишет и улучшает код и проверяет результат.',
        prompt: 'Помоги написать или улучшить этот код:'
      },
      files: {
        label: 'Анализ файлов',
        detail: 'Извлекает главное из документов, сравнивает источники и обобщает выводы.',
        prompt: 'Проанализируй этот файл:'
      },
      table: {
        label: 'Создать таблицу',
        detail: 'Упорядочивает данные, выполняет расчёты и создаёт редактируемые таблицы.',
        prompt: 'Упорядочи эти данные и создай таблицу:'
      },
      research: {
        label: 'Исследование',
        detail: 'Изучает источники, сопоставляет доказательства и собирает результаты в отчёт.',
        prompt: 'Проведи подробное исследование этой темы:'
      },
      automate: {
        label: 'Автоматизация',
        detail: 'Разбивает повторяющуюся работу на шаги и помогает настроить процессы и задачи по расписанию.',
        prompt: 'Помоги спроектировать автоматический рабочий процесс:'
      },
      create: {
        label: 'Создание контента',
        detail: 'Превращает идеи в документы и презентации и дорабатывает их в диалоге.',
        prompt: 'Упорядочи этот контент и создай презентацию:'
      }
    },
    workspaceLabel: 'Рабочее пространство',
    floatComposer: 'Свернуть в плавающее поле',
    dockComposer: 'Восстановить полное поле ввода',
    composerHeading: 'Новая задача',
    composerHint: 'Опишите цель. Mira спланирует и выполнит задачу.',
    capabilitiesHeading: 'Возможности агента',
    viewAll: 'Все возможности',
    recentHeading: 'Недавние результаты',
    allArtifacts: 'Все результаты',
    recentEmpty: 'Здесь появятся пять последних созданных файлов.',
    tipLabel: 'СОВЕТ MIRA · РАБОТАЙТЕ УДОБНЕЕ',
    tipTitle: 'Доверьте Mira сложную цель',
    tipBody: 'Опишите желаемый результат. Mira спланирует шаги, выберет инструменты и сообщит о ходе работы.',
    footer: 'Mira Agent · Ваше рабочее пространство начинается с запроса.',
    capabilities: {
      terminal: {
        label: 'Код и терминал',
        detail: 'Чтение и запись файлов · Выполнение команд'
      },
      browser: {
        label: 'Управление браузером',
        detail: 'Просмотр сайтов · Поиск информации'
      },
      files: {
        label: 'Обработка файлов',
        detail: 'Анализ документов · Создание контента'
      },
      skills: {
        label: 'Навыки и инструменты',
        detail: 'Расширения под конкретную задачу'
      }
    }
  },
  ar: {
    eyebrow: 'MIRA AGENT · مساحة عمل شخصية',
    title: 'حوّل أفكارك إلى واقع، ',
    accent: 'بدءاً من الآن.',
    description: 'مرحباً، كيف يمكن لـ Mira مساعدتك اليوم؟',
    tasksHeading: 'تعرّف على Mira',
    tasksHint: 'من الفكرة إلى النتيجة، تخطّط Mira معك وتستخدم الأدوات وتنشئ الملفات.',
    tryTask: 'Попробовать задачу',
    tasks: {
      code: {
        label: 'تطوير البرمجيات',
        detail: 'تقرأ Mira مشروعك وتكتب الشيفرة وتحسّنها ثم تتحقق من النتيجة.',
        prompt: 'ساعدني في كتابة هذا الكود أو تحسينه:'
      },
      files: {
        label: 'تحليل الملفات',
        detail: 'استخرج المعلومات الأساسية من المستندات وقارن المصادر ولخّص النتائج.',
        prompt: 'حلّل هذا الملف:'
      },
      table: {
        label: 'إنشاء جدول',
        detail: 'نظّم البيانات وأجرِ الحسابات وأنشئ جداول قابلة للتحرير.',
        prompt: 'نظّم هذه البيانات وأنشئ جدولاً:'
      },
      research: {
        label: 'بحث معمّق',
        detail: 'ابحث في مصادر متعددة وقارن الأدلة واجمع النتائج في تقرير.',
        prompt: 'أجرِ بحثاً معمّقاً حول هذا الموضوع:'
      },
      automate: {
        label: 'الأتمتة',
        detail: 'قسّم العمل المتكرر إلى خطوات وأعدّ مسارات العمل والمهام المجدولة.',
        prompt: 'ساعدني في تصميم سير عمل يعمل تلقائياً:'
      },
      create: {
        label: 'إنشاء المحتوى',
        detail: 'حوّل أفكارك إلى مستندات وعروض تقديمية وحسّنها عبر الحوار.',
        prompt: 'نظّم هذا المحتوى وأنشئ عرضاً تقديمياً:'
      }
    },
    workspaceLabel: 'مساحة العمل',
    floatComposer: 'تصغير إلى إدخال عائم',
    dockComposer: 'استعادة الإدخال الكامل',
    composerHeading: 'مهمة جديدة',
    composerHint: 'صِف هدفك. ستخطط Mira للمهمة وتنفذها.',
    capabilitiesHeading: 'قدرات الوكيل',
    viewAll: 'عرض الكل',
    recentHeading: 'مخرجات حديثة',
    allArtifacts: 'كل المخرجات',
    recentEmpty: 'ستظهر هنا أحدث خمسة ملفات تم إنشاؤها.',
    tipLabel: 'نصيحة MIRA · اعمل بذكاء',
    tipTitle: 'دع Mira تقسّم أهدافك المعقدة',
    tipBody: 'صِف النتيجة التي تريدها. ستخطط Mira للخطوات وتختار الأدوات وتطلعك على التقدم.',
    footer: 'Mira Agent · مساحة عملك تبدأ بطلب واحد.',
    capabilities: {
      terminal: {
        label: 'الكود والطرفية',
        detail: 'قراءة الملفات وكتابتها · تنفيذ الأوامر'
      },
      browser: {
        label: 'التحكم بالمتصفح',
        detail: 'زيارة المواقع · البحث عن المعلومات'
      },
      files: {
        label: 'معالجة الملفات',
        detail: 'تحليل المستندات · إنشاء المحتوى'
      },
      skills: {
        label: 'المهارات والأدوات',
        detail: 'إضافات مناسبة لكل مهمة'
      }
    }
  }
}
