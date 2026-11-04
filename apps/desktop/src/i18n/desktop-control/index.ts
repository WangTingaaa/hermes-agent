import type { BundledLocale } from '../types'

import type { DesktopControlCopy } from './type'

export const desktopControlCopy: Record<BundledLocale, DesktopControlCopy> = {
  en: {
    completed: 'Task completed',
    ended: 'Task ended',
    failed: 'Task failed',
    viewResult: 'View task result',
    dismiss: 'Dismiss task preview',
    resultHeading: 'Task result',
    noResult: 'The task has ended. Review the activity for details.'
  },
  zh: {
    completed: '任务已完成',
    ended: '任务已结束',
    failed: '任务失败',
    viewResult: '查看任务结果',
    dismiss: '关闭任务浮窗',
    resultHeading: '完成结果',
    noResult: '任务已结束，可查看操作记录了解详情。'
  },
  'zh-hant': {
    completed: '任務已完成',
    ended: '任務已結束',
    failed: '任務失敗',
    viewResult: '查看任務結果',
    dismiss: '關閉任務浮窗',
    resultHeading: '完成結果',
    noResult: '任務已結束，可查看操作記錄了解詳情。'
  },
  ja: {
    completed: 'タスク完了',
    ended: 'タスク終了',
    failed: 'タスク失敗',
    viewResult: 'タスクの結果を表示',
    dismiss: 'タスクプレビューを閉じる',
    resultHeading: '実行結果',
    noResult: 'タスクが終了しました。詳細は操作履歴をご確認ください。'
  },
  fr: {
    completed: 'Tâche terminée',
    ended: 'Tâche arrêtée',
    failed: 'Échec de la tâche',
    viewResult: 'Voir le résultat',
    dismiss: 'Fermer l’aperçu de la tâche',
    resultHeading: 'Résultat',
    noResult: 'La tâche est terminée. Consultez l’activité pour les détails.'
  },
  de: {
    completed: 'Aufgabe abgeschlossen',
    ended: 'Aufgabe beendet',
    failed: 'Aufgabe fehlgeschlagen',
    viewResult: 'Ergebnis ansehen',
    dismiss: 'Aufgabenvorschau schließen',
    resultHeading: 'Ergebnis',
    noResult: 'Die Aufgabe ist beendet. Details stehen im Aktivitätsverlauf.'
  },
  es: {
    completed: 'Tarea completada',
    ended: 'Tarea finalizada',
    failed: 'La tarea falló',
    viewResult: 'Ver el resultado',
    dismiss: 'Cerrar vista de la tarea',
    resultHeading: 'Resultado',
    noResult: 'La tarea ha terminado. Consulta la actividad para ver los detalles.'
  },
  ru: {
    completed: 'Задача завершена',
    ended: 'Задача остановлена',
    failed: 'Ошибка задачи',
    viewResult: 'Посмотреть результат',
    dismiss: 'Закрыть окно задачи',
    resultHeading: 'Результат',
    noResult: 'Задача завершена. Подробности — в истории действий.'
  },
  ar: {
    completed: 'اكتملت المهمة',
    ended: 'انتهت المهمة',
    failed: 'فشلت المهمة',
    viewResult: 'عرض نتيجة المهمة',
    dismiss: 'إغلاق معاينة المهمة',
    resultHeading: 'نتيجة المهمة',
    noResult: 'انتهت المهمة. راجع سجل النشاط للاطلاع على التفاصيل.'
  }
}
