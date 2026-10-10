import type { ComposerTranslations } from './types_composer'

export const enPromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: 'Code review',
    description: 'Audit the current change for regressions, dropped edge cases, and missing tests.',
    text: 'Please review this for bugs, regressions, and missing tests.'
  },
  implementationPlan: {
    label: 'Implementation plan',
    description: 'Outline an approach before touching code so the diff stays focused.',
    text: 'Please make a concise implementation plan before changing code.'
  },
  explainThis: {
    label: 'Explain this',
    description: 'Walk through how the selected code works and link to the key files.',
    text: 'Please explain how this works and point me to the key files.'
  }
}

export const zhPromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: '代码审查',
    description: '审查当前更改是否存在回归、遗漏的边界情况和缺失的测试。',
    text: '请审查这部分是否存在缺陷、回归和缺失的测试。'
  },
  implementationPlan: {
    label: '实现计划',
    description: '在动代码之前先勾勒方案，让 diff 保持聚焦。',
    text: '请在修改代码前制定一个简洁的实现计划。'
  },
  explainThis: {
    label: '解释这段',
    description: '讲解所选代码的工作方式，并链接到关键文件。',
    text: '请解释这是如何工作的，并指给我关键文件。'
  }
}

export const dePromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: 'Code-Review',
    description: 'Prüft die aktuelle Änderung auf Regressionen, übersehene Randfälle und fehlende Tests.',
    text: 'Bitte prüfe dies auf Bugs, Regressionen und fehlende Tests.'
  },
  implementationPlan: {
    label: 'Implementierungsplan',
    description: 'Skizziert einen Ansatz, bevor Code angefasst wird, damit der Diff fokussiert bleibt.',
    text: 'Bitte erstelle einen prägnanten Implementierungsplan, bevor du Code änderst.'
  },
  explainThis: {
    label: 'Erkläre dies',
    description: 'Erklärt, wie der ausgewählte Code funktioniert, und verlinkt die wichtigsten Dateien.',
    text: 'Bitte erkläre, wie das funktioniert, und zeige mir die Schlüsseldateien.'
  }
}

export const esPromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: 'Revisión de código',
    description: 'Audita el cambio actual en busca de regresiones, casos límite omitidos y pruebas faltantes.',
    text: 'Revisa esto para detectar bugs, regresiones y pruebas faltantes.'
  },
  implementationPlan: {
    label: 'Plan de implementación',
    description: 'Esboza un enfoque antes de tocar código para mantener el diff enfocado.',
    text: 'Haz un plan de implementación conciso antes de cambiar código.'
  },
  explainThis: {
    label: 'Explica esto',
    description: 'Recorre cómo funciona el código seleccionado y enlaza los archivos clave.',
    text: 'Explica cómo funciona esto y señala los archivos clave.'
  }
}

export const frPromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: 'Revue de code',
    description:
      'Audit des modifications actuelles à la recherche de régressions, de cas limites oubliés et de tests manquants.',
    text: 'Veuillez examiner cela à la recherche de bugs, de régressions et de tests manquants.'
  },
  implementationPlan: {
    label: "Plan d'implémentation",
    description: 'Élaborez une approche avant de toucher au code pour que la différence reste ciblée.',
    text: "Veuillez élaborer un plan d'implémentation concis avant de modifier le code."
  },
  explainThis: {
    label: 'Expliquez ceci',
    description: 'Parcourez comment le code sélectionné fonctionne et liez les fichiers clés.',
    text: 'Veuillez expliquer comment cela fonctionne et pointez-moi vers les fichiers clés.'
  }
}

export const jaPromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: 'コードレビュー',
    description: '回帰、エッジケースの欠落、テストの欠如を確認します。',
    text: 'バグ、回帰、テストの欠如を確認してください。'
  },
  implementationPlan: {
    label: '実装計画',
    description: 'コードに手をつける前にアプローチを概説して、差分を集中させます。',
    text: 'コードを変更する前に簡潔な実装計画を立ててください。'
  },
  explainThis: {
    label: 'これを説明する',
    description: '選択したコードがどのように機能するかを説明し、主要なファイルにリンクします。',
    text: 'これがどのように機能するか説明し、主要なファイルを教えてください。'
  }
}

export const ruPromptSnippets: ComposerTranslations['snippets'] = {
  codeReview: {
    label: 'Рецензия кода',
    description: 'Аудит текущих изменений на предмет регрессий, упущенных граничных случаев и недостающих тестов.',
    text: 'Пожалуйста, проверьте это на баги, регрессии и недостающие тесты.'
  },
  implementationPlan: {
    label: 'План реализации',
    description: 'Опишите подход перед правкой кода, чтобы diff остался сфокусированным.',
    text: 'Пожалуйста, составьте краткий план реализации перед изменением кода.'
  },
  explainThis: {
    label: 'Объяснить это',
    description: 'Разберите, как работает выделенный код, и дайте ссылки на ключевые файлы.',
    text: 'Пожалуйста, объясните, как это работает, и укажите ключевые файлы.'
  }
}
